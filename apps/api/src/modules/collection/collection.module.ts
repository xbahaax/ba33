import { Module } from '@nestjs/common';
import { UcollectionController } from './collection.controller';
import { UcollectionService } from './collection.service';
import { UcollectionRepository } from './collection.repository';

@Module({
  controllers: [UcollectionController],
  providers: [UcollectionService, UcollectionRepository],
  exports: [UcollectionService],
})
export class UcollectionModule {}
