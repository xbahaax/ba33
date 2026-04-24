import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CollectionService } from './collection.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { CreatePreLotDto } from './dto/create-pre-lot.dto';
import { AssignPreLotDto } from './dto/assign-pre-lot.dto';
import { CompletePreLotDto } from './dto/complete-pre-lot.dto';
import { CancelPreLotDto } from './dto/cancel-pre-lot.dto';
import { CreateCollectorDto } from './dto/create-collector.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteStopDto } from './dto/update-route-stop.dto';
import { IssueBookletDto } from './dto/issue-booklet.dto';
import { DeclareWoolDto } from './dto/declare-wool.dto';
import { DeclareWoolOnBehalfDto } from './dto/declare-wool-on-behalf.dto';

@ApiTags('collection')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  // ── Pre-Lots ──────────────────────────────────────────────

  @Post('pre-lots/declare')
  @ApiOperation({
    summary: 'Shepherd declaration — auto-creates source if needed',
  })
  async declareWool(@Body() dto: DeclareWoolDto) {
    return this.collectionService.declareWool(dto);
  }

  @Post('pre-lots/declare-on-behalf')
  @ApiOperation({
    summary:
      'Transporter/collector declares wool on behalf of a farmer — creates source + pre-lot',
  })
  async declareWoolOnBehalf(@Body() dto: DeclareWoolOnBehalfDto) {
    return this.collectionService.declareWoolOnBehalf(dto);
  }

  @Post('pre-lots')
  @ApiOperation({ summary: 'Create a pre-lot (shepherd declaration)' })
  async createPreLot(@Body() dto: CreatePreLotDto) {
    return this.collectionService.createPreLot(dto);
  }

  @Get('pre-lots')
  @Roles('collector', 'central_admin', 'regional_manager')
  @ApiOperation({ summary: 'List pre-lots with optional filters' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'assignedCollectorId', required: false })
  @ApiQuery({ name: 'regionId', required: false })
  async listPreLots(
    @Query('status') status?: string,
    @Query('assignedCollectorId') assignedCollectorId?: string,
    @Query('regionId') regionId?: string,
  ) {
    return this.collectionService.listPreLots({
      status,
      assignedCollectorId,
      regionId,
    });
  }

  @Get('pre-lots/:id')
  @ApiOperation({ summary: 'Get a pre-lot by ID' })
  @ApiParam({ name: 'id', description: 'Pre-lot UUID' })
  async getPreLot(@Param('id') id: string) {
    return this.collectionService.getPreLot(id);
  }

  @Patch('pre-lots/:id/assign')
  @Roles('collector', 'central_admin')
  @ApiOperation({ summary: 'Assign a pre-lot to a collector' })
  @ApiParam({ name: 'id', description: 'Pre-lot UUID' })
  async assignPreLot(
    @Param('id') id: string,
    @Body() dto: AssignPreLotDto,
  ) {
    return this.collectionService.assignPreLot(
      id,
      dto.collectorId,
      new Date(dto.scheduledAt),
    );
  }

  @Patch('pre-lots/:id/complete')
  @Roles('collector', 'central_admin')
  @ApiOperation({ summary: 'Mark a pre-lot as collected' })
  @ApiParam({ name: 'id', description: 'Pre-lot UUID' })
  async completePreLot(
    @Param('id') id: string,
    @Body() dto: CompletePreLotDto,
  ) {
    return this.collectionService.completePreLot(id, dto.lotId);
  }

  @Patch('pre-lots/:id/cancel')
  @Roles('collector', 'central_admin')
  @ApiOperation({ summary: 'Cancel a pre-lot' })
  @ApiParam({ name: 'id', description: 'Pre-lot UUID' })
  async cancelPreLot(
    @Param('id') id: string,
    @Body() dto: CancelPreLotDto,
  ) {
    return this.collectionService.cancelPreLot(id, dto.reason);
  }

  // ── Collectors ────────────────────────────────────────────

  @Post('collectors')
  @Roles('central_admin')
  @ApiOperation({ summary: 'Create a collector profile' })
  async createCollector(@Body() dto: CreateCollectorDto) {
    return this.collectionService.createCollector(
      dto.userId,
      dto.assignedRegions,
      dto.certifications,
    );
  }

  @Get('collectors/me')
  @Roles('collector')
  @ApiOperation({ summary: 'Get own collector profile' })
  async getMyCollectorProfile(@Request() req: any) {
    return this.collectionService.getCollectorProfile(req.user.id);
  }

  // ── Routes ────────────────────────────────────────────────

  @Post('routes')
  @Roles('collector', 'central_admin')
  @ApiOperation({ summary: 'Create a collection route' })
  async createRoute(@Body() dto: CreateRouteDto) {
    return this.collectionService.createRoute(
      dto.collectorId,
      new Date(dto.date),
    );
  }

  @Get('routes')
  @Roles('collector', 'central_admin')
  @ApiOperation({ summary: 'List routes for a collector' })
  @ApiQuery({ name: 'collectorId', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'ISO date string' })
  async listRoutes(
    @Query('collectorId') collectorId?: string,
    @Query('date') date?: string,
  ) {
    if (!collectorId) {
      return [];
    }
    return this.collectionService.getCollectorRoutes(
      collectorId,
      date ? new Date(date) : undefined,
    );
  }

  @Get('routes/:id')
  @Roles('collector', 'central_admin')
  @ApiOperation({ summary: 'Get route with stops' })
  @ApiParam({ name: 'id', description: 'Route UUID' })
  async getRoute(@Param('id') id: string) {
    return this.collectionService.getRoute(id);
  }

  @Patch('routes/:routeId/stops/:stopId')
  @Roles('collector', 'central_admin')
  @ApiOperation({ summary: 'Update a route stop (arrival, status)' })
  @ApiParam({ name: 'routeId', description: 'Route UUID' })
  @ApiParam({ name: 'stopId', description: 'Route stop UUID' })
  async updateRouteStop(
    @Param('stopId') stopId: string,
    @Body() dto: UpdateRouteStopDto,
  ) {
    if (dto.arrivalTime) {
      return this.collectionService.completeRouteStop(
        stopId,
        new Date(dto.arrivalTime),
      );
    }

    // Fall back to direct repo update for other status changes
    return this.collectionService.completeRouteStop(stopId, new Date());
  }

  // ── Booklets ──────────────────────────────────────────────

  @Post('booklets')
  @Roles('collector', 'central_admin')
  @ApiOperation({ summary: 'Issue a booklet to a collector' })
  async issueBooklet(@Body() dto: IssueBookletDto) {
    return this.collectionService.issueBooklet(
      dto.collectorId,
      dto.serialStart,
      dto.serialEnd,
    );
  }
}
