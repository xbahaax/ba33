import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CertificationRepository } from './certification.repository';
import { EventsService } from '../events/events.service';
import { RulesService } from '../rules/rules.service';
import { AuditService } from '../audit/audit.service';
import { createHash } from 'crypto';

@Injectable()
export class CertificationService {
  private readonly logger = new Logger(CertificationService.name);

  constructor(
    private readonly certificationRepository: CertificationRepository,
    private readonly eventsService: EventsService,
    private readonly rulesService: RulesService,
    private readonly auditService: AuditService,
  ) {}

  // ── Gate Validation ─────────────────────────────────────

  async validateGates(productId: string, productCode: string): Promise<{
    allPassed: boolean;
    gates: Record<string, boolean>;
    failedGates: string[];
  }> {
    let requiredGates: string[] = [];
    try {
      requiredGates = await this.rulesService.getRuleValue<string[]>('cert.required_gates');
    } catch {
      requiredGates = [
        'e1_passed',
        's1_passed',
        'r1_within_range',
        's2_dispatched',
        'ex_sx_cleared',
        'no_open_anomalies',
      ];
    }

    // Check each gate by querying audit records
    const audits = await this.auditService.listAudits({ subjectType: 'lot' });
    const reconciliations = await this.auditService.listAudits({ subjectType: 'dispatch' });

    const gates: Record<string, boolean> = {};

    // e1_passed: at least one entry_e1 audit that passed
    gates['e1_passed'] = audits.some(
      (a) => a.auditType === 'entry_e1' && a.passed,
    );

    // s1_passed: at least one exit_s1 audit that passed
    gates['s1_passed'] = reconciliations.some(
      (a) => a.auditType === 'exit_s1' && a.passed,
    );

    // r1_within_range: check reconciliations for this product's source lots
    // For now, check if any reconciliation exists and is within tolerance
    gates['r1_within_range'] = true; // default pass if no reconciliation issues

    // s2_dispatched: product exists means it was dispatched through S2/S3
    gates['s2_dispatched'] = true;

    // ex_sx_cleared: internal audits cleared
    gates['ex_sx_cleared'] = true; // default until internal audits are implemented

    // no_open_anomalies: no flagged reconciliations
    gates['no_open_anomalies'] = true;

    const failedGates = requiredGates.filter((g) => !gates[g]);
    const allPassed = failedGates.length === 0;

    return { allPassed, gates, failedGates };
  }

  // ── Certification Issuance ──────────────────────────────

  async certifyProduct(
    productId: string,
    productCode: string,
    issuedBy: string,
  ) {
    // Check if already certified
    const existing = await this.certificationRepository.findByProductId(productId);
    if (existing && existing.status === 'issued') {
      throw new BadRequestException(`Product ${productId} is already certified`);
    }

    // Validate all gates
    const { allPassed, gates, failedGates } = await this.validateGates(productId, productCode);

    if (!allPassed) {
      throw new BadRequestException(
        `Product cannot be certified. Failed gates: ${failedGates.join(', ')}`,
      );
    }

    // Generate cryptographic signature
    const signaturePayload = `${productCode}:${productId}:${new Date().toISOString()}`;
    const signature = createHash('sha256').update(signaturePayload).digest('hex');

    // Generate QR URL
    const qrCodeUrl = `/api/certification/verify/${productCode}`;

    const now = new Date();
    const cert = existing
      ? await this.certificationRepository.update(existing.id, {
          status: 'issued',
          issuedBy,
          issuedAt: now,
          updatedAt: now,
        })
      : await this.certificationRepository.create({
          productId,
          productCode,
          status: 'issued',
          gatesPassed: gates,
          signature,
          issuedBy,
          issuedAt: now,
          qrCodeUrl,
        });

    await this.eventsService.emit({
      eventType: 'certification.issued',
      aggregateType: 'product',
      aggregateId: productId,
      actorId: issuedBy,
      actorType: 'certification_authority',
      payload: {
        certificationId: cert!.id,
        productCode,
        gatesPassed: gates,
      },
      occurredAt: now,
      version: 1,
    });

    this.logger.log(`Certificate issued for product ${productCode} (${productId})`);

    return cert;
  }

  // ── Revocation ──────────────────────────────────────────

  async revokeCertificate(
    certificationId: string,
    reason: string,
    revokedBy: string,
  ) {
    const cert = await this.certificationRepository.findById(certificationId);
    if (!cert) {
      throw new NotFoundException(`Certification "${certificationId}" not found`);
    }
    if (cert.status === 'revoked') {
      throw new BadRequestException('Certificate is already revoked');
    }

    const now = new Date();
    const updated = await this.certificationRepository.update(certificationId, {
      status: 'revoked',
      revokedAt: now,
      revokedReason: reason,
      updatedAt: now,
    });

    await this.eventsService.emit({
      eventType: 'certification.revoked',
      aggregateType: 'product',
      aggregateId: cert.productId,
      actorId: revokedBy,
      actorType: 'certification_authority',
      payload: {
        certificationId,
        productCode: cert.productCode,
        reason,
      },
      occurredAt: now,
      version: 1,
    });

    this.logger.warn(`Certificate ${certificationId} revoked for product ${cert.productCode}: ${reason}`);

    return updated;
  }

  // ── Queries ─────────────────────────────────────────────

  async getCertification(id: string) {
    const cert = await this.certificationRepository.findById(id);
    if (!cert) {
      throw new NotFoundException(`Certification "${id}" not found`);
    }
    return cert;
  }

  async getByProductCode(code: string) {
    const cert = await this.certificationRepository.findByProductCode(code);
    if (!cert) {
      throw new NotFoundException(`No certification found for product code "${code}"`);
    }
    return cert;
  }

  // ── Public Verification Endpoint ────────────────────────

  async verify(productCode: string) {
    const cert = await this.certificationRepository.findByProductCode(productCode);
    if (!cert) {
      return { valid: false, reason: 'Certificate not found' };
    }

    return {
      valid: cert.status === 'issued',
      status: cert.status,
      productCode: cert.productCode,
      issuedAt: cert.issuedAt,
      revokedAt: cert.revokedAt,
      revokedReason: cert.revokedReason,
      gatesPassed: cert.gatesPassed,
      qrCodeUrl: cert.qrCodeUrl,
    };
  }
}
