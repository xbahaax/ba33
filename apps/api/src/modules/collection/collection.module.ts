import { Module, forwardRef } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { CollectionRepository } from './collection.repository';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TransportModule } from '../transport/transport.module';
import { LotsModule } from '../lots/lots.module';

@Module({
  imports: [
    EventsModule,
    NotificationsModule,
    forwardRef(() => TransportModule),
    forwardRef(() => LotsModule),
  ],
  controllers: [CollectionController],
  providers: [CollectionService, CollectionRepository],
  exports: [CollectionService],
})
export class CollectionModule {}
