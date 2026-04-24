import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { UpdateA1AlertStatusDto } from './dto/update-a1-alert-status.dto';
import { OperationsService } from './operations.service';

@ApiTags('operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @RequirePermissions('dashboard.view')
  @Get('command-center')
  getCommandCenter() {
    return this.operationsService.getCommandCenter();
  }

  @RequirePermissions('fulfillment.view')
  @Get('fulfillment')
  getFulfillmentOverview() {
    return this.operationsService.getFulfillmentOverview();
  }

  @RequirePermissions('validation.view')
  @Get('validation')
  getValidationOverview() {
    return this.operationsService.getValidationOverview();
  }

  @RequirePermissions('traceability.view')
  @Get('traceability/:lookupKey')
  lookupTraceability(@Param('lookupKey') lookupKey: string) {
    return this.operationsService.lookupTraceability(lookupKey);
  }

  @RequirePermissions('alerts.manage')
  @Patch('a1-alerts/:alertId/status')
  updateA1AlertStatus(
    @Param('alertId') alertId: string,
    @Body() input: UpdateA1AlertStatusDto,
  ) {
    return this.operationsService.updateA1AlertStatus(alertId, input.status);
  }
}
