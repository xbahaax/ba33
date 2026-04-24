import { Injectable } from '@nestjs/common';
import { CertificationRepository } from './certification.repository';
import { SalesService } from '../sales/sales.service';

@Injectable()
export class CertificationService {
  constructor(
    private readonly certificationRepository: CertificationRepository,
    private readonly salesService: SalesService,
  ) {}

  verifyByCode(code: string) {
    const product = this.salesService.findProductByCertificate(code);

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

  verifyByQrHash(qrHash: string) {
    return this.verifyByCode(qrHash);
  }
}
