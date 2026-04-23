import { Module } from '@nestjs/common';
import { LaverieController } from './laverie.controller';
import { LaverieService } from './laverie.service';
import { LaverieRepository } from './laverie.repository';

@Module({
  controllers: [LaverieController],
  providers: [LaverieService, LaverieRepository],
  exports: [LaverieService],
})
export class LaverieModule {}
