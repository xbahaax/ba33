import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TransportService } from './transport.service';
import { CurrentUser, RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { AcceptJobDto } from './dto/accept-job.dto';
import { LoadLotDto } from './dto/load-lot.dto';
import { DeliverLotDto } from './dto/deliver-lot.dto';
import { AddGpsPointDto } from './dto/add-gps-point.dto';
import { CreateTransporterDto } from './dto/create-transporter.dto';
import { ConfirmPickupDto } from './dto/confirm-pickup.dto';
import { AdvanceTransportJobDto } from './dto/advance-transport-job.dto';

@ApiTags('transport')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  // ── Jobs ──────────────────────────────────────────────────

  @Roles('transporter', 'collector', 'depot_manager', 'central_admin')
  @Post('jobs')
  @ApiOperation({ summary: 'Create a transport job' })
  async createJob(@Body() dto: CreateJobDto) {
    return this.transportService.createJob({
      ...dto,
      slaDeadline: dto.slaDeadline ? new Date(dto.slaDeadline) : undefined,
    });
  }

  @Roles('transporter', 'collector', 'depot_manager', 'central_admin')
  @Get('jobs')
  @ApiOperation({ summary: 'List transport jobs with filters' })
  @ApiQuery({ name: 'transporterId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'lane', required: false })
  async listJobs(
    @Query('transporterId') transporterId?: string,
    @Query('status') status?: string,
    @Query('lane') lane?: string,
  ) {
    return this.transportService.listJobs({ transporterId, status, lane });
  }

  @Roles('transporter', 'collector', 'depot_manager', 'central_admin')
  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get a transport job with lots' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async getJob(@Param('id') id: string) {
    return this.transportService.getJob(id);
  }

  @Roles('transporter', 'collector', 'depot_manager', 'central_admin')
  @Patch('jobs/:id/accept')
  @ApiOperation({ summary: 'Accept a transport job' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async acceptJob(@Param('id') id: string, @Body() dto: AcceptJobDto) {
    return this.transportService.acceptJob(id, dto.transporterId);
  }

  @Roles('transporter', 'collector', 'depot_manager', 'central_admin')
  @Patch('jobs/:id/start')
  @ApiOperation({ summary: 'Start a transport job' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async startJob(@Param('id') id: string) {
    return this.transportService.startJob(id);
  }

  @Roles('transporter', 'collector', 'depot_manager', 'central_admin')
  @Post('jobs/:id/lots/:lotId/load')
  @ApiOperation({ summary: 'Weigh-in: load a lot onto the transport' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  @ApiParam({ name: 'lotId', description: 'Lot UUID' })
  async loadLot(
    @Param('id') id: string,
    @Param('lotId') lotId: string,
    @Body() dto: LoadLotDto,
  ) {
    return this.transportService.loadLot(id, lotId, dto.weight);
  }

  @Roles('transporter', 'collector', 'depot_manager', 'central_admin')
  @Post('jobs/:id/lots/:lotId/deliver')
  @ApiOperation({ summary: 'Weigh-out: deliver a lot' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  @ApiParam({ name: 'lotId', description: 'Lot UUID' })
  async deliverLot(
    @Param('id') id: string,
    @Param('lotId') lotId: string,
    @Body() dto: DeliverLotDto,
  ) {
    return this.transportService.deliverLot(id, lotId, dto.weight);
  }

  @Roles('transporter', 'collector', 'depot_manager', 'central_admin')
  @Post('jobs/:id/confirm-pickup')
  @ApiOperation({ summary: 'Confirm pickup: converts pre-lot to lot with auto QR + weigh-in' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async confirmPickup(
    @Param('id') id: string,
    @Body() dto: ConfirmPickupDto,
  ) {
    return this.transportService.confirmPickup(id, dto);
  }

  @Roles('transporter', 'collector', 'depot_manager', 'central_admin')
  @Patch('jobs/:id/complete')
  @ApiOperation({ summary: 'Complete a transport job (mark delivered)' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async completeJob(@Param('id') id: string) {
    return this.transportService.completeJob(id);
  }

  // ── GPS ───────────────────────────────────────────────────

  @Roles('transporter', 'collector', 'depot_manager', 'central_admin')
  @Post('jobs/:id/gps')
  @ApiOperation({ summary: 'Add a GPS point to a transport job' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async addGpsPoint(
    @Param('id') id: string,
    @Body() dto: AddGpsPointDto,
  ) {
    return this.transportService.addGpsPoint(
      id,
      dto.lat,
      dto.lng,
      dto.temperatureC,
    );
  }

  @Roles('transporter', 'collector', 'depot_manager', 'central_admin')
  @Get('jobs/:id/gps')
  @ApiOperation({ summary: 'Get GPS trail for a transport job' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async getGpsTrail(@Param('id') id: string) {
    return this.transportService.getGpsTrail(id);
  }

  // ── Transporters ──────────────────────────────────────────

  @Roles('collector', 'depot_manager', 'central_admin')
  @Post('transporters')
  @ApiOperation({ summary: 'Create a transporter profile' })
  async createTransporter(@Body() dto: CreateTransporterDto) {
    return this.transportService.createTransporter(
      dto.userId,
      dto.vehicleInfo,
      dto.certifications,
    );
  }

  // ── Web-ops endpoints ─────────────────────────────────────

  @RequirePermissions('transport.view')
  @Get('overview')
  @ApiOperation({ summary: 'Transport overview for operations dashboard' })
  getOverview() {
    return this.transportService.getOverview();
  }

  @RequirePermissions('transport.manage')
  @Post('jobs/:jobId/actions')
  @ApiOperation({ summary: 'Advance a transport job state (web-ops)' })
  advanceJob(
    @Param('jobId') jobId: string,
    @Body() input: AdvanceTransportJobDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.transportService.advanceJob(jobId, input, actorId, actorType);
  }
}
