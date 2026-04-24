import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('central_admin', 'regional_manager')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get entity event history' })
  @ApiQuery({ name: 'aggregateType', required: true, description: 'Aggregate type (e.g. lot, source)' })
  @ApiQuery({ name: 'aggregateId', required: true, description: 'Aggregate ID (UUID)' })
  async getEntityHistory(
    @Query('aggregateType') aggregateType: string,
    @Query('aggregateId') aggregateId: string,
  ) {
    return this.eventsService.getEntityHistory(aggregateType, aggregateId);
  }

  @Get('since')
  @ApiOperation({ summary: 'Get events since a given timestamp (for mobile sync)' })
  @ApiQuery({ name: 'recordedAt', required: true, description: 'ISO date string' })
  async getEventsSince(@Query('recordedAt') recordedAt: string) {
    return this.eventsService.getEventsSince(new Date(recordedAt));
  }
}
