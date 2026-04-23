import { Module } from '@nestjs/common';
import { UauthController } from './auth.controller';
import { UauthService } from './auth.service';
import { UauthRepository } from './auth.repository';

@Module({
  controllers: [UauthController],
  providers: [UauthService, UauthRepository],
  exports: [UauthService],
})
export class UauthModule {}
