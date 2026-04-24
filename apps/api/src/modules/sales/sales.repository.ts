import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  addresses,
  buyerProfile,
  complaints,
  orders,
  products,
  BuyerAddress,
  BuyerComplaint,
  BuyerOrder,
  BuyerProduct,
  BuyerProfile,
  ComplaintType,
  DocumentType,
  OrderItem,
  OrderStatus,
  ProductGrade,
  ProductType,
  SalesChannel,
} from './buyer-read-model';

export interface ProductQuery {
  type?: ProductType | 'all';
  grade?: ProductGrade | string;
  region?: string;
  certified?: string;
  inStock?: string;
  channel?: SalesChannel;
  sortBy?: 'price_asc' | 'price_desc' | 'grade' | 'availability' | 'created_at';
  page?: string;
  limit?: string;
}

export interface OrderQuery {
  status?: OrderStatus | 'all';
  page?: string;
  limit?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateOrderInput {
  channel?: SalesChannel;
  items?: OrderItem[];
  shippingAddressId?: string;
}

export interface CreateComplaintInput {
  orderId: string;
  type: ComplaintType;
}

export interface AddressInput {
  siteName: string;
  line1: string;
  line2?: string;
  commune: string;
  wilaya: string;
  postalCode: string;
  instructions?: string;
}

@Injectable()
export class SalesRepository {
  private readonly products = [...products];
  private readonly orders = [...orders];
  private readonly addresses = [...addresses];
  private readonly complaints = [...complaints];
  private profile: BuyerProfile = { ...buyerProfile };

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  listProducts(query: ProductQuery): PaginatedResponse<BuyerProduct> {
    let result = [...this.products];

    if (query.type && query.type !== 'all') {
      result = result.filter((product) => product.type === query.type);
    }

    if (query.grade) {
      const grades = query.grade.split(',').filter(Boolean);
      result = result.filter((product) => grades.includes(product.grade));
    }

    if (query.region && query.region !== 'Toutes') {
      result = result.filter((product) => product.region === query.region);
    }

    if (query.certified === 'true') {
      result = result.filter((product) => product.nfnSealStatus === 'certified');
    }

    if (query.inStock === 'true') {
      result = result.filter((product) => product.availableQuantityKg > 0);
    }

    result.sort((left, right) => {
      switch (query.sortBy) {
        case 'price_desc':
          return right.pricePerKgDzd - left.pricePerKgDzd;
        case 'grade':
          return left.grade.localeCompare(right.grade);
        case 'availability':
          return right.availableQuantityKg - left.availableQuantityKg;
        case 'created_at':
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        case 'price_asc':
        default:
          return left.pricePerKgDzd - right.pricePerKgDzd;
      }
    });

    return this.paginate(result, query.page, query.limit);
  }

  findProduct(productId: string): BuyerProduct | undefined {
    return this.products.find((product) => product.id === productId || product.code === productId);
  }

  findProductByCertificate(code: string): BuyerProduct | undefined {
    const normalized = code.toLowerCase();
    return this.products.find((product) => product.nfnSealCode?.toLowerCase() === normalized || product.code.toLowerCase() === normalized);
  }

  listOrders(query: OrderQuery): PaginatedResponse<BuyerOrder> {
    const filtered = query.status && query.status !== 'all' ? this.orders.filter((order) => order.status === query.status) : this.orders;
    return this.paginate(filtered, query.page, query.limit);
  }

  findOrder(orderId: string): BuyerOrder | undefined {
    return this.orders.find((order) => order.id === orderId);
  }

  createOrder(input: CreateOrderInput): BuyerOrder {
    const items = input.items ?? [];
    const totalAmountDzd = items.reduce((sum, item) => sum + item.quantityKg * item.unitPriceDzd, 0);
    const totalQuantityKg = items.reduce((sum, item) => sum + item.quantityKg, 0);
    const shippingAddress = this.addresses.find((address) => address.id === input.shippingAddressId) ?? this.addresses.find((address) => address.isDefault) ?? this.addresses[0];
    const order: BuyerOrder = {
      id: `CMD-${new Date().getUTCFullYear()}-${String(this.orders.length + 1000).padStart(5, '0')}`,
      items,
      status: 'pending',
      channel: input.channel ?? this.profile.preferredChannel,
      totalAmountDzd,
      totalQuantityKg,
      placedAt: new Date().toISOString(),
      shippingAddress,
      documents: [],
    };

    this.orders.unshift(order);
    return order;
  }

