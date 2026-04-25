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
import { AssignCollectionJobDto } from './dto/assign-collection-job.dto';
import { CompleteCollectionJobDto } from './dto/complete-collection-job.dto';
import { SubmitCollectionJobGpsDto } from './dto/submit-collection-job-gps.dto';
import { CancelPreLotDto as CancelJobDto } from './dto/cancel-pre-lot.dto';

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

  // ── Collection Jobs ──────────────────────────────────────
  // The two-actor model: depots/admin issue jobs, collectors execute them.

  @Get('jobs')
  @Roles('collector', 'central_admin', 'regional_manager', 'depot_manager')
  @ApiOperation({ summary: 'List collection jobs with optional filters' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'collectorId', required: false })
  @ApiQuery({ name: 'depotId', required: false })
  async listCollectionJobs(
    @Query('status') status?: string,
    @Query('collectorId') collectorId?: string,
    @Query('depotId') depotId?: string,
  ) {
    return this.collectionService.listCollectionJobs({
      status,
      collectorId,
      depotId,
    });
  }

  @Get('jobs/me')
  @Roles('collector')
  @ApiOperation({ summary: 'List collection jobs assigned to or open for the current collector' })
  async listMyCollectionJobs(
    @Request() req: any,
    @Query('status') status?: string,
  ) {
    return this.collectionService.listCollectionJobs({
      collectorId: req.user.id,
      status,
    });
  }

  @Get('jobs/:id')
  @Roles('collector', 'central_admin', 'regional_manager', 'depot_manager')
  @ApiOperation({ summary: 'Get a collection job by ID' })
  @ApiParam({ name: 'id' })
  async getCollectionJob(@Param('id') id: string) {
    return this.collectionService.getCollectionJob(id);
  }

  @Patch('jobs/:id/assign')
  @Roles('central_admin', 'regional_manager', 'depot_manager')
  @ApiOperation({ summary: 'Assign a collector to a job (depot/admin)' })
  @ApiParam({ name: 'id' })
  async assignCollectionJob(
    @Param('id') id: string,
    @Body() dto: AssignCollectionJobDto,
    @Request() req: any,
  ) {
    return this.collectionService.assignCollectionJob(
      id,
      dto.collectorId,
      req.user?.id,
    );
  }

  @Patch('jobs/:id/accept')
  @Roles('collector')
  @ApiOperation({ summary: 'Collector accepts an assigned job' })
  @ApiParam({ name: 'id' })
  async acceptCollectionJob(@Param('id') id: string, @Request() req: any) {
    return this.collectionService.acceptCollectionJob(id, req.user.id);
  }

  @Patch('jobs/:id/start')
  @Roles('collector')
  @ApiOperation({ summary: 'Collector starts the trip toward the source' })
  @ApiParam({ name: 'id' })
  async startCollectionJob(@Param('id') id: string, @Request() req: any) {
    return this.collectionService.startCollectionJob(id, req.user.id);
  }

  @Post('jobs/:id/gps')
  @Roles('collector')
  @ApiOperation({ summary: 'Submit GPS points during the trip' })
  @ApiParam({ name: 'id' })
  async submitCollectionJobGps(
    @Param('id') id: string,
    @Body() dto: SubmitCollectionJobGpsDto,
    @Request() req: any,
  ) {
    return this.collectionService.submitCollectionJobGps(
      id,
      req.user.id,
      dto.points,
    );
  }

  @Patch('jobs/:id/arrive')
  @Roles('collector')
  @ApiOperation({ summary: 'Mark arrival at the source (auto via GPS or manual)' })
  @ApiParam({ name: 'id' })
  async markCollectionJobArrived(
    @Param('id') id: string,
    @Body() body: { lat?: string; lng?: string },
    @Request() req: any,
  ) {
    return this.collectionService.markCollectionJobArrived(
      id,
      req.user.id,
      body.lat && body.lng ? { lat: body.lat, lng: body.lng } : undefined,
    );
  }

  @Post('jobs/:id/complete')
  @Roles('collector')
  @ApiOperation({
    summary:
      'Submit the arrival form: creates the lot, marks the pre-lot collected, completes the job',
  })
  @ApiParam({ name: 'id' })
  async completeCollectionJob(
    @Param('id') id: string,
    @Body() dto: CompleteCollectionJobDto,
    @Request() req: any,
  ) {
    return this.collectionService.completeCollectionJob(id, req.user.id, dto);
  }

  @Patch('jobs/:id/cancel')
  @Roles('collector', 'central_admin', 'depot_manager')
  @ApiOperation({ summary: 'Cancel a collection job' })
  @ApiParam({ name: 'id' })
  async cancelCollectionJob(
    @Param('id') id: string,
    @Body() dto: CancelJobDto,
    @Request() req: any,
  ) {
    return this.collectionService.cancelCollectionJob(id, dto.reason, req.user?.id);
  }
}
