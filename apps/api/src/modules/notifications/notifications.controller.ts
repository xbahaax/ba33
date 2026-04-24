import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  listNotifications() {
    return this.notificationsService.list();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  markAllRead() {
    return this.notificationsService.markAllRead();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  dismiss(@Param('id') id: string) {
    return this.notificationsService.dismiss(id);
  }
}
