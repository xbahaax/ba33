import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UnotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class UnotificationsController {
  constructor(private readonly notificationsService: UnotificationsService) {}
}
