import { Module } from '@nestjs/common';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';
import { TransportRepository } from './transport.repository';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [TransportController],
  providers: [TransportService, TransportRepository],
  exports: [TransportService],
})
export class TransportModule {}
