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
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { AcceptJobDto } from './dto/accept-job.dto';
import { LoadLotDto } from './dto/load-lot.dto';
import { DeliverLotDto } from './dto/deliver-lot.dto';
import { AddGpsPointDto } from './dto/add-gps-point.dto';
import { CreateTransporterDto } from './dto/create-transporter.dto';

@ApiTags('transport')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('collector', 'depot_manager', 'central_admin')
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  // ── Jobs ──────────────────────────────────────────────────

  @Post('jobs')
  @ApiOperation({ summary: 'Create a transport job' })
  async createJob(@Body() dto: CreateJobDto) {
    return this.transportService.createJob({
      ...dto,
      slaDeadline: dto.slaDeadline ? new Date(dto.slaDeadline) : undefined,
    });
  }

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

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get a transport job with lots' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async getJob(@Param('id') id: string) {
    return this.transportService.getJob(id);
  }

  @Patch('jobs/:id/accept')
  @ApiOperation({ summary: 'Accept a transport job' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async acceptJob(@Param('id') id: string, @Body() dto: AcceptJobDto) {
    return this.transportService.acceptJob(id, dto.transporterId);
  }

  @Patch('jobs/:id/start')
  @ApiOperation({ summary: 'Start a transport job' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async startJob(@Param('id') id: string) {
    return this.transportService.startJob(id);
  }

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

  @Patch('jobs/:id/complete')
  @ApiOperation({ summary: 'Complete a transport job (mark delivered)' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async completeJob(@Param('id') id: string) {
    return this.transportService.completeJob(id);
  }

  // ── GPS ───────────────────────────────────────────────────

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

  @Get('jobs/:id/gps')
  @ApiOperation({ summary: 'Get GPS trail for a transport job' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  async getGpsTrail(@Param('id') id: string) {
    return this.transportService.getGpsTrail(id);
  }

  // ── Transporters ──────────────────────────────────────────

  @Post('transporters')
  @ApiOperation({ summary: 'Create a transporter profile' })
  async createTransporter(@Body() dto: CreateTransporterDto) {
    return this.transportService.createTransporter(
      dto.userId,
      dto.vehicleInfo,
      dto.certifications,
    );
  }
}
