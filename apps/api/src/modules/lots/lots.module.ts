import { Module } from '@nestjs/common';
import { LotsController } from './lots.controller';
import { LotsService } from './lots.service';
import { LotsRepository } from './lots.repository';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TransportRepository } from '../transport/transport.repository';
import { DepotRepository } from '../depot/depot.repository';

@Module({
  imports: [EventsModule, NotificationsModule],
  controllers: [LotsController],
  providers: [LotsService, LotsRepository, TransportRepository, DepotRepository],
  exports: [LotsService],
})
export class LotsModule {}
