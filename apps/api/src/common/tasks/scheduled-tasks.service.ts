import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CollectionService } from '../../modules/collection/collection.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(private readonly collectionService: CollectionService) {}

  // Run every hour — expire pre-lots older than 72h
  @Cron(CronExpression.EVERY_HOUR)
  async handlePreLotExpiration() {
    this.logger.log('Running pre-lot expiration check...');
    const result = await this.collectionService.expireStalePreLots(72);
    if (result.count > 0) {
      this.logger.warn(`Expired ${result.count} stale pre-lots: ${result.expired.join(', ')}`);
    }
  }
}
