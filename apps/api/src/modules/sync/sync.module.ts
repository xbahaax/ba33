import { Module } from '@nestjs/common';
import { UsyncController } from './sync.controller';
import { UsyncService } from './sync.service';
import { UsyncRepository } from './sync.repository';

@Module({
  controllers: [UsyncController],
  providers: [UsyncService, UsyncRepository],
  exports: [UsyncService],
})
export class UsyncModule {}
