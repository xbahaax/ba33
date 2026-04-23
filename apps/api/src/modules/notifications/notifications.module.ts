import { Module } from '@nestjs/common';
import { UnotificationsController } from './notifications.controller';
import { UnotificationsService } from './notifications.service';
import { UnotificationsRepository } from './notifications.repository';

@Module({
  controllers: [UnotificationsController],
  providers: [UnotificationsService, UnotificationsRepository],
  exports: [UnotificationsService],
})
export class UnotificationsModule {}
