import { Injectable, Logger } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditRepository: AuditRepository) {}

  async logAudit(data: {
    auditType: 'entry_e1' | 'exit_s1' | 'internal_ex' | 'internal_sx' | 'reconciliation';
    subjectType: string;
    subjectId: string;
    findings: Record<string, unknown>;
    passed: boolean;
    auditorId: string;
  }) {
    const audit = await this.auditRepository.create({
      id: uuid(),
      ...data,
      performedAt: new Date(),
    });

    this.logger.log(
      `Audit [${data.auditType}] on ${data.subjectType}/${data.subjectId} — ${data.passed ? 'PASSED' : 'FAILED'}`,
    );

    return audit;
  }

  async getSubjectAudits(subjectType: string, subjectId: string) {
    return this.auditRepository.findBySubject(subjectType, subjectId);
  }

  async listAudits(filters?: {
    subjectType?: string;
    auditorId?: string;
  }) {
    return this.auditRepository.findAll(filters);
  }

  // ── Reconciliation ──────────────────────────────────────

  async reconcileWeight(data: {
    lotId: string;
    phaseFrom: string;
    phaseTo: string;
    weightOutKg: number;
    weightInKg: number;
    tolerancePercent: number;
  }) {
    const delta = Math.abs(data.weightInKg - data.weightOutKg);
    const toleranceKg = (data.tolerancePercent / 100) * data.weightOutKg;
    const withinTolerance = delta <= toleranceKg;
    const flagged = !withinTolerance;

    const record = await this.auditRepository.createReconciliation({
      id: uuid(),
      lotId: data.lotId,
      phaseFrom: data.phaseFrom,
      phaseTo: data.phaseTo,
      weightOutKg: data.weightOutKg.toFixed(2),
      weightInKg: data.weightInKg.toFixed(2),
      deltaKg: delta.toFixed(2),
      toleranceKg: toleranceKg.toFixed(2),
      withinTolerance,
      flagged,
      computedAt: new Date(),
    });

    if (flagged) {
      this.logger.warn(
        `Reconciliation FLAGGED for lot ${data.lotId}: ${data.phaseFrom}→${data.phaseTo}, delta ${delta.toFixed(2)}kg (tolerance ${toleranceKg.toFixed(2)}kg)`,
      );
    }

    return record;
  }

  async getLotReconciliations(lotId: string) {
    return this.auditRepository.findReconciliationsByLot(lotId);
  }
}
