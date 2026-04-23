import { Module } from '@nestjs/common';
import { UlaverieController } from './laverie.controller';
import { UlaverieService } from './laverie.service';
import { UlaverieRepository } from './laverie.repository';

@Module({
  controllers: [UlaverieController],
  providers: [UlaverieService, UlaverieRepository],
  exports: [UlaverieService],
})
export class UlaverieModule {}
