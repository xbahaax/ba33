import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepotService } from './depot.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';

@ApiTags('depot')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('depot_manager', 'central_admin')
@Controller('depot')
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new depot' })
  async createDepot(
    @Body()
    body: {
      name: string;
      regionId: string;
      address: string;
      capacityKg: string;
      managerId?: string;
    },
  ) {
    return this.depotService.createDepot(body);
  }

  @Get()
  @ApiOperation({ summary: 'List all depots' })
  async listDepots() {
    return this.depotService.listDepots();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get depot with zones' })
  async getDepot(@Param('id') id: string) {
    return this.depotService.getDepot(id);
  }

  @Post(':id/zones')
  @ApiOperation({ summary: 'Create a zone in a depot' })
  async createZone(
    @Param('id') depotId: string,
    @Body()
    body: {
      code: string;
      purpose: 'c1_normal' | 'c2_urgent' | 'c3_aggregator' | 'quarantine' | 'dispatch_ready';
      capacityKg: string;
    },
  ) {
    return this.depotService.createZone(depotId, body);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Receive a lot at the depot (E1 entry audit)' })
  async receiveLot(
    @Param('id') depotId: string,
    @Body()
    body: {
      lotId: string;
      declaredWeight: number;
      actualWeight: number;
      zoneId: string;
      receivedBy: string;
    },
  ) {
    return this.depotService.receiveLot(
      depotId,
      body.lotId,
      body.declaredWeight,
      body.actualWeight,
      body.zoneId,
      body.receivedBy,
    );
  }

  @Post(':id/dispatch')
  @ApiOperation({ summary: 'Dispatch lots from depot to laverie (S1 exit)' })
  async dispatch(
    @Param('id') depotId: string,
    @Body()
    body: {
      laverieId: string;
      lots: Array<{ lotId: string; weightKg: number }>;
      dispatchedBy: string;
    },
  ) {
    return this.depotService.createDispatch(
      depotId,
      body.laverieId,
      body.lots,
      body.dispatchedBy,
    );
  }

  @Get(':id/alerts')
  @ApiOperation({ summary: 'Get active A1 alerts for a depot' })
  async getAlerts(@Param('id') depotId: string) {
    return this.depotService.getActiveAlerts(depotId);
  }

  @Patch('alerts/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an A1 alert' })
  async acknowledgeAlert(@Param('id') alertId: string) {
    return this.depotService.acknowledgeAlert(alertId);
  }

  @Patch('alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve an A1 alert' })
  async resolveAlert(@Param('id') alertId: string) {
    return this.depotService.resolveAlert(alertId);
  }

  @Get(':id/aging')
  @ApiOperation({ summary: 'FIFO aging report — lots sorted by age with degradation flags' })
  async getAgingReport(@Param('id') depotId: string) {
    return this.depotService.getAgingReport(depotId);
  }
}
