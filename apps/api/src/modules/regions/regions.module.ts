import { Module } from '@nestjs/common';
import { UregionsController } from './regions.controller';
import { UregionsService } from './regions.service';
import { UregionsRepository } from './regions.repository';

@Module({
  controllers: [UregionsController],
  providers: [UregionsService, UregionsRepository],
  exports: [UregionsService],
})
export class UregionsModule {}
