import { Module } from '@nestjs/common';
import { UcertificationController } from './certification.controller';
import { UcertificationService } from './certification.service';
import { UcertificationRepository } from './certification.repository';

@Module({
  controllers: [UcertificationController],
  providers: [UcertificationService, UcertificationRepository],
  exports: [UcertificationService],
})
export class UcertificationModule {}
