import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { files } from '../../common/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class FilesRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}
}
