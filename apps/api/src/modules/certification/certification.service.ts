import { Injectable } from '@nestjs/common';
import { IssueCertificationDto } from './dto/issue-certification.dto';
import { RevokeCertificationDto } from './dto/revoke-certification.dto';
import { CertificationRepository } from './certification.repository';
import { SalesService } from '../sales/sales.service';

@Injectable()
export class CertificationService {
  constructor(
    private readonly certificationRepository: CertificationRepository,
    private readonly salesService: SalesService,
  ) {}

  getOverview() {
    return this.certificationRepository.getOverview();
  }

  issue(
    certificationId: string,
    input: IssueCertificationDto,
    actorId: string,
    actorType: string,
  ) {
    return this.certificationRepository.issue(
      certificationId,
      input.force ?? false,
      actorId,
      actorType,
    );
  }

  revoke(
    certificationId: string,
    input: RevokeCertificationDto,
    actorId: string,
    actorType: string,
  ) {
    return this.certificationRepository.revoke(
      certificationId,
      input.reason,
      actorId,
      actorType,
    );
  }

  async verifyByCode(code: string) {
    const product = await this.salesService.findProductByCertificate(code);

    if (!product) {
      return {
        code,
        status: 'not_found' as const,
      };
    }

    const valid = product.nfnSealStatus === 'certified';

    return {
      code: product.nfnSealCode ?? product.code,
      status: valid ? ('valid' as const) : ('revoked' as const),
      productId: product.id,
      productType: product.type,
      grade: product.grade,
      originRegion: product.region,
      certifiedAt: product.nfnCertifiedAt,
      nfnSealId: product.nfnSealCode,
      traceabilitySummary: {
        sourceCount: 1,
        collectionDate: product.traceability.collectionEvent.collectedAt,
        washingYieldPercent: product.traceability.laverieD2Event.yieldPercent,
        auditsPassed: valid ? ['E1', 'S2', 'S3', 'NFN'] : ['E1'],
      },
    };
  }

  async verifyByQrHash(qrHash: string) {
    return this.verifyByCode(qrHash);
  }
}
