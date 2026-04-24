import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/decorators';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  listNotifications(@CurrentUser('id') userId: string) {
    return this.notificationsService.list(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  markAllRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  dismiss(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationsService.dismiss(userId, id);
  }
}
