import { Injectable } from '@nestjs/common';
import { AdvanceOrderDto } from './dto/advance-order.dto';
import {
  AddressInput,
  CreateComplaintInput,
  CreateOrderInput,
  OrderQuery,
  ProductQuery,
  SalesRepository,
} from './sales.repository';
import { BuyerProfile, DocumentType, OrderItem, OrderStatus } from './buyer-read-model';

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  getOverview() {
    return this.salesRepository.getOverview();
  }

  advanceOrder(
    orderId: string,
    input: AdvanceOrderDto,
    actorId: string,
    actorType: string,
  ) {
    return this.salesRepository.advanceOrder(orderId, input, actorId, actorType);
  }

  listProducts(query: ProductQuery) {
    return this.salesRepository.listProducts(query);
  }

  findProduct(productId: string) {
    return this.salesRepository.findProduct(productId);
  }

  findProductByCertificate(code: string) {
    return this.salesRepository.findProductByCertificate(code);
  }

  listOrders(buyerId: string, query: OrderQuery) {
    return this.salesRepository.listOrders(buyerId, query);
  }

  findOrder(buyerId: string, orderId: string) {
    return this.salesRepository.findOrder(buyerId, orderId);
  }

  createOrder(buyerId: string, input: CreateOrderInput) {
    return this.salesRepository.createOrder(buyerId, input);
  }

  replaceOrderItems(buyerId: string, orderId: string, items: OrderItem[]) {
    return this.salesRepository.replaceOrderItems(buyerId, orderId, items);
  }

  removeOrderItem(buyerId: string, orderId: string, itemId: string) {
    return this.salesRepository.removeOrderItem(buyerId, orderId, itemId);
  }

  updateOrderStatus(buyerId: string, orderId: string, status: OrderStatus) {
    return this.salesRepository.updateOrderStatus(buyerId, orderId, status);
  }

  confirmOrder(buyerId: string, orderId: string) {
    return this.salesRepository.confirmOrder(buyerId, orderId);
  }

  listOrderDocuments(buyerId: string, orderId: string) {
    return this.salesRepository.listOrderDocuments(buyerId, orderId);
  }

  findOrderDocument(buyerId: string, orderId: string, documentId: string) {
    return this.salesRepository.findOrderDocument(buyerId, orderId, documentId);
  }

  listAllDocuments(buyerId: string, type?: DocumentType | 'all') {
    return this.salesRepository.listAllDocuments(buyerId, type);
  }

  listComplaints(buyerId: string) {
    return this.salesRepository.listComplaints(buyerId);
  }

  findComplaint(buyerId: string, complaintId: string) {
    return this.salesRepository.findComplaint(buyerId, complaintId);
  }

  createComplaint(buyerId: string, input: CreateComplaintInput) {
    return this.salesRepository.createComplaint(buyerId, input);
  }

  getProfile(buyerId: string) {
    return this.salesRepository.getProfile(buyerId);
  }

  updateProfile(buyerId: string, input: Partial<BuyerProfile>) {
    return this.salesRepository.updateProfile(buyerId, input);
  }

  listAddresses(buyerId: string) {
    return this.salesRepository.listAddresses(buyerId);
  }

  createAddress(buyerId: string, input: AddressInput) {
    return this.salesRepository.createAddress(buyerId, input);
  }

  updateAddress(buyerId: string, addressId: string, input: Partial<AddressInput> & { isDefault?: boolean }) {
    return this.salesRepository.updateAddress(buyerId, addressId, input);
  }

  deleteAddress(buyerId: string, addressId: string) {
    return this.salesRepository.deleteAddress(buyerId, addressId);
  }
}
