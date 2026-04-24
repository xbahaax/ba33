import { Module } from '@nestjs/common';
import { TransformationController } from './transformation.controller';
import { TransformationService } from './transformation.service';
import { TransformationRepository } from './transformation.repository';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EventsModule, NotificationsModule],
  controllers: [TransformationController],
  providers: [TransformationService, TransformationRepository],
  exports: [TransformationService],
})
export class TransformationModule {}
