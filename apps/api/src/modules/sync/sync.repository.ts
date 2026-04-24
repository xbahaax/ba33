import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { syncDevices, syncBatches } from '../../common/database/schema';
import { eq, desc, gt } from 'drizzle-orm';

@Injectable()
export class SyncRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}
}
