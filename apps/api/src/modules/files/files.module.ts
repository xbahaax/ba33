import { Module } from '@nestjs/common';
import { UfilesController } from './files.controller';
import { UfilesService } from './files.service';
import { UfilesRepository } from './files.repository';

@Module({
  controllers: [UfilesController],
  providers: [UfilesService, UfilesRepository],
  exports: [UfilesService],
})
export class UfilesModule {}
