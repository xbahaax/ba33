import type { OrderDocument } from "@/lib/types/document";
import type { Product } from "@/lib/types/product";
import type { Address, Complaint, ComplaintType, Order } from "@/lib/types/order";
import type { TraceabilityChain } from "@/lib/types/traceability";

export const AUTH_COOKIE_NAME = "ba33_buyer_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_BA33_API_URL ?? process.env.BA33_API_URL ?? "http://localhost:3000/api/v1";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  userType: "buyer";
  profile: {
    companyName: string;
    registrationNumber: string;
    sector: string;
    website: string;
    firstName: string;
    lastName: string;
    phone: string;
    preferredChannel: "national" | "export" | "institutional";
    language: "fr" | "ar" | "en";
    currency: "DZD" | "EUR" | "USD";
    twoFactorEnabled: boolean;
    notifications: {
      orderConfirmations: boolean;
      shipments: boolean;
      newAvailability: boolean;
      offers: boolean;
    };
  };
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
  user: SessionUser;
}

export interface BuyerNotification {
  id: string;
  type: "order" | "delivery" | "certificate" | "complaint";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export interface CertificationVerification {
  code: string;
  status: "valid" | "revoked" | "not_found";
  productId?: string;
  productType?: "P1" | "P2";
  grade?: "A" | "B" | "C";
  originRegion?: string;
  certifiedAt?: string;
  nfnSealId?: string;
  traceabilitySummary?: {
    sourceCount: number;
    collectionDate: string;
    washingYieldPercent: number;
    auditsPassed: string[];
  };
}

type ProductPayload = Omit<Product, "nfnCertifiedAt" | "createdAt" | "traceability"> & {
  nfnCertifiedAt?: string;
  createdAt: string;
  traceability: TraceabilityPayload;
};

type TraceabilityPayload = {
  collectionEvent: Omit<TraceabilityChain["collectionEvent"], "collectedAt"> & { collectedAt: string };
  depotD1Event: Omit<TraceabilityChain["depotD1Event"], "receivedAt"> & { receivedAt: string };
  transportEvent: Omit<TraceabilityChain["transportEvent"], "departedAt" | "arrivedAt"> & { departedAt: string; arrivedAt: string };
  laverieD2Event: Omit<TraceabilityChain["laverieD2Event"], "processedAt"> & { processedAt: string };
  transformationEvent: Omit<TraceabilityChain["transformationEvent"], "processedAt"> & { processedAt: string };
  certificationEvent: Omit<TraceabilityChain["certificationEvent"], "certifiedAt"> & { certifiedAt: string };
};

type OrderDocumentPayload = Omit<OrderDocument, "createdAt"> & { createdAt: string };

type OrderPayload = Omit<Order, "placedAt" | "estimatedDelivery" | "deliveredAt" | "documents"> & {
  placedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  documents: OrderDocumentPayload[];
};

type ComplaintPayload = Omit<Complaint, "submittedAt"> & { submittedAt: string };

type PaginatedPayload<T> = {
  items: T[];
};

type CreateAddressInput = Omit<Address, "id" | "isDefault">;

type CreateOrderInput = {
  channel?: "national" | "export" | "institutional";
  shippingAddressId?: string;
  items?: Array<{
    productId: string;
    productCode: string;
    productName: string;
    grade: "A" | "B" | "C";
    quantityKg: number;
    unitPriceDzd: number;
  }>;
};

function readClientAuthToken(): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const tokenChunk = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!tokenChunk) {
    return undefined;
  }

  return decodeURIComponent(tokenChunk.slice(AUTH_COOKIE_NAME.length + 1));
}

function createHeaders(init?: RequestInit, token?: string): Headers {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const resolvedToken = token ?? readClientAuthToken();
  if (resolvedToken) {
    headers.set("Authorization", `Bearer ${resolvedToken}`);
  }

  return headers;
}

async function apiFetch<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: createHeaders(init, token),
  });

  if (!response.ok) {
    throw new Error(`BA33 API ${response.status} for ${path}`);
  }

  return response.json() as Promise<T>;
}

async function apiFetchText(path: string, token?: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: createHeaders(undefined, token),
  });

  if (!response.ok) {
    throw new Error(`BA33 API ${response.status} for ${path}`);
  }

  return response.text();
}


function toTraceability(payload: TraceabilityPayload): TraceabilityChain {
  return {
    collectionEvent: { ...payload.collectionEvent, collectedAt: new Date(payload.collectionEvent.collectedAt) },
    depotD1Event: { ...payload.depotD1Event, receivedAt: new Date(payload.depotD1Event.receivedAt) },
    transportEvent: {
      ...payload.transportEvent,
      departedAt: new Date(payload.transportEvent.departedAt),
      arrivedAt: new Date(payload.transportEvent.arrivedAt),
    },
    laverieD2Event: { ...payload.laverieD2Event, processedAt: new Date(payload.laverieD2Event.processedAt) },
    transformationEvent: { ...payload.transformationEvent, processedAt: new Date(payload.transformationEvent.processedAt) },
    certificationEvent: { ...payload.certificationEvent, certifiedAt: new Date(payload.certificationEvent.certifiedAt) },
  };
}

function toProduct(payload: ProductPayload): Product {
  return {
    ...payload,
    nfnCertifiedAt: payload.nfnCertifiedAt ? new Date(payload.nfnCertifiedAt) : undefined,
    traceability: toTraceability(payload.traceability),
    createdAt: new Date(payload.createdAt),
  };
}

