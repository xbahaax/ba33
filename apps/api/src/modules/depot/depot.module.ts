import { Module } from '@nestjs/common';
import { DepotController } from './depot.controller';
import { DepotService } from './depot.service';
import { DepotRepository } from './depot.repository';
import { EventsModule } from '../events/events.module';
import { RulesModule } from '../rules/rules.module';

@Module({
  imports: [EventsModule, RulesModule],
  controllers: [DepotController],
  providers: [DepotService, DepotRepository],
  exports: [DepotService],
})
export class DepotModule {}
