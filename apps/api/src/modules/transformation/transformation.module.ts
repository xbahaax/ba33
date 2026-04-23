import { Module } from '@nestjs/common';
import { UtransformationController } from './transformation.controller';
import { UtransformationService } from './transformation.service';
import { UtransformationRepository } from './transformation.repository';

@Module({
  controllers: [UtransformationController],
  providers: [UtransformationService, UtransformationRepository],
  exports: [UtransformationService],
})
export class UtransformationModule {}
