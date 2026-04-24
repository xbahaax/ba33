import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { CollectionRepository } from './collection.repository';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [CollectionController],
  providers: [CollectionService, CollectionRepository],
  exports: [CollectionService],
})
export class CollectionModule {}
