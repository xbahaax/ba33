import { Module } from '@nestjs/common';
import { LotsController } from './lots.controller';
import { LotsService } from './lots.service';
import { LotsRepository } from './lots.repository';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [LotsController],
  providers: [LotsService, LotsRepository],
  exports: [LotsService],
})
export class LotsModule {}
