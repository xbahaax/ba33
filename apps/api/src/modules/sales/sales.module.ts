import { Module } from '@nestjs/common';
import { UsalesController } from './sales.controller';
import { UsalesService } from './sales.service';
import { UsalesRepository } from './sales.repository';

@Module({
  controllers: [UsalesController],
  providers: [UsalesService, UsalesRepository],
  exports: [UsalesService],
})
export class UsalesModule {}
