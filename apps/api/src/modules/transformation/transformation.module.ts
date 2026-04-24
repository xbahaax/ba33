import { Module } from '@nestjs/common';
import { TransformationController } from './transformation.controller';
import { TransformationService } from './transformation.service';
import { TransformationRepository } from './transformation.repository';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [TransformationController],
  providers: [TransformationService, TransformationRepository],
  exports: [TransformationService],
})
export class TransformationModule {}
