import { Injectable } from '@nestjs/common';
import { IssueCertificationDto } from './dto/issue-certification.dto';
import { RevokeCertificationDto } from './dto/revoke-certification.dto';
import { CertificationRepository } from './certification.repository';

@Injectable()
export class CertificationService {
  constructor(private readonly certificationRepository: CertificationRepository) {}

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
}
