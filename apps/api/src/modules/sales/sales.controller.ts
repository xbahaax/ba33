import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { SalesService } from './sales.service';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ── Buyers ──────────────────────────────────────────────

  @Post('buyers')
  @Roles('central_admin', 'sales_agent')
  @ApiOperation({ summary: 'Register a buyer' })
  async registerBuyer(
    @Body() dto: {
      userId: string;
      companyName: string;
      registrationNumber?: string;
      preferredChannel: 'national' | 'export' | 'institutional';
      creditLimit?: string;
      billingAddress: unknown;
      shippingAddresses: unknown;
    },
  ) {
    return this.salesService.registerBuyer(dto);
  }

  @Get('buyers')
  @Roles('central_admin', 'sales_agent')
  @ApiOperation({ summary: 'List all buyers' })
  async listBuyers() {
    return this.salesService.listBuyers();
  }

  @Get('buyers/:userId')
  @Roles('central_admin', 'sales_agent', 'buyer')
  @ApiOperation({ summary: 'Get buyer profile' })
  async getBuyer(@Param('userId') userId: string) {
    return this.salesService.getBuyer(userId);
  }

  // ── Orders ──────────────────────────────────────────────

  @Post('orders')
  @Roles('central_admin', 'sales_agent', 'buyer')
  @ApiOperation({ summary: 'Create a new order' })
  async createOrder(
    @Body() dto: {
      buyerId: string;
      channel: 'national' | 'export' | 'institutional';
      items: Array<{
        productId: string;
        productCode: string;
        quantity: number;
        unitPrice: number;
      }>;
    },
  ) {
    return this.salesService.createOrder(dto.buyerId, dto.channel, dto.items);
  }

  @Get('orders/:id')
  @Roles('central_admin', 'sales_agent', 'buyer')
  @ApiOperation({ summary: 'Get order with items and shipments' })
  async getOrder(@Param('id') id: string) {
    return this.salesService.getOrder(id);
  }

  @Get('buyers/:buyerId/orders')
  @Roles('central_admin', 'sales_agent', 'buyer')
  @ApiOperation({ summary: 'Get orders for a buyer' })
  async getBuyerOrders(@Param('buyerId') buyerId: string) {
    return this.salesService.getBuyerOrders(buyerId);
  }

  @Patch('orders/:id/confirm')
  @Roles('central_admin', 'sales_agent')
  @ApiOperation({ summary: 'Confirm an order' })
  async confirmOrder(@Param('id') id: string) {
    return this.salesService.confirmOrder(id);
  }

  @Patch('orders/:id/pay')
  @Roles('central_admin', 'sales_agent')
  @ApiOperation({ summary: 'Mark order as paid' })
  async markPaid(@Param('id') id: string) {
    return this.salesService.markOrderPaid(id);
  }

  @Post('orders/:id/ship')
  @Roles('central_admin', 'sales_agent')
  @ApiOperation({ summary: 'Ship an order' })
  async ship(
    @Param('id') id: string,
    @Body() dto: { trackingReference?: string },
  ) {
    return this.salesService.shipOrder(id, dto.trackingReference);
  }

  @Patch('orders/:id/deliver')
  @Roles('central_admin', 'sales_agent')
  @ApiOperation({ summary: 'Mark order as delivered' })
  async deliver(@Param('id') id: string) {
    return this.salesService.deliverOrder(id);
  }

  @Patch('orders/:id/cancel')
  @Roles('central_admin', 'sales_agent', 'buyer')
  @ApiOperation({ summary: 'Cancel an order' })
  async cancel(@Param('id') id: string) {
    return this.salesService.cancelOrder(id);
  }
}
