import { addresses as fallbackAddresses, complaints as fallbackComplaints, orders as fallbackOrders } from '@/lib/mock/orders';
import { products as fallbackProducts } from '@/lib/mock/products';
import type { OrderDocument } from '@/lib/types/document';
import type { Product } from '@/lib/types/product';
import type { Address, Complaint, ComplaintType, Order } from '@/lib/types/order';
import type { TraceabilityChain } from '@/lib/types/traceability';

const API_BASE_URL = process.env.NEXT_PUBLIC_BA33_API_URL ?? process.env.BA33_API_URL ?? 'http://localhost:3000/api/v1';

type ProductPayload = Omit<Product, 'nfnCertifiedAt' | 'createdAt' | 'traceability'> & {
  nfnCertifiedAt?: string;
  createdAt: string;
  traceability: TraceabilityPayload;
};

type TraceabilityPayload = {
  collectionEvent: Omit<TraceabilityChain['collectionEvent'], 'collectedAt'> & { collectedAt: string };
  depotD1Event: Omit<TraceabilityChain['depotD1Event'], 'receivedAt'> & { receivedAt: string };
  transportEvent: Omit<TraceabilityChain['transportEvent'], 'departedAt' | 'arrivedAt'> & { departedAt: string; arrivedAt: string };
  laverieD2Event: Omit<TraceabilityChain['laverieD2Event'], 'processedAt'> & { processedAt: string };
  transformationEvent: Omit<TraceabilityChain['transformationEvent'], 'processedAt'> & { processedAt: string };
  certificationEvent: Omit<TraceabilityChain['certificationEvent'], 'certifiedAt'> & { certifiedAt: string };
};

type OrderDocumentPayload = Omit<OrderDocument, 'createdAt'> & { createdAt: string };

type OrderPayload = Omit<Order, 'placedAt' | 'estimatedDelivery' | 'deliveredAt' | 'documents'> & {
  placedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  documents: OrderDocumentPayload[];
};

type ComplaintPayload = Omit<Complaint, 'submittedAt'> & { submittedAt: string };

type PaginatedPayload<T> = {
  items: T[];
};

type CreateAddressInput = Omit<Address, 'id' | 'isDefault'>;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`BA33 API ${response.status} for ${path}`);
  }

  return response.json() as Promise<T>;
}

async function apiFetchText(path: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`BA33 API ${response.status} for ${path}`);
  }

  return response.text();
}

async function withFallback<T>(request: Promise<T>, fallback: T): Promise<T> {
  try {
    return await request;
  } catch {
    return fallback;
  }
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

export async function getProducts(query?: URLSearchParams): Promise<Product[]> {
  const suffix = query && query.size > 0 ? `?${query.toString()}` : '';
  const payload = await withFallback(apiFetch<PaginatedPayload<ProductPayload>>(`/products${suffix}`), { items: fallbackProducts as unknown as ProductPayload[] });
  return payload.items.map(toProduct);
}

export async function getProduct(productId: string): Promise<Product | undefined> {
  const fallback = fallbackProducts.find((product) => product.id === productId);
  const payload = await withFallback(apiFetch<ProductPayload>(`/products/${encodeURIComponent(productId)}`), fallback as unknown as ProductPayload | undefined);
  return payload ? toProduct(payload) : undefined;
}

export async function getOrders(query?: URLSearchParams): Promise<Order[]> {
  const suffix = query && query.size > 0 ? `?${query.toString()}` : '';
  const payload = await withFallback(apiFetch<PaginatedPayload<OrderPayload>>(`/orders${suffix}`), { items: fallbackOrders as unknown as OrderPayload[] });
  return payload.items.map(toOrder);
}

export async function getOrder(orderId: string): Promise<Order | undefined> {
  const fallback = fallbackOrders.find((order) => order.id === orderId);
  const payload = await withFallback(apiFetch<OrderPayload>(`/orders/${encodeURIComponent(orderId)}`), fallback as unknown as OrderPayload | undefined);
  return payload ? toOrder(payload) : undefined;
}

export async function getDocuments(type?: string): Promise<OrderDocument[]> {
  const suffix = type && type !== 'all' ? `?type=${encodeURIComponent(type)}` : '';
  const fallback = fallbackOrders.flatMap((order) => order.documents);
  const payload = await withFallback(apiFetch<OrderDocumentPayload[]>(`/documents${suffix}`), fallback as unknown as OrderDocumentPayload[]);
  return payload.map(toDocument);
}

export async function getOrderDocumentText(orderId: string, documentId: string): Promise<string> {
  return withFallback(
    apiFetchText(`/orders/${encodeURIComponent(orderId)}/documents/${encodeURIComponent(documentId)}/download`),
    `${documentId}\nCommande: ${orderId}`,
  );
}

export async function getComplaints(): Promise<Complaint[]> {
  const payload = await withFallback(apiFetch<ComplaintPayload[]>('/complaints'), fallbackComplaints as unknown as ComplaintPayload[]);
  return payload.map(toComplaint);
}

export async function createComplaint(input: { orderId: string; type: ComplaintType }): Promise<Complaint> {
  const payload = await apiFetch<ComplaintPayload>('/complaints', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return toComplaint(payload);
}

export async function getAddresses(): Promise<Address[]> {
  return withFallback(apiFetch<Address[]>('/buyer/addresses'), fallbackAddresses);
}

export async function createAddress(input: CreateAddressInput): Promise<Address> {
  return apiFetch<Address>('/buyer/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateAddress(addressId: string, input: Partial<CreateAddressInput> & { isDefault?: boolean }): Promise<Address> {
  return apiFetch<Address>(`/buyer/addresses/${encodeURIComponent(addressId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteAddress(addressId: string): Promise<void> {
  await apiFetch<{ deleted: true }>(`/buyer/addresses/${encodeURIComponent(addressId)}`, {
    method: 'DELETE',
  });
}