function toDocument(payload: OrderDocumentPayload): OrderDocument {
  return {
    ...payload,
    createdAt: new Date(payload.createdAt),
  };
}

function toOrder(payload: OrderPayload): Order {
  return {
    ...payload,
    placedAt: new Date(payload.placedAt),
    estimatedDelivery: payload.estimatedDelivery ? new Date(payload.estimatedDelivery) : undefined,
    deliveredAt: payload.deliveredAt ? new Date(payload.deliveredAt) : undefined,
    documents: payload.documents.map(toDocument),
  };
}

function toComplaint(payload: ComplaintPayload): Complaint {
  return {
    ...payload,
    submittedAt: new Date(payload.submittedAt),
  };
}

export async function loginBuyer(input: { email: string; password: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function registerBuyer(input: {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  registrationNumber: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getMe(token: string): Promise<SessionUser> {
  return apiFetch<SessionUser>("/auth/me", undefined, token);
}

export async function updateMyProfile(
  token: string,
  updates: Partial<SessionUser["profile"]>,
): Promise<SessionUser> {
  return apiFetch<SessionUser>(
    "/auth/profile",
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    },
    token,
  );
}

export async function changeMyPassword(
  token: string,
  payload: { currentPassword: string; nextPassword: string },
): Promise<{ updated: true }> {
  return apiFetch<{ updated: true }>(
    "/auth/password",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export async function getProducts(query?: URLSearchParams): Promise<Product[]> {
  const suffix = query && query.size > 0 ? `?${query.toString()}` : "";
  const payload = await apiFetch<PaginatedPayload<ProductPayload>>(`/products${suffix}`);
  return payload.items.map(toProduct);
}

export async function getProduct(productId: string): Promise<Product | undefined> {
  try {
    const payload = await apiFetch<ProductPayload>(`/products/${encodeURIComponent(productId)}`);
    return toProduct(payload);
  } catch {
    return undefined;
  }
}

export async function verifyCertificate(
  value: string,
  mode: "code" | "qr" = "code",
): Promise<CertificationVerification> {
  const endpoint = mode === "qr" ? `/certification/verify/qr/${encodeURIComponent(value)}` : `/certification/verify/${encodeURIComponent(value)}`;
  return apiFetch<CertificationVerification>(endpoint);
}

export async function getOrders(query?: URLSearchParams, token?: string): Promise<Order[]> {
  const suffix = query && query.size > 0 ? `?${query.toString()}` : "";
  const payload = await apiFetch<PaginatedPayload<OrderPayload>>(`/orders${suffix}`, undefined, token);
  return payload.items.map(toOrder);
}

export async function getOrder(orderId: string, token?: string): Promise<Order | undefined> {
  try {
    const payload = await apiFetch<OrderPayload>(`/orders/${encodeURIComponent(orderId)}`, undefined, token);
    return toOrder(payload);
  } catch {
    return undefined;
  }
}

export async function createOrder(input: CreateOrderInput, token?: string): Promise<Order> {
  const payload = await apiFetch<OrderPayload>(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    token,
  );
  return toOrder(payload);
}

export async function getDocuments(type?: string, token?: string): Promise<OrderDocument[]> {
  const suffix = type && type !== "all" ? `?type=${encodeURIComponent(type)}` : "";
  const payload = await apiFetch<OrderDocumentPayload[]>(`/documents${suffix}`, undefined, token);
  return payload.map(toDocument);
}

export async function getOrderDocumentText(orderId: string, documentId: string, token?: string): Promise<string> {
  return apiFetchText(`/orders/${encodeURIComponent(orderId)}/documents/${encodeURIComponent(documentId)}/download`, token);
}

export async function getComplaints(token?: string): Promise<Complaint[]> {
  const payload = await apiFetch<ComplaintPayload[]>("/complaints", undefined, token);
  return payload.map(toComplaint);
}

export async function createComplaint(
  input: { orderId: string; type: ComplaintType; description?: string; resolution?: string },
  token?: string,
): Promise<Complaint> {
  const payload = await apiFetch<ComplaintPayload>(
    "/complaints",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    token,
  );
  return toComplaint(payload);
}

export async function getAddresses(token?: string): Promise<Address[]> {
  return apiFetch<Address[]>("/buyer/addresses", undefined, token);
}

export async function createAddress(input: CreateAddressInput, token?: string): Promise<Address> {
  return apiFetch<Address>(
    "/buyer/addresses",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    token,
  );
}

export async function updateAddress(
  addressId: string,
  input: Partial<CreateAddressInput> & { isDefault?: boolean },
  token?: string,
): Promise<Address> {
  return apiFetch<Address>(
    `/buyer/addresses/${encodeURIComponent(addressId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
    token,
  );
}

export async function deleteAddress(addressId: string, token?: string): Promise<void> {
  await apiFetch<{ deleted: true }>(
    `/buyer/addresses/${encodeURIComponent(addressId)}`,
    {
      method: "DELETE",
    },
    token,
  );
}

export async function getNotifications(token?: string): Promise<BuyerNotification[]> {
  return apiFetch<BuyerNotification[]>("/notifications", undefined, token);
}

export async function markAllNotificationsRead(token?: string): Promise<BuyerNotification[]> {
  return apiFetch<BuyerNotification[]>(
    "/notifications/read-all",
    {
      method: "PATCH",
    },
    token,
  );
}

export async function dismissNotification(notificationId: string, token?: string): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(`/notifications/${encodeURIComponent(notificationId)}`, { method: "DELETE" }, token);
}
