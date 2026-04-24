const SERVER_API_BASE_URL =
  process.env.BA33_API_URL ??
  process.env.NEXT_PUBLIC_BA33_API_URL ??
  "http://localhost:3001";

const CLIENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_BA33_API_URL ?? "http://localhost:3001";

export function getClientApiBaseUrl() {
  return CLIENT_API_BASE_URL;
}

function getApiBaseUrl() {
  return typeof window === "undefined"
    ? SERVER_API_BASE_URL
    : CLIENT_API_BASE_URL;
}

async function fetchApi<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export interface LotsSummaryResponse {
  summary: {
    totalLots: number;
    urgentLots: number;
    inTransitLots: number;
    inDepotLots: number;
    certifiedLots: number;
    soldLots: number;
    statusBreakdown: Array<{ status: string; count: number }>;
  };
  recentLots: Array<{
    id: string;
    qrCode: string;
    sourceType: string | null;
    status: string;
    urgency: string | null;
    declaredWeightKg: string | null;
    actualWeightKg: string | null;
    stateQuick: string | null;
    collectedAt: string | null;
    createdAt: string;
  }>;
}

export interface RecentEvent {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  actorType: string;
  actorName: string | null;
  occurredAt: string;
  recordedAt: string;
}

export interface DepotOverviewResponse {
  summary: {
    totalDepots: number;
    activeDepots: number;
    totalCapacityKg: number;
    currentWeightKg: number;
    occupancyRate: number;
    openAlerts: number;
  };
  depots: Array<{
    id: string;
    name: string;
    address: string;
    active: boolean;
    capacityKg: string;
    currentWeightKg: string;
    updatedAt: string;
    regionName: string | null;
    managerName: string | null;
    occupancyRate: number;
  }>;
  recentReceptions: Array<{
    id: string;
    depotName: string | null;
    lotId: string | null;
    lotQrCode: string | null;
    actualWeightKg: string;
    discrepancyKg: string;
    toleranceExceeded: boolean;
    zoneCode: string | null;
    receivedAt: string;
  }>;
  recentAlerts: Array<{
    id: string;
    depotName: string | null;
    severity: string;
    status: string;
    firedAt: string;
    resolvedAt: string | null;
  }>;
}

export interface TransportOverviewResponse {
  summary: {
    totalJobs: number;
    pendingJobs: number;
    activeJobs: number;
    deliveredJobs: number;
    cancelledJobs: number;
    urgentJobs: number;
    statusBreakdown: Array<{ status: string; count: number }>;
  };
  jobs: Array<{
    id: string;
    status: string;
    lane: string;
    originType: string;
    destinationType: string;
    requestedAt: string;
    acceptedAt: string | null;
    completedAt: string | null;
    slaDeadline: string | null;
    transporterName: string | null;
    lotCount: number;
  }>;
}

export interface LaverieOverviewResponse {
  summary: {
    totalLaveries: number;
    activeLaveries: number;
    activeRuns: number;
    totalWashRuns: number;
    gradedLots: number;
  };
  laveries: Array<{
    id: string;
    name: string;
    address: string;
    dailyCapacityKg: string;
    active: boolean;
    managerName: string | null;
  }>;
  activeRuns: Array<{
    id: string;
    laverieName: string | null;
    dirtyWeightKg: string;
    waterLiters: string | null;
    waterTempC: string | null;
    startedAt: string;
    operatorName: string | null;
  }>;
  recentQualifications: Array<{
    id: string;
    grade: string;
    safetyStatus: string;
    fiberLengthMm: string | null;
    fiberDiameterMicron: string | null;
    performedAt: string;
    analystName: string | null;
  }>;
}

export interface TransformationOverviewResponse {
  summary: {
    totalTransformers: number;
    activeTransformers: number;
    activeRuns: number;
    totalRuns: number;
    recentProducts: number;
  };
  transformers: Array<{
    id: string;
    name: string;
    track: string;
    address: string;
    dailyCapacityKg: string;
    active: boolean;
    managerName: string | null;
  }>;
  activeRuns: Array<{
    id: string;
    transformerName: string | null;
    inputWeightKg: string;
    outputWeightKg: string | null;
    startedAt: string;
    operatorName: string | null;
  }>;
  recentProducts: Array<{
    id: string;
    productCode: string;
    productTypeCode: string;
    track: string;
    quantity: string;
    weightKg: string;
    status: string;
    createdAt: string;
  }>;
}

export interface SalesOverviewResponse {
  summary: {
    totalOrders: number;
    openOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    returnedOrders: number;
    statusBreakdown: Array<{ status: string; count: number }>;
  };
  orders: Array<{
    id: string;
    channel: string;
    status: string;
    paymentStatus: string;
    total: string;
    currency: string;
    createdAt: string;
    confirmedAt: string | null;
    buyerCompanyName: string | null;
  }>;
}

export interface CertificationOverviewResponse {
  summary: {
    totalCertifications: number;
    pending: number;
    issued: number;
    revoked: number;
    statusBreakdown: Array<{ status: string; count: number }>;
  };
  certifications: Array<{
    id: string;
    productCode: string;
    status: string;
    qrCodeUrl: string;
    issuedAt: string | null;
    revokedAt: string | null;
    createdAt: string;
    issuedByName: string | null;
  }>;
}

export interface UsersOverviewResponse {
  summary: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    deletedUsers: number;
    typeBreakdown: Array<{ userType: string; count: number }>;
    statusBreakdown: Array<{ status: string; count: number }>;
  };
  users: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    userType: string;
    status: string;
    lastLoginAt: string | null;
    createdAt: string;
    regionName: string | null;
  }>;
}

export interface RegionsOverviewResponse {
  summary: {
    totalRegions: number;
    typeBreakdown: Array<{ type: string; count: number }>;
  };
  regions: Array<{
    id: string;
    name: string;
    code: string;
    parentId: string | null;
    type: string;
    latitude: string | null;
    longitude: string | null;
    createdAt: string;
  }>;
}

export interface RulesOverviewResponse {
  summary: {
    totalRules: number;
    activeRules: number;
  };
  rules: Array<{
    id: string;
    ruleKey: string;
    description: string | null;
    version: number | null;
    effectiveFrom: string;
    effectiveTo: string | null;
    createdAt: string;
    createdByName: string | null;
  }>;
}

export function getLotsSummary() {
  return fetchApi<LotsSummaryResponse>("/lots/summary");
}

export function getRecentEvents() {
  return fetchApi<RecentEvent[]>("/events/recent");
}

export function getDepotOverview() {
  return fetchApi<DepotOverviewResponse>("/depot/overview");
}

export function getTransportOverview() {
  return fetchApi<TransportOverviewResponse>("/transport/overview");
}

export function getLaverieOverview() {
  return fetchApi<LaverieOverviewResponse>("/laverie/overview");
}

export function getTransformationOverview() {
  return fetchApi<TransformationOverviewResponse>("/transformation/overview");
}

export function getSalesOverview() {
  return fetchApi<SalesOverviewResponse>("/sales/overview");
}

export function getCertificationOverview() {
  return fetchApi<CertificationOverviewResponse>("/certification/overview");
}

export function getUsersOverview() {
  return fetchApi<UsersOverviewResponse>("/users/overview");
}

export function getRegionsOverview() {
  return fetchApi<RegionsOverviewResponse>("/regions/overview");
}

export function getRulesOverview() {
  return fetchApi<RulesOverviewResponse>("/rules/overview");
}
