import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

@Injectable()
export class DepotRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}
}
