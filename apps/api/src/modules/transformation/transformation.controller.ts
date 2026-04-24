import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
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
}
