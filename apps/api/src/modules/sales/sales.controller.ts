import { Body, Controller, Delete, Get, Header, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { SalesService } from './sales.service';
import type { AddressInput, CreateComplaintInput, CreateOrderInput, OrderQuery, ProductQuery } from './sales.repository';
import type { BuyerProfile, DocumentType, OrderItem, OrderStatus } from './buyer-read-model';

@ApiTags('sales')
@Controller()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('products')
  listProducts(@Query() query: ProductQuery) {
    return this.salesService.listProducts(query);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    const product = this.salesService.findProduct(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  @Get('products/:id/traceability-summary')
  async getProductTraceability(@Param('id') id: string) {
    const product = await this.salesService.findProduct(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product.traceability;
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  listOrders(@CurrentUser('id') buyerId: string, @Query() query: OrderQuery) {
    return this.salesService.listOrders(buyerId, query);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  createOrder(@CurrentUser('id') buyerId: string, @Body() body: CreateOrderInput) {
    return this.salesService.createOrder(buyerId, body);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  async getOrder(@CurrentUser('id') buyerId: string, @Param('id') id: string) {
    const order = await this.salesService.findOrder(buyerId, id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus(@CurrentUser('id') buyerId: string, @Param('id') id: string, @Body() body: { status: OrderStatus }) {
    const order = await this.salesService.updateOrderStatus(buyerId, id, body.status);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Patch('orders/:id/items')
  @UseGuards(JwtAuthGuard)
  async replaceOrderItems(@CurrentUser('id') buyerId: string, @Param('id') id: string, @Body() body: { items: OrderItem[] }) {
    const order = await this.salesService.replaceOrderItems(buyerId, id, body.items);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Delete('orders/:id/items/:itemId')
  @UseGuards(JwtAuthGuard)
  async removeOrderItem(@CurrentUser('id') buyerId: string, @Param('id') id: string, @Param('itemId') itemId: string) {
    const order = await this.salesService.removeOrderItem(buyerId, id, itemId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Post('orders/:id/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmOrder(@CurrentUser('id') buyerId: string, @Param('id') id: string) {
    const order = await this.salesService.confirmOrder(buyerId, id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Get('orders/:id/shipment')
  @UseGuards(JwtAuthGuard)
  async getOrderShipment(@CurrentUser('id') buyerId: string, @Param('id') id: string) {
    const order = await this.salesService.findOrder(buyerId, id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      orderId: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt,
      destination: order.shippingAddress,
    };
  }

  @Get('orders/:id/documents')
  @UseGuards(JwtAuthGuard)
  async listOrderDocuments(@CurrentUser('id') buyerId: string, @Param('id') id: string) {
    const documents = await this.salesService.listOrderDocuments(buyerId, id);

    if (!documents) {
      throw new NotFoundException('Order not found');
    }

    return documents;
  }

  @Get('orders/:id/documents/:docId/download')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async downloadOrderDocument(@CurrentUser('id') buyerId: string, @Param('id') id: string, @Param('docId') docId: string) {
    const document = await this.salesService.findOrderDocument(buyerId, id, docId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return `${document.title}\nCommande: ${document.orderId}\nType: ${document.type}\nGenere le: ${document.createdAt}`;
  }

  @Get('documents')
  @UseGuards(JwtAuthGuard)
  listDocuments(@CurrentUser('id') buyerId: string, @Query('type') type?: DocumentType | 'all') {
    return this.salesService.listAllDocuments(buyerId, type);
  }

  @Get('complaints')
  @UseGuards(JwtAuthGuard)
  listComplaints(@CurrentUser('id') buyerId: string) {
    return this.salesService.listComplaints(buyerId);
  }

  @Post('complaints')
  @UseGuards(JwtAuthGuard)
  createComplaint(@CurrentUser('id') buyerId: string, @Body() body: CreateComplaintInput) {
    return this.salesService.createComplaint(buyerId, body);
  }

  @Get('complaints/:id')
  @UseGuards(JwtAuthGuard)
  async getComplaint(@CurrentUser('id') buyerId: string, @Param('id') id: string) {
    const complaint = await this.salesService.findComplaint(buyerId, id);

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  @Get('buyer/profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser('id') buyerId: string) {
    return this.salesService.getProfile(buyerId);
  }

  @Patch('buyer/profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser('id') buyerId: string, @Body() body: Partial<BuyerProfile>) {
    return this.salesService.updateProfile(buyerId, body);
  }

  @Get('buyer/addresses')
  @UseGuards(JwtAuthGuard)
  listAddresses(@CurrentUser('id') buyerId: string) {
    return this.salesService.listAddresses(buyerId);
  }

  @Post('buyer/addresses')
  @UseGuards(JwtAuthGuard)
  createAddress(@CurrentUser('id') buyerId: string, @Body() body: AddressInput) {
    return this.salesService.createAddress(buyerId, body);
  }

  @Patch('buyer/addresses/:id')
  @UseGuards(JwtAuthGuard)
  async updateAddress(@CurrentUser('id') buyerId: string, @Param('id') id: string, @Body() body: Partial<AddressInput> & { isDefault?: boolean }) {
    const address = await this.salesService.updateAddress(buyerId, id, body);

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  @Delete('buyer/addresses/:id')
  @UseGuards(JwtAuthGuard)
  async deleteAddress(@CurrentUser('id') buyerId: string, @Param('id') id: string) {
    const deleted = await this.salesService.deleteAddress(buyerId, id);

    if (!deleted) {
      throw new NotFoundException('Address not found');
    }

    return { deleted: true };
  }
}
