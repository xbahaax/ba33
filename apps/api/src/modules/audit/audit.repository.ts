import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { audits, reconciliations } from '../../common/database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class AuditRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async create(data: {
    id: string;
    auditType: 'entry_e1' | 'exit_s1' | 'internal_ex' | 'internal_sx' | 'reconciliation';
    subjectType: string;
    subjectId: string;
    findings: Record<string, unknown>;
    passed: boolean;
    auditorId: string;
    performedAt: Date;
  }) {
    const [row] = await this.db
      .insert(audits)
      .values(data)
      .returning();
    return row;
  }

  async findBySubject(subjectType: string, subjectId: string) {
    return this.db
      .select()
      .from(audits)
      .where(
        and(
          eq(audits.subjectType, subjectType),
          eq(audits.subjectId, subjectId),
        ),
      )
      .orderBy(desc(audits.performedAt));
  }

  async findAll(filters?: { subjectType?: string; auditorId?: string }) {
    const conditions = [];
    if (filters?.subjectType) {
      conditions.push(eq(audits.subjectType, filters.subjectType));
    }
    if (filters?.auditorId) {
      conditions.push(eq(audits.auditorId, filters.auditorId));
    }

    const query = this.db
      .select()
      .from(audits)
      .orderBy(desc(audits.performedAt));

    if (conditions.length > 0) {
      return query.where(and(...conditions));
    }

    return query;
  }

  async createReconciliation(data: {
    id: string;
    lotId: string;
    phaseFrom: string;
    phaseTo: string;
    weightOutKg: string;
    weightInKg: string;
    deltaKg: string;
    toleranceKg: string;
    withinTolerance: boolean;
    flagged: boolean;
    computedAt: Date;
  }) {
    const [row] = await this.db
      .insert(reconciliations)
      .values(data)
      .returning();
    return row;
  }

  async findReconciliationsByLot(lotId: string) {
    return this.db
      .select()
      .from(reconciliations)
      .where(eq(reconciliations.lotId, lotId))
      .orderBy(desc(reconciliations.computedAt));
  }
}
