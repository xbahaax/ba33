import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { CreateLaverieQualificationDto } from './dto/create-laverie-qualification.dto';
import { CreateLaverieReceptionDto } from './dto/create-laverie-reception.dto';
import { CreateWashingRunDto } from './dto/create-washing-run.dto';
import { LaverieService } from './laverie.service';

@ApiTags('laverie')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('laverie')
export class LaverieController {
  constructor(private readonly laverieService: LaverieService) {}

  @RequirePermissions('laverie.view')
  @Get('overview')
  getOverview() {
    return this.laverieService.getOverview();
  }

  @RequirePermissions('laverie.operate')
  @Post('receptions')
  receiveLot(
    @Body() input: CreateLaverieReceptionDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.laverieService.receiveLot(input, actorId, actorType);
  }

  @RequirePermissions('laverie.operate')
  @Post('washing-runs')
  startWash(
    @Body() input: CreateWashingRunDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.laverieService.startWash(input, actorId, actorType);
  }

  @RequirePermissions('laverie.operate')
  @Post('qualifications')
  qualifyLot(
    @Body() input: CreateLaverieQualificationDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.laverieService.qualifyLot(input, actorId, actorType);
  }
}
