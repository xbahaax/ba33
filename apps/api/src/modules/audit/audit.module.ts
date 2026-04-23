import { Module } from '@nestjs/common';
import { UauditController } from './audit.controller';
import { UauditService } from './audit.service';
import { UauditRepository } from './audit.repository';

@Module({
  controllers: [UauditController],
  providers: [UauditService, UauditRepository],
  exports: [UauditService],
})
export class UauditModule {}
