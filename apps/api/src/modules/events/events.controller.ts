import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { EventsService } from './events.service';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @RequirePermissions('dashboard.view')
  @Get('recent')
  getRecent() {
    return this.eventsService.getRecent();
  }

  @Get()
  @ApiOperation({ summary: 'Get entity event history' })
  @ApiQuery({ name: 'aggregateType', required: true, description: 'Aggregate type (e.g. lot, source)' })
  @ApiQuery({ name: 'aggregateId', required: true, description: 'Aggregate ID (UUID)' })
  async getEntityHistory(
    @Query('aggregateType') aggregateType: string,
    @Query('aggregateId') aggregateId: string,
  ) {
    if (!aggregateId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(aggregateId)) {
      throw new BadRequestException('aggregateId must be a valid UUID');
    }
    return this.eventsService.getEntityHistory(aggregateType, aggregateId);
  }

  @Get('since')
  @ApiOperation({ summary: 'Get events since a given timestamp (for mobile sync)' })
  @ApiQuery({ name: 'recordedAt', required: true, description: 'ISO date string' })
  async getEventsSince(@Query('recordedAt') recordedAt: string) {
    return this.eventsService.getEventsSince(new Date(recordedAt));
  }
}
