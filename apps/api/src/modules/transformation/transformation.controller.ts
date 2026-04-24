import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { CompleteProductionRunDto } from './dto/complete-production-run.dto';
import { CreateProductionRunDto } from './dto/create-production-run.dto';
import { TransformationService } from './transformation.service';

@ApiTags('transformation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('transformation')
export class TransformationController {
  constructor(private readonly transformationService: TransformationService) {}

  @RequirePermissions('transformation.view')
  @Get('overview')
  getOverview() {
    return this.transformationService.getOverview();
  }

  @RequirePermissions('transformation.operate')
  @Post('runs')
  startProductionRun(
    @Body() input: CreateProductionRunDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.transformationService.startProductionRun(input, actorId, actorType);
  }

  @RequirePermissions('transformation.operate')
  @Patch('runs/:runId/complete')
  completeProductionRun(
    @Param('runId') runId: string,
    @Body() input: CompleteProductionRunDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.transformationService.completeProductionRun(
      runId,
      input,
      actorId,
      actorType,
    );
  }
}
