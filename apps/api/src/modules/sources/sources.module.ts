import { Module } from '@nestjs/common';
import { UsourcesController } from './sources.controller';
import { UsourcesService } from './sources.service';
import { UsourcesRepository } from './sources.repository';

@Module({
  controllers: [UsourcesController],
  providers: [UsourcesService, UsourcesRepository],
  exports: [UsourcesService],
})
export class UsourcesModule {}
