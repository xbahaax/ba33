import { Module } from '@nestjs/common';
import { LaverieController } from './laverie.controller';
import { LaverieService } from './laverie.service';
import { LaverieRepository } from './laverie.repository';
import { EventsModule } from '../events/events.module';
import { RulesModule } from '../rules/rules.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LotsModule } from '../lots/lots.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [EventsModule, RulesModule, NotificationsModule, LotsModule, AuditModule],
  controllers: [LaverieController],
  providers: [LaverieService, LaverieRepository],
  exports: [LaverieService],
})
export class LaverieModule {}
