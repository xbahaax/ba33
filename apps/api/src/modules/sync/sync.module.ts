import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncRepository } from './sync.repository';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [SyncController],
  providers: [SyncService, SyncRepository],
  exports: [SyncService],
})
export class SyncModule {}
