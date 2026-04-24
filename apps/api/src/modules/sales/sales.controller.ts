import { Body, Controller, Delete, Get, Header, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  getProductTraceability(@Param('id') id: string) {
    const product = this.salesService.findProduct(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product.traceability;
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  listOrders(@Query() query: OrderQuery) {
    return this.salesService.listOrders(query);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  createOrder(@Body() body: CreateOrderInput) {
    return this.salesService.createOrder(body);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  getOrder(@Param('id') id: string) {
    const order = this.salesService.findOrder(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard)
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    const order = this.salesService.updateOrderStatus(id, body.status);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Patch('orders/:id/items')
  @UseGuards(JwtAuthGuard)
  replaceOrderItems(@Param('id') id: string, @Body() body: { items: OrderItem[] }) {
    const order = this.salesService.replaceOrderItems(id, body.items);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Delete('orders/:id/items/:itemId')
  @UseGuards(JwtAuthGuard)
  removeOrderItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    const order = this.salesService.removeOrderItem(id, itemId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Post('orders/:id/confirm')
  @UseGuards(JwtAuthGuard)
  confirmOrder(@Param('id') id: string) {
    const order = this.salesService.confirmOrder(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Get('orders/:id/shipment')
  @UseGuards(JwtAuthGuard)
  getOrderShipment(@Param('id') id: string) {
    const order = this.salesService.findOrder(id);

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
  listOrderDocuments(@Param('id') id: string) {
    const documents = this.salesService.listOrderDocuments(id);

    if (!documents) {
      throw new NotFoundException('Order not found');
    }

    return documents;
  }

  @Get('orders/:id/documents/:docId/download')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'text/plain; charset=utf-8')
  downloadOrderDocument(@Param('id') id: string, @Param('docId') docId: string) {
    const document = this.salesService.findOrderDocument(id, docId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return `${document.title}\nCommande: ${document.orderId}\nType: ${document.type}\nGenere le: ${document.createdAt}`;
  }

  @Get('documents')
  @UseGuards(JwtAuthGuard)
  listDocuments(@Query('type') type?: DocumentType | 'all') {
    return this.salesService.listAllDocuments(type);
  }

  @Get('complaints')
  @UseGuards(JwtAuthGuard)
  listComplaints() {
    return this.salesService.listComplaints();
  }

  @Post('complaints')
  @UseGuards(JwtAuthGuard)
  createComplaint(@Body() body: CreateComplaintInput) {
    return this.salesService.createComplaint(body);
  }

  @Get('complaints/:id')
  @UseGuards(JwtAuthGuard)
  getComplaint(@Param('id') id: string) {
    const complaint = this.salesService.findComplaint(id);

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  @Get('buyer/profile')
  @UseGuards(JwtAuthGuard)
  getProfile() {
    return this.salesService.getProfile();
  }

  @Patch('buyer/profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Body() body: Partial<BuyerProfile>) {
    return this.salesService.updateProfile(body);
  }

  @Get('buyer/addresses')
  @UseGuards(JwtAuthGuard)
  listAddresses() {
    return this.salesService.listAddresses();
  }

  @Post('buyer/addresses')
  @UseGuards(JwtAuthGuard)
  createAddress(@Body() body: AddressInput) {
    return this.salesService.createAddress(body);
  }

  @Patch('buyer/addresses/:id')
  @UseGuards(JwtAuthGuard)
  updateAddress(@Param('id') id: string, @Body() body: Partial<AddressInput> & { isDefault?: boolean }) {
    const address = this.salesService.updateAddress(id, body);

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  @Delete('buyer/addresses/:id')
  @UseGuards(JwtAuthGuard)
  deleteAddress(@Param('id') id: string) {
    const deleted = this.salesService.deleteAddress(id);

    if (!deleted) {
      throw new NotFoundException('Address not found');
    }

    return { deleted: true };
  }
}
