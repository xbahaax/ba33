import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { TransportService } from './transport.service';

@ApiTags('transport')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @RequirePermissions('transport.view')
  @Get('overview')
  getOverview() {
    return this.transportService.getOverview();
  }
}
