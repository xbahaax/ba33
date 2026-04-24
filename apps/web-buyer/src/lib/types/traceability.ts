export type SourceType = "C1" | "C2" | "C3";

export interface CollectionEvent {
  sourceType: SourceType;
  region: string;
  commune: string;
  collectedAt: Date;
  declaredWeightKg: number;
}

export interface DepotEvent {
  receivedAt: Date;
  weighedWeightKg: number;
  varianceKg: number;
  siteName: string;
}

export interface TransportEvent {
  departedAt: Date;
  arrivedAt: Date;
  distanceKm: number;
  coldChainRequired: boolean;
  origin: string;
  destination: string;
}

export interface LaverieEvent {
  processedAt: Date;
  dirtyWeightKg: number;
  cleanWeightKg: number;
  yieldPercent: number;
  assignedGrade: "A" | "B" | "C";
  siteName: string;
}

export interface TransformationEvent {
  processedAt: Date;
  siteName: string;
  batchNumber: string;
  inputWeightKg: number;
  outputWeightKg: number;
}

export interface CertificationEvent {
  certifiedAt: Date;
  sealCode: string;
  signatureSnippet: string;
}

export interface TraceabilityChain {
  collectionEvent: CollectionEvent;
  depotD1Event: DepotEvent;
  transportEvent: TransportEvent;
  laverieD2Event: LaverieEvent;
  transformationEvent: TransformationEvent;
  certificationEvent: CertificationEvent;
}
