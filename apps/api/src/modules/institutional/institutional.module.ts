import { Module } from '@nestjs/common';
import { InstitutionalController } from './institutional.controller';
import { InstitutionalService } from './institutional.service';
import { InstitutionalRepository } from './institutional.repository';

@Module({
  controllers: [InstitutionalController],
  providers: [InstitutionalService, InstitutionalRepository],
  exports: [InstitutionalService],
})
export class InstitutionalModule {}
