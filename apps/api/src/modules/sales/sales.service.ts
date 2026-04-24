import { Injectable } from '@nestjs/common';
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

  listProducts(query: ProductQuery) {
    return this.salesRepository.listProducts(query);
  }

  findProduct(productId: string) {
    return this.salesRepository.findProduct(productId);
  }

  findProductByCertificate(code: string) {
    return this.salesRepository.findProductByCertificate(code);
  }

  listOrders(query: OrderQuery) {
    return this.salesRepository.listOrders(query);
  }

  findOrder(orderId: string) {
    return this.salesRepository.findOrder(orderId);
  }

  createOrder(input: CreateOrderInput) {
    return this.salesRepository.createOrder(input);
  }

  replaceOrderItems(orderId: string, items: OrderItem[]) {
    return this.salesRepository.replaceOrderItems(orderId, items);
  }

  removeOrderItem(orderId: string, itemId: string) {
    return this.salesRepository.removeOrderItem(orderId, itemId);
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.salesRepository.updateOrderStatus(orderId, status);
  }

  confirmOrder(orderId: string) {
    return this.salesRepository.confirmOrder(orderId);
  }

  listOrderDocuments(orderId: string) {
    return this.salesRepository.listOrderDocuments(orderId);
  }

  findOrderDocument(orderId: string, documentId: string) {
    return this.salesRepository.findOrderDocument(orderId, documentId);
  }

  listAllDocuments(type?: DocumentType | 'all') {
    return this.salesRepository.listAllDocuments(type);
  }

  listComplaints() {
    return this.salesRepository.listComplaints();
  }

  findComplaint(complaintId: string) {
    return this.salesRepository.findComplaint(complaintId);
  }

  createComplaint(input: CreateComplaintInput) {
    return this.salesRepository.createComplaint(input);
  }

  getProfile() {
    return this.salesRepository.getProfile();
  }

  updateProfile(input: Partial<BuyerProfile>) {
    return this.salesRepository.updateProfile(input);
  }

  listAddresses() {
    return this.salesRepository.listAddresses();
  }

  createAddress(input: AddressInput) {
    return this.salesRepository.createAddress(input);
  }

  updateAddress(addressId: string, input: Partial<AddressInput> & { isDefault?: boolean }) {
    return this.salesRepository.updateAddress(addressId, input);
  }

  deleteAddress(addressId: string) {
    return this.salesRepository.deleteAddress(addressId);
  }
}
