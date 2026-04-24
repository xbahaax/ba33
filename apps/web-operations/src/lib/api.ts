const SERVER_API_BASE_URL =
  process.env.BA33_API_URL ??
  process.env.NEXT_PUBLIC_BA33_API_URL ??
  "http://127.0.0.1:3001";

const CLIENT_API_BASE_URL =
  process.env.NEXT_PUBLIC_BA33_API_URL ?? "/_ba33_api";

const ACCESS_TOKEN_STORAGE_KEY = "ba33.web-operations.access-token";

type RequestApiOptions = {
  body?: unknown;
  headers?: HeadersInit;
  method?: string;
  token?: string | null;
};

export function getClientApiBaseUrl() {
  return CLIENT_API_BASE_URL;
}

function getApiBaseUrl() {
  return typeof window === "undefined"
    ? SERVER_API_BASE_URL
    : CLIENT_API_BASE_URL;
}

export function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setStoredAccessToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

async function requestApi<T>(
  path: string,
  { body, headers, method = "GET", token }: RequestApiOptions = {},
): Promise<T | null> {
  try {
    const resolvedHeaders = new Headers(headers);
    const accessToken = token ?? getStoredAccessToken();

    if (accessToken) {
      resolvedHeaders.set("Authorization", `Bearer ${accessToken}`);
    }

    const hasBody = body !== undefined;

    if (hasBody && !resolvedHeaders.has("Content-Type")) {
      resolvedHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: resolvedHeaders,
      body: hasBody ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchApi<T>(path: string) {
  return requestApi<T>(path);
}

async function mutateApi<T>(
  path: string,
  options: Omit<RequestApiOptions, "method"> & { method: "POST" | "PATCH" | "PUT" | "DELETE" },
) {
  return requestApi<T>(path, options);
}

export interface AuthAssignedRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface AuthSessionUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  userType: string;
  status: string;
  regionId: string | null;
  regionName: string | null;
  lastLoginAt: string | null;
}

export interface AuthSessionResponse {
  user: AuthSessionUser;
  permissions: string[];
  assignedRoles: AuthAssignedRole[];
  hasWebOperationsAccess: boolean;
}

export interface DevLoginResponse {
  accessToken: string;
  session: AuthSessionResponse;
}

export interface DevPersona {
  id: string;
  email: string;
  fullName: string;
  userType: string;
  status: string;
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
  recordedAt?: string;
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
    value: Record<string, unknown> | null;
    effectiveFrom: string;
    effectiveTo: string | null;
    createdAt: string;
    createdByName: string | null;
    isActive: boolean;
  }>;
}

export interface CommandCenterResponse {
  summary: {
    announcedPreLots: number;
    announcedWeightKg: number;
    inTransitLots: number;
    inTransitWeightKg: number;
    depotLots: number;
    depotWeightKg: number;
    activeWashRuns: number;
    washingWeightKg: number;
    activeProductionRuns: number;
    productionWeightKg: number;
    pendingCertifications: number;
    openOrders: number;
    openAlerts: number;
  };
  flow: Array<{
    stage: string;
    label: string;
    count: number;
    weightKg: number;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    title: string;
    severity: string;
    status: string;
    detail: string;
    occurredAt: string;
  }>;
  recentEvents: RecentEvent[];
  transportWatch: Array<{
    id: string;
    lane: string;
    status: string;
    originType: string;
    destinationType: string;
    requestedAt: string;
    slaDeadline: string | null;
    transporterName: string | null;
    lotCount: number;
  }>;
  terrainNodes: Array<{
    id: string;
    label: string;
    nodeType: string;
    status: string;
    regionName: string | null;
    latitude: string | null;
    longitude: string | null;
  }>;
}

export interface FulfillmentOverviewResponse {
  summary: {
    collectionQueue: number;
    transportQueue: number;
    depotQueue: number;
    washingQueue: number;
    qualificationQueue: number;
    productionQueue: number;
    salesQueue: number;
  };
  collectionQueue: Array<{
    id: string;
    status: string;
    estimatedWeightKg: string;
    scheduledAt: string | null;
    sourceName: string | null;
    sourceType: string | null;
    regionName: string | null;
    assignedCollectorName: string | null;
  }>;
  transportQueue: Array<{
    id: string;
    lane: string;
    status: string;
    originType: string;
    destinationType: string;
    requestedAt: string;
    acceptedAt: string | null;
    slaDeadline: string | null;
    transporterName: string | null;
    lotCount: number;
  }>;
  depotQueue: Array<{
    id: string;
    qrCode: string;
    status: string;
    urgency: string | null;
    sourceType: string | null;
    weightKg: number;
    collectedAt: string | null;
    depotName: string | null;
    zoneCode: string | null;
  }>;
  washingQueue: Array<{
    id: string;
    lotId: string;
    lotQrCode: string | null;
    laverieName: string | null;
    dirtyWeightKg: string;
    cleanWeightKg: string | null;
    startedAt: string;
    completedAt: string | null;
    operatorName: string | null;
  }>;
  qualificationQueue: Array<{
    id: string;
    lotId: string;
    lotQrCode: string | null;
    grade: string;
    safetyStatus: string;
    performedAt: string;
    analystName: string | null;
  }>;
  productionQueue: Array<{
    id: string;
    status: string;
    transformerName: string | null;
    productName: string;
    track: string | null;
    inputWeightKg: string;
    outputWeightKg: string | null;
    startedAt: string;
    completedAt: string | null;
    operatorName: string | null;
  }>;
  salesQueue: Array<{
    id: string;
    buyerCompanyName: string | null;
    channel: string;
    status: string;
    paymentStatus: string;
    total: string;
    currency: string;
    createdAt: string;
    confirmedAt: string | null;
  }>;
}

export interface ValidationOverviewResponse {
  summary: {
    openA1Alerts: number;
    weightAlerts: number;
    safetyFlags: number;
    pendingCertifications: number;
    revokedCertifications: number;
    urgentLotsAtRisk: number;
  };
  a1Queue: Array<{
    id: string;
    depotName: string | null;
    severity: string;
    status: string;
    firedAt: string;
    resolvedAt: string | null;
  }>;
  weightAlerts: Array<{
    id: string;
    sourceType: string;
    reference: string | null;
    phase: string;
    deltaKg: number;
    toleranceExceeded: boolean;
    detail: string;
    occurredAt: string | null;
  }>;
  safetyFindings: Array<{
    id: string;
    lotQrCode: string | null;
    grade: string;
    safetyStatus: string;
    contaminationNotes: string | null;
    performedAt: string;
    analystName: string | null;
  }>;
  certificationQueue: Array<{
    id: string;
    productCode: string;
    status: string;
    gatesPassed: Record<string, boolean> | null;
    issuedAt: string | null;
    revokedAt: string | null;
    revokedReason: string | null;
    createdAt: string;
    issuedByName: string | null;
  }>;
  urgentLotsAtRisk: Array<{
    id: string;
    qrCode: string;
    status: string;
    sourceType: string | null;
    collectedAt: string | null;
    currentLocationType: string | null;
    weightKg: number;
    ageHours: number | null;
  }>;
}

export interface TraceabilityLookupResponse {
  entityType: "lot" | "product";
  header: {
    title: string;
    subtitle: string | null;
    status: string | null;
    sourceType?: string | null;
    track?: string | null;
    regionName?: string | null;
    weightKg: number;
  };
  sourceSummary: Array<{
    label: string;
    value: string;
  }>;
  chainOfCustody: Array<{
    id: string;
    stage: string;
    label: string;
    detail: string | null;
    occurredAt: string | null;
    weightKg: number;
    status: string | null;
  }>;
  qualityChecks: Array<{
    id: string;
    grade: string | null;
    safetyStatus: string | null;
    fiberLengthMm: string | null;
    fiberDiameterMicron: string | null;
    contaminationNotes: string | null;
    pricePerKg: string | null;
    totalValue: string | null;
    performedAt: string | null;
  }>;
  weighs: Array<{
    id: string;
    phase: string;
    weightKg: string;
    source: string | null;
    recordedAt: string | null;
  }>;
  downstreamLinks: Array<{
    id: string;
    productCode: string | null;
    productStatus: string | null;
    certificationStatus: string | null;
    transformerName: string | null;
    track: string | null;
  }>;
  timeline: RecentEvent[];
}

export interface UserAccessOverviewResponse {
  summary: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    webOperationsUsers: number;
  };
  roles: Array<{
    id: string;
    name: string;
    permissions: string[] | null;
  }>;
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
    baselinePermissions: string[];
    effectivePermissions: string[];
    assignedRoles: AuthAssignedRole[];
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

export function getCommandCenter() {
  return fetchApi<CommandCenterResponse>("/operations/command-center");
}

export function getFulfillmentOverview() {
  return fetchApi<FulfillmentOverviewResponse>("/operations/fulfillment");
}

export function getValidationOverview() {
  return fetchApi<ValidationOverviewResponse>("/operations/validation");
}

export function lookupTraceability(lookupKey: string) {
  return fetchApi<TraceabilityLookupResponse>(
    `/operations/traceability/${encodeURIComponent(lookupKey)}`,
  );
}

export function updateA1AlertStatus(
  alertId: string,
  status: "open" | "acknowledged" | "resolved",
) {
  return mutateApi<{ id: string; status: string; resolvedAt: string | null }>(
    `/operations/a1-alerts/${alertId}/status`,
    {
      method: "PATCH",
      body: { status },
    },
  );
}

export function getUserAccessOverview() {
  return fetchApi<UserAccessOverviewResponse>("/users/access-overview");
}

export function updateUserAccess(
  userId: string,
  input: { status?: "active" | "suspended" | "deleted"; roleIds?: string[] },
) {
  return mutateApi<UserAccessOverviewResponse["users"][number]>(
    `/users/${userId}/access`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export function updateRule(
  ruleId: string,
  input: { description?: string; value?: Record<string, unknown> },
) {
  return mutateApi<RulesOverviewResponse["rules"][number]>(`/rules/${ruleId}`, {
    method: "PATCH",
    body: input,
  });
}

export function getDevPersonas() {
  return fetchApi<DevPersona[]>("/auth/personas");
}

export function loginWithDevPersona(input: { email?: string; userId?: string } = {}) {
  return mutateApi<DevLoginResponse>("/auth/dev-login", {
    method: "POST",
    body: input,
    token: null,
  });
}

export function getCurrentSession() {
  return fetchApi<AuthSessionResponse>("/auth/me");
}
