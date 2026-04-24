import { Module } from '@nestjs/common';
import { CertificationController } from './certification.controller';
import { CertificationService } from './certification.service';
import { CertificationRepository } from './certification.repository';
import { EventsModule } from '../events/events.module';
import { RulesModule } from '../rules/rules.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [EventsModule, RulesModule, AuditModule],
  controllers: [CertificationController],
  providers: [CertificationService, CertificationRepository],
  exports: [CertificationService],
})
export class CertificationModule {}
