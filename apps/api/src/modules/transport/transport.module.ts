import { Module } from '@nestjs/common';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';
import { TransportRepository } from './transport.repository';
import { EventsModule } from '../events/events.module';
import { RulesModule } from '../rules/rules.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LotsModule } from '../lots/lots.module';
import { DepotModule } from '../depot/depot.module';

@Module({
  imports: [EventsModule, RulesModule, NotificationsModule, LotsModule, DepotModule],
  controllers: [TransportController],
  providers: [TransportService, TransportRepository],
  exports: [TransportService, TransportRepository],
})
export class TransportModule {}
