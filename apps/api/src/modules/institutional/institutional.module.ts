import { Module } from '@nestjs/common';
import { UinstitutionalController } from './institutional.controller';
import { UinstitutionalService } from './institutional.service';
import { UinstitutionalRepository } from './institutional.repository';

@Module({
  controllers: [UinstitutionalController],
  providers: [UinstitutionalService, UinstitutionalRepository],
  exports: [UinstitutionalService],
})
export class UinstitutionalModule {}
