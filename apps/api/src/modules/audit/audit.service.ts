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
}
