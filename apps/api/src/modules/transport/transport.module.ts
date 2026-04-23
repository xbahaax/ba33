import { Module } from '@nestjs/common';
import { UtransportController } from './transport.controller';
import { UtransportService } from './transport.service';
import { UtransportRepository } from './transport.repository';

@Module({
  controllers: [UtransportController],
  providers: [UtransportService, UtransportRepository],
  exports: [UtransportService],
})
export class UtransportModule {}
