import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { AdvanceTransportJobDto } from './dto/advance-transport-job.dto';
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

  @RequirePermissions('transport.manage')
  @Post('jobs/:jobId/actions')
  advanceJob(
    @Param('jobId') jobId: string,
    @Body() input: AdvanceTransportJobDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.transportService.advanceJob(jobId, input, actorId, actorType);
  }
}
