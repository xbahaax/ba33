import { Module } from '@nestjs/common';
import { UdepotController } from './depot.controller';
import { UdepotService } from './depot.service';
import { UdepotRepository } from './depot.repository';

@Module({
  controllers: [UdepotController],
  providers: [UdepotService, UdepotRepository],
  exports: [UdepotService],
})
export class UdepotModule {}
