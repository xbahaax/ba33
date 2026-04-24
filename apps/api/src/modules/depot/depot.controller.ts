import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { CreateDepotDispatchDto } from './dto/create-depot-dispatch.dto';
import { CreateDepotReceptionDto } from './dto/create-depot-reception.dto';
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

  @RequirePermissions('depot.receive')
  @Post('receptions')
  receiveLot(
    @Body() input: CreateDepotReceptionDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.depotService.receiveLot(input, actorId, actorType);
  }

  @RequirePermissions('depot.dispatch')
  @Post('dispatches')
  dispatchLot(
    @Body() input: CreateDepotDispatchDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.depotService.dispatchLot(input, actorId, actorType);
  }
}
