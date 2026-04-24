import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { AdvanceOrderDto } from './dto/advance-order.dto';
import { SalesService } from './sales.service';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @RequirePermissions('sales.view')
  @Get('overview')
  getOverview() {
    return this.salesService.getOverview();
  }

  @RequirePermissions('sales.manage')
  @Post('orders/:orderId/actions')
  advanceOrder(
    @Param('orderId') orderId: string,
    @Body() input: AdvanceOrderDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.salesService.advanceOrder(orderId, input, actorId, actorType);
  }
}
