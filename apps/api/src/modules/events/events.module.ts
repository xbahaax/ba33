import { Module } from '@nestjs/common';
import { UeventsController } from './events.controller';
import { UeventsService } from './events.service';
import { UeventsRepository } from './events.repository';

@Module({
  controllers: [UeventsController],
  providers: [UeventsService, UeventsRepository],
  exports: [UeventsService],
})
export class UeventsModule {}
