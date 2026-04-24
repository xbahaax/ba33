import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { SyncService } from './sync.service';

@ApiTags('sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('devices/register')
  @ApiOperation({ summary: 'Register a device for offline sync' })
  async registerDevice(
    @Body() dto: { deviceId: string; deviceInfo: Record<string, unknown> },
    @Req() req: any,
  ) {
    return this.syncService.registerDevice(req.user.id, dto.deviceId, dto.deviceInfo);
  }

  @Get('devices')
  @ApiOperation({ summary: 'List devices for current user' })
  async getDevices(@Req() req: any) {
    return this.syncService.getUserDevices(req.user.id);
  }

  @Get('devices/:deviceId')
  @ApiOperation({ summary: 'Get device sync status' })
  async getDevice(@Param('deviceId') deviceId: string) {
    return this.syncService.getDevice(deviceId);
  }

  @Post('push/:deviceId')
  @ApiOperation({ summary: 'Push events from device to server' })
  async push(
    @Param('deviceId') deviceId: string,
    @Body() dto: {
      events: Array<{
        eventType: string;
        aggregateType: string;
        aggregateId: string;
        actorId?: string;
        actorType: string;
        payload?: unknown;
        occurredAt: string;
        version: number;
      }>;
    },
  ) {
    return this.syncService.pushEvents(deviceId, dto.events);
  }

  @Get('pull/:deviceId')
  @ApiOperation({ summary: 'Pull new events from server to device' })
  @ApiQuery({ name: 'since', required: false, description: 'ISO timestamp cursor' })
  async pull(
    @Param('deviceId') deviceId: string,
    @Query('since') since?: string,
  ) {
    return this.syncService.pullEvents(deviceId, since);
  }

  @Get('history/:deviceId')
  @ApiOperation({ summary: 'Get sync batch history for a device' })
  async getHistory(@Param('deviceId') deviceId: string) {
    return this.syncService.getSyncHistory(deviceId);
  }
}
