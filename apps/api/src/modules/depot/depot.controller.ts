import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { DepotService } from './depot.service';

@ApiTags('depot')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('depot')
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

  @RequirePermissions('depot.view')
  @Get('overview')
  getOverview() {
    return this.depotService.getOverview();
  }
}
