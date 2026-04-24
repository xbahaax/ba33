import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  preLots,
  collectors,
  collectorBooklets,
  routes,
  routeStops,
  sources,
  shepherds,
  users,
  depots,
} from '../../common/database/schema';
import { eq, and, desc, lt, inArray } from 'drizzle-orm';

@Injectable()
export class CollectionRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}
}
