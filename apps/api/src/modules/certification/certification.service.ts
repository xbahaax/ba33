import { Injectable } from '@nestjs/common';
import { CertificationRepository } from './certification.repository';

@Injectable()
export class CertificationService {
  constructor(private readonly certificationRepository: CertificationRepository) {}

  getOverview() {
    return this.certificationRepository.getOverview();
  }
}
