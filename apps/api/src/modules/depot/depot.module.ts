import { Module } from '@nestjs/common';
import { DepotController } from './depot.controller';
import { DepotService } from './depot.service';
import { DepotRepository } from './depot.repository';

@Module({
  controllers: [DepotController],
  providers: [DepotService, DepotRepository],
  exports: [DepotService],
})
export class DepotModule {}
