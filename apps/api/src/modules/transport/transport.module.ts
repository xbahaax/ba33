import { Module } from '@nestjs/common';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';
import { TransportRepository } from './transport.repository';
import { EventsModule } from '../events/events.module';
import { RulesModule } from '../rules/rules.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EventsModule, RulesModule, NotificationsModule],
  controllers: [TransportController],
  providers: [TransportService, TransportRepository],
  exports: [TransportService],
})
export class TransportModule {}
