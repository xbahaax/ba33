import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { audits, reconciliations } from '../../common/database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class AuditRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}
}
