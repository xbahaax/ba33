import { Module } from '@nestjs/common';
import { TransformationController } from './transformation.controller';
import { TransformationService } from './transformation.service';
import { TransformationRepository } from './transformation.repository';

@Module({
  controllers: [TransformationController],
  providers: [TransformationService, TransformationRepository],
  exports: [TransformationService],
})
export class TransformationModule {}
