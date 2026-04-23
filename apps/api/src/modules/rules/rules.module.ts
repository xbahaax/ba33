import { Module } from '@nestjs/common';
import { UrulesController } from './rules.controller';
import { UrulesService } from './rules.service';
import { UrulesRepository } from './rules.repository';

@Module({
  controllers: [UrulesController],
  providers: [UrulesService, UrulesRepository],
  exports: [UrulesService],
})
export class UrulesModule {}
