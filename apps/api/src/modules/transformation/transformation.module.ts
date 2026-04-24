import { Module } from '@nestjs/common';
import { TransformationController } from './transformation.controller';
import { TransformationService } from './transformation.service';
import { TransformationRepository } from './transformation.repository';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LotsModule } from '../lots/lots.module';

@Module({
  imports: [EventsModule, NotificationsModule, LotsModule],
  controllers: [TransformationController],
  providers: [TransformationService, TransformationRepository],
  exports: [TransformationService],
})
export class TransformationModule {}
