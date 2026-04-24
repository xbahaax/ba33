import type { TraceabilityChain } from "./traceability";

export type ProductGrade = "A" | "B" | "C";
export type ProductType = "P1" | "P2";
export type NfnSealStatus = "certified" | "revoked" | "pending";

export interface QualityParameters {
  fiberLengthMm: number;
  fiberDiameterMicrons: number;
  moisturePercent: number;
  washingYieldR1Percent: number;
  cleanlinessScore: number;
  colorDescription: string;
  sourceLotId: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  type: ProductType;
  grade: ProductGrade;
  region: string;
  availableQuantityKg: number;
  pricePerKgDzd: number;
  pricePerKgEur?: number;
  nfnSealStatus: NfnSealStatus;
  nfnSealCode?: string;
  nfnCertifiedAt?: Date;
  description: string;
  images: string[];
  qualityParameters: QualityParameters;
  traceability: TraceabilityChain;
  createdAt: Date;
}
