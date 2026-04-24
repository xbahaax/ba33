import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { CertificationService } from './certification.service';

@ApiTags('certification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('certification')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @RequirePermissions('certification.view')
  @Get('overview')
  getOverview() {
    return this.certificationService.getOverview();
  }
}
