import { Injectable } from '@nestjs/common';
import { UcertificationRepository } from './certification.repository';

@Injectable()
export class UcertificationService {
  constructor(private readonly certificationRepository: UcertificationRepository) {}
}
