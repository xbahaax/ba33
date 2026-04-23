import { Module } from '@nestjs/common';
import { UlotsController } from './lots.controller';
import { UlotsService } from './lots.service';
import { UlotsRepository } from './lots.repository';

@Module({
  controllers: [UlotsController],
  providers: [UlotsService, UlotsRepository],
  exports: [UlotsService],
})
export class UlotsModule {}
