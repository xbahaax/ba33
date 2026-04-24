import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
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
}
