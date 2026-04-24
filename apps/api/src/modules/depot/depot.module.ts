import { Module } from '@nestjs/common';
import { DepotController } from './depot.controller';
import { DepotService } from './depot.service';
import { DepotRepository } from './depot.repository';
import { EventsModule } from '../events/events.module';
import { RulesModule } from '../rules/rules.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LotsModule } from '../lots/lots.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [EventsModule, RulesModule, NotificationsModule, LotsModule, AuditModule],
  controllers: [DepotController],
  providers: [DepotService, DepotRepository],
  exports: [DepotService],
})
export class DepotModule {}
