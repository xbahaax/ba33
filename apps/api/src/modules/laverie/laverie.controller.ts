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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { LaverieService } from './laverie.service';

@ApiTags('laverie')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('laverie')
export class LaverieController {
  constructor(private readonly laverieService: LaverieService) {}

  @Post()
  @Roles('central_admin')
  @ApiOperation({ summary: 'Create a laverie facility' })
  async create(@Body() dto: { name: string; regionId: string; address: string; dailyCapacityKg: string; managerId?: string }) {
    return this.laverieService.createLaverie(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all laveries' })
  async list() {
    return this.laverieService.listLaveries();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a laverie by ID' })
  async get(@Param('id') id: string) {
    return this.laverieService.getLaverie(id);
  }

  @Post(':laverieId/receive')
  @Roles('laverie_operator', 'central_admin')
  @ApiOperation({ summary: 'Receive a lot at laverie' })
  async receiveLot(
    @Param('laverieId') laverieId: string,
    @Body() dto: { lotId: string; receivedWeightKg: number; depotDispatchId?: string },
    @Req() req: any,
  ) {
    return this.laverieService.receiveLot(
      laverieId, dto.lotId, dto.receivedWeightKg, req.user.id, dto.depotDispatchId,
    );
  }

  @Post('prewash-check')
  @Roles('laverie_operator', 'central_admin')
  @ApiOperation({ summary: 'Perform pre-wash safety check on a lot (C2)' })
  async preWashCheck(
    @Body() dto: {
      lotId: string;
      vetCertReference?: string;
      visualInspectionPassed: boolean;
      contaminationDetected: boolean;
      action: 'approved' | 'quarantined' | 'rejected';
    },
    @Req() req: any,
  ) {
    return this.laverieService.preWashCheck(dto.lotId, dto, req.user.id);
  }

  @Post(':laverieId/wash/start')
  @Roles('laverie_operator', 'central_admin')
  @ApiOperation({ summary: 'Start a washing run' })
  async startWash(
    @Param('laverieId') laverieId: string,
    @Body() dto: { lotId: string; dirtyWeightKg: number },
    @Req() req: any,
  ) {
    return this.laverieService.startWash(laverieId, dto.lotId, dto.dirtyWeightKg, req.user.id);
  }

  @Post('wash/:runId/complete')
  @Roles('laverie_operator', 'central_admin')
  @ApiOperation({ summary: 'Complete a washing run with clean weight (R1 yield)' })
  async completeWash(
    @Param('runId') runId: string,
    @Body() dto: {
      cleanWeightKg: number;
      waterLiters?: number;
      chemicals?: unknown;
      cycleDurationMinutes?: number;
      waterTempC?: number;
    },
  ) {
    const { cleanWeightKg, ...processData } = dto;
    return this.laverieService.completeWash(runId, cleanWeightKg, processData);
  }

  @Post('wash/:runId/qualify')
  @Roles('laverie_operator', 'central_admin')
  @ApiOperation({ summary: 'Qualify a washed lot (grading + pricing)' })
  async qualify(
    @Param('runId') runId: string,
    @Body() dto: {
      fiberLengthMm?: number;
      fiberDiameterMicron?: number;
      moisturePercent?: number;
      cleanlinessScore?: number;
      color?: string;
      grade: 'A' | 'B' | 'C' | 'reject';
      safetyStatus: 'clear' | 'flagged' | 'rejected';
      contaminationNotes?: string;
    },
    @Req() req: any,
  ) {
    return this.laverieService.qualifyLot(runId, dto, req.user.id);
  }

  @Post('dispatch')
  @Roles('laverie_operator', 'central_admin')
  @ApiOperation({ summary: 'Dispatch a qualified lot via S2/S3 routing' })
  async dispatch(
    @Body() dto: { qualificationId: string; targetTransformerId?: string },
    @Req() req: any,
  ) {
    return this.laverieService.dispatchLot(dto.qualificationId, dto.targetTransformerId, req.user.id);
  }

  @Get('washing-runs')
  @ApiOperation({ summary: 'List washing runs' })
  async getWashingRuns(
    @Query('laverieId') laverieId?: string,
    @Query('lotId') lotId?: string,
  ) {
    return this.laverieService.getWashingRuns(laverieId, lotId);
  }

  @Get('qualifications')
  @ApiOperation({ summary: 'List qualifications' })
  async getQualifications(@Query('lotId') lotId?: string) {
    return this.laverieService.getQualifications(lotId);
  }
}