  replaceOrderItems(orderId: string, items: OrderItem[]): BuyerOrder | undefined {
    const order = this.findOrder(orderId);

    if (!order) {
      return undefined;
    }

    order.items = items;
    order.totalAmountDzd = items.reduce((sum, item) => sum + item.quantityKg * item.unitPriceDzd, 0);
    order.totalQuantityKg = items.reduce((sum, item) => sum + item.quantityKg, 0);
    return order;
  }

  removeOrderItem(orderId: string, itemId: string): BuyerOrder | undefined {
    const order = this.findOrder(orderId);

    if (!order) {
      return undefined;
    }

    const items = order.items.filter((item) => item.productId !== itemId);
    return this.replaceOrderItems(orderId, items);
  }

  updateOrderStatus(orderId: string, status: OrderStatus): BuyerOrder | undefined {
    const order = this.findOrder(orderId);

    if (!order) {
      return undefined;
    }

    order.status = status;
    return order;
  }

  confirmOrder(orderId: string): BuyerOrder | undefined {
    return this.updateOrderStatus(orderId, 'confirmed');
  }

  listOrderDocuments(orderId: string): BuyerOrder['documents'] | undefined {
    return this.findOrder(orderId)?.documents;
  }

  findOrderDocument(orderId: string, documentId: string): BuyerOrder['documents'][number] | undefined {
    return this.findOrder(orderId)?.documents.find((document) => document.id === documentId);
  }

  listAllDocuments(type?: DocumentType | 'all'): BuyerOrder['documents'] {
    const documents = this.orders.flatMap((order) => order.documents);
    return type && type !== 'all' ? documents.filter((document) => document.type === type) : documents;
  }

  listComplaints(): BuyerComplaint[] {
    return this.complaints;
  }

  findComplaint(complaintId: string): BuyerComplaint | undefined {
    return this.complaints.find((complaint) => complaint.id === complaintId);
  }

  createComplaint(input: CreateComplaintInput): BuyerComplaint {
    const complaint: BuyerComplaint = {
      id: `REC-${new Date().getUTCFullYear()}-${String(this.complaints.length + 91).padStart(4, '0')}`,
      orderId: input.orderId,
      type: input.type,
      submittedAt: new Date().toISOString(),
      status: 'review',
    };
    this.complaints.unshift(complaint);
    return complaint;
  }

  getProfile(): BuyerProfile {
    return this.profile;
  }

  updateProfile(input: Partial<BuyerProfile>): BuyerProfile {
    this.profile = { ...this.profile, ...input };
    return this.profile;
  }

  listAddresses(): BuyerAddress[] {
    return this.addresses;
  }

  createAddress(input: AddressInput): BuyerAddress {
    const address: BuyerAddress = {
      id: `ADDR-${String(this.addresses.length + 1).padStart(2, '0')}`,
      ...input,
      isDefault: this.addresses.length === 0,
    };
    this.addresses.push(address);
    return address;
  }

  updateAddress(addressId: string, input: Partial<AddressInput> & { isDefault?: boolean }): BuyerAddress | undefined {
    const address = this.addresses.find((item) => item.id === addressId);

    if (!address) {
      return undefined;
    }

    if (input.isDefault) {
      this.addresses.forEach((item) => {
        item.isDefault = item.id === addressId;
      });
    }

    Object.assign(address, input);
    return address;
  }

  deleteAddress(addressId: string): boolean {
    const index = this.addresses.findIndex((address) => address.id === addressId);

    if (index < 0) {
      return false;
    }

    this.addresses.splice(index, 1);
    return true;
  }

  private paginate<T>(items: T[], rawPage?: string, rawLimit?: string): PaginatedResponse<T> {
    const page = Math.max(1, Number(rawPage ?? '1'));
    const limit = Math.max(1, Number(rawLimit ?? '20'));
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (Math.min(page, totalPages) - 1) * limit;

    return {
      items: items.slice(start, start + limit),
      page: Math.min(page, totalPages),
      limit,
      total,
      totalPages,
    };
  }
}
