import type { OrderDocument } from "./document";
import type { ProductGrade } from "./product";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "disputed";

export type SalesChannel = "national" | "export" | "institutional";

export interface Address {
  id: string;
  siteName: string;
  line1: string;
  line2?: string;
  commune: string;
  wilaya: string;
  postalCode: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  productCode: string;
  productName: string;
  grade: ProductGrade;
  quantityKg: number;
  unitPriceDzd: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  channel: SalesChannel;
  totalAmountDzd: number;
  totalQuantityKg: number;
  placedAt: Date;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  shippingAddress: Address;
  trackingNumber?: string;
  documents: OrderDocument[];
}

export type ComplaintType =
  | "quality"
  | "quantity"
  | "delivery"
  | "certificate"
  | "other";

export type ComplaintStatus = "review" | "resolved" | "rejected";

export interface Complaint {
  id: string;
  orderId: string;
  type: ComplaintType;
  submittedAt: Date;
  status: ComplaintStatus;
}
