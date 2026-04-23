import { Injectable } from '@nestjs/common';
import { UauditRepository } from './audit.repository';

@Injectable()
export class UauditService {
  constructor(private readonly auditRepository: UauditRepository) {}
}
