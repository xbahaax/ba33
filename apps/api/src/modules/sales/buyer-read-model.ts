export type ProductGrade = 'A' | 'B' | 'C';
export type ProductType = 'P1' | 'P2';
export type NfnSealStatus = 'certified' | 'revoked' | 'pending';
export type SalesChannel = 'national' | 'export' | 'institutional';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
export type ComplaintStatus = 'review' | 'resolved' | 'rejected';
export type ComplaintType = 'quality' | 'quantity' | 'delivery' | 'certificate' | 'other';
export type DocumentType = 'invoice' | 'certificate' | 'export' | 'delivery';

export interface QualityParameters {
  fiberLengthMm: number;
  fiberDiameterMicrons: number;
  moisturePercent: number;
  washingYieldR1Percent: number;
  cleanlinessScore: number;
  colorDescription: string;
  sourceLotId: string;
}

export interface TraceabilityChain {
  collectionEvent: {
    sourceType: 'C1' | 'C2' | 'C3';
    region: string;
    commune: string;
    collectedAt: string;
    declaredWeightKg: number;
  };
  depotD1Event: {
    receivedAt: string;
    weighedWeightKg: number;
    varianceKg: number;
    siteName: string;
  };
  transportEvent: {
    departedAt: string;
    arrivedAt: string;
    distanceKm: number;
    coldChainRequired: boolean;
    origin: string;
    destination: string;
  };
  laverieD2Event: {
    processedAt: string;
    dirtyWeightKg: number;
    cleanWeightKg: number;
    yieldPercent: number;
    assignedGrade: ProductGrade;
    siteName: string;
  };
  transformationEvent: {
    processedAt: string;
    siteName: string;
    batchNumber: string;
    inputWeightKg: number;
    outputWeightKg: number;
  };
  certificationEvent: {
    certifiedAt: string;
    sealCode: string;
    signatureSnippet: string;
  };
}

export interface BuyerProduct {
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
  nfnCertifiedAt?: string;
  description: string;
  images: string[];
  qualityParameters: QualityParameters;
  traceability: TraceabilityChain;
  createdAt: string;
}

export interface BuyerAddress {
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

export interface OrderDocument {
  id: string;
  type: DocumentType;
  title: string;
  orderId: string;
  sizeLabel: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productCode: string;
  productName: string;
  grade: ProductGrade;
  quantityKg: number;
  unitPriceDzd: number;
}

export interface BuyerOrder {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  channel: SalesChannel;
  totalAmountDzd: number;
  totalQuantityKg: number;
  placedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  shippingAddress: BuyerAddress;
  trackingNumber?: string;
  documents: OrderDocument[];
}

export interface BuyerComplaint {
  id: string;
  orderId: string;
  type: ComplaintType;
  description: string;
  resolution: string;
  submittedAt: string;
  status: ComplaintStatus;
}

export interface BuyerProfile {
  companyName: string;
  registrationNumber: string;
  contactEmail: string;
  preferredChannel: SalesChannel;
}

export const addresses: BuyerAddress[] = [
  {
    id: 'ADDR-01',
    siteName: 'Usine Rouiba',
    line1: 'Zone industrielle Lot 17',
    commune: 'Rouiba',
    wilaya: 'Alger',
    postalCode: '16012',
    instructions: 'Reception du lundi au jeudi, quai 2.',
    isDefault: true,
  },
  {
    id: 'ADDR-02',
    siteName: 'Depot Oran Export',
    line1: 'Rue des entrepots 24',
    commune: 'Es Senia',
    wilaya: 'Oran',
    postalCode: '31022',
    instructions: 'Annonce prealable 24h avant livraison.',
  },
];

const traceabilityChains: Record<string, TraceabilityChain> = {
  'P1-00042-X7': {
    collectionEvent: {
      sourceType: 'C1',
      region: 'Tiaret',
      commune: 'Sougueur',
      collectedAt: '2026-02-03T08:30:00.000Z',
      declaredWeightKg: 1650,
    },
    depotD1Event: {
      receivedAt: '2026-02-04T10:15:00.000Z',
      weighedWeightKg: 1610,
      varianceKg: -40,
      siteName: 'Depot D1 Tiaret',
    },
    transportEvent: {
      departedAt: '2026-02-05T06:10:00.000Z',
      arrivedAt: '2026-02-05T16:45:00.000Z',
      distanceKm: 318,
      coldChainRequired: false,
      origin: 'Tiaret',
      destination: 'Djelfa',
    },
    laverieD2Event: {
      processedAt: '2026-02-07T09:00:00.000Z',
      dirtyWeightKg: 1610,
      cleanWeightKg: 1240,
      yieldPercent: 77,
      assignedGrade: 'A',
      siteName: 'Laverie D2 Djelfa',
    },
    transformationEvent: {
      processedAt: '2026-02-12T11:20:00.000Z',
      siteName: 'Transformation D3 Blida',
      batchNumber: 'BATCH-P1-2042',
      inputWeightKg: 1240,
      outputWeightKg: 1120,
    },
    certificationEvent: {
      certifiedAt: '2026-02-14T14:30:00.000Z',
      sealCode: 'NFN-P1-00042-X7',
      signatureSnippet: '3D7A-AB19-77EF',
    },
  },
  'P1-00057-Q4': {
    collectionEvent: {
      sourceType: 'C3',
      region: 'Djelfa',
      commune: 'Hassi Bahbah',
      collectedAt: '2026-02-16T08:00:00.000Z',
      declaredWeightKg: 980,
    },
    depotD1Event: {
      receivedAt: '2026-02-17T11:30:00.000Z',
      weighedWeightKg: 960,
      varianceKg: -20,
      siteName: 'Depot D1 Djelfa',
    },
    transportEvent: {
      departedAt: '2026-02-18T05:40:00.000Z',
      arrivedAt: '2026-02-18T11:45:00.000Z',
      distanceKm: 188,
      coldChainRequired: false,
      origin: 'Djelfa',
      destination: 'Medea',
    },
    laverieD2Event: {
      processedAt: '2026-02-20T09:35:00.000Z',
      dirtyWeightKg: 960,
      cleanWeightKg: 760,
      yieldPercent: 79,
      assignedGrade: 'B',
      siteName: 'Laverie D2 Medea',
    },
    transformationEvent: {
      processedAt: '2026-02-23T10:15:00.000Z',
      siteName: 'Transformation D3 Blida',
      batchNumber: 'BATCH-P1-2057',
      inputWeightKg: 760,
      outputWeightKg: 710,
    },
    certificationEvent: {
      certifiedAt: '2026-02-24T13:25:00.000Z',
      sealCode: 'NFN-P1-00057-Q4',
      signatureSnippet: 'CD07-1298-551B',
    },
  },
  'P2-00112-K9': {
    collectionEvent: {
      sourceType: 'C2',
      region: 'Laghouat',
      commune: 'Aflou',
      collectedAt: '2026-01-18T07:45:00.000Z',
      declaredWeightKg: 2120,
    },
    depotD1Event: {
      receivedAt: '2026-01-19T12:30:00.000Z',
      weighedWeightKg: 2080,
      varianceKg: -40,
      siteName: 'Depot D1 Laghouat',
    },
    transportEvent: {
      departedAt: '2026-01-20T05:20:00.000Z',
      arrivedAt: '2026-01-20T17:40:00.000Z',
      distanceKm: 402,
      coldChainRequired: true,
      origin: 'Laghouat',
      destination: 'Ghardaia',
    },
    laverieD2Event: {
      processedAt: '2026-01-22T10:00:00.000Z',
      dirtyWeightKg: 2080,
      cleanWeightKg: 1670,
      yieldPercent: 80,
      assignedGrade: 'A',
      siteName: 'Laverie D2 Ghardaia',
    },
    transformationEvent: {
      processedAt: '2026-01-28T13:10:00.000Z',
      siteName: 'Transformation D4 Oran',
      batchNumber: 'BATCH-P2-1112',
      inputWeightKg: 1670,
      outputWeightKg: 1490,
    },
    certificationEvent: {
      certifiedAt: '2026-01-30T09:05:00.000Z',
      sealCode: 'NFN-P2-00112-K9',
      signatureSnippet: 'AA91-4F10-C8E1',
    },
  },
};

export const products: BuyerProduct[] = [
  {
    id: 'P1-00042-X7',
    code: 'P1-00042-X7',
    name: 'Panneau isolant laine brute 10 cm',
    type: 'P1',
    grade: 'A',
    region: 'Tiaret',
    availableQuantityKg: 1240,
    pricePerKgDzd: 890,
    pricePerKgEur: 6.4,
    nfnSealStatus: 'certified',
    nfnSealCode: 'NFN-P1-00042-X7',
    nfnCertifiedAt: '2026-02-14T14:30:00.000Z',
    description: 'Panneau isolant issu de laine certifiee NFN, adapte aux applications thermiques et acoustiques du batiment.',
    images: [],
    qualityParameters: {
      fiberLengthMm: 95,
      fiberDiameterMicrons: 28,
      moisturePercent: 9.8,
      washingYieldR1Percent: 77,
      cleanlinessScore: 4,
      colorDescription: 'Ecru clair',
      sourceLotId: 'L-00042-X7',
    },
    traceability: traceabilityChains['P1-00042-X7'],
    createdAt: '2026-02-15T08:00:00.000Z',
  },
  {
    id: 'P1-00057-Q4',
    code: 'P1-00057-Q4',
    name: 'Geotextile laine stabilisee 8 mm',
    type: 'P1',
    grade: 'B',
    region: 'Djelfa',
    availableQuantityKg: 760,
    pricePerKgDzd: 710,
    pricePerKgEur: 5.1,
    nfnSealStatus: 'certified',
    nfnSealCode: 'NFN-P1-00057-Q4',
    nfnCertifiedAt: '2026-02-24T13:25:00.000Z',
    description: 'Geotextile en laine pour amenagements agricoles et retenue des sols, traceable depuis la collecte initiale.',
    images: [],
    qualityParameters: {
      fiberLengthMm: 82,
      fiberDiameterMicrons: 31,
      moisturePercent: 10.2,
      washingYieldR1Percent: 79,
      cleanlinessScore: 4,
      colorDescription: 'Beige sable',
      sourceLotId: 'L-00057-Q4',
    },
    traceability: traceabilityChains['P1-00057-Q4'],
    createdAt: '2026-02-25T09:20:00.000Z',
  },
  {
    id: 'P2-00112-K9',
    code: 'P2-00112-K9',
    name: 'Biofertilisant organique laine active',
    type: 'P2',
    grade: 'A',
    region: 'Laghouat',
    availableQuantityKg: 1490,
    pricePerKgDzd: 640,
    pricePerKgEur: 4.9,
    nfnSealStatus: 'certified',
    nfnSealCode: 'NFN-P2-00112-K9',
    nfnCertifiedAt: '2026-01-30T09:05:00.000Z',
    description: 'Biofertilisant a base de laine transformee, destine aux exploitations agricoles recherchant une filiere certifiee.',
    images: [],
    qualityParameters: {
      fiberLengthMm: 66,
      fiberDiameterMicrons: 30,
      moisturePercent: 8.3,
      washingYieldR1Percent: 80,
      cleanlinessScore: 5,
      colorDescription: 'Brun naturel',
      sourceLotId: 'L-00112-K9',
    },
    traceability: traceabilityChains['P2-00112-K9'],
    createdAt: '2026-01-31T08:10:00.000Z',
  },
  {
    id: 'P2-00148-M2',
    code: 'P2-00148-M2',
    name: 'Amendement laine compressee',
    type: 'P2',
    grade: 'C',
    region: 'Naama',
    availableQuantityKg: 430,
    pricePerKgDzd: 430,
    pricePerKgEur: 3.2,
    nfnSealStatus: 'revoked',
    nfnSealCode: 'NFN-P2-00148-M2',
    nfnCertifiedAt: '2026-02-09T10:00:00.000Z',
    description: 'Amendement de sol pour essais et projets pilotes, avec historique de certification disponible a la verification.',
    images: [],
    qualityParameters: {
      fiberLengthMm: 54,
      fiberDiameterMicrons: 34,
      moisturePercent: 11.6,
      washingYieldR1Percent: 72,
      cleanlinessScore: 3,
      colorDescription: 'Brun fonce',
      sourceLotId: 'L-00148-M2',
    },
    traceability: traceabilityChains['P2-00112-K9'],
    createdAt: '2026-02-10T15:00:00.000Z',
  },
];

export const orders: BuyerOrder[] = [
  {
    id: 'CMD-2026-00142',
    items: [
      {
        productId: 'P1-00042-X7',
        productCode: 'P1-00042-X7',
        productName: 'Panneau isolant laine brute 10 cm',
        grade: 'A',
        quantityKg: 600,
        unitPriceDzd: 890,
      },
    ],
    status: 'shipped',
    channel: 'national',
    totalAmountDzd: 534000,
    totalQuantityKg: 600,
    placedAt: '2026-03-02T08:00:00.000Z',
    estimatedDelivery: '2026-03-09T12:00:00.000Z',
    shippingAddress: addresses[0],
    trackingNumber: 'TRK-NAT-00142',
    documents: [
      { id: 'DOC-INV-142', type: 'invoice', title: 'Facture CMD-2026-00142', orderId: 'CMD-2026-00142', sizeLabel: '248 KB', createdAt: '2026-03-02T09:00:00.000Z' },
      { id: 'DOC-CERT-142', type: 'certificate', title: 'Certificat NFN CMD-2026-00142', orderId: 'CMD-2026-00142', sizeLabel: '191 KB', createdAt: '2026-03-02T09:05:00.000Z' },
      { id: 'DOC-BL-142', type: 'delivery', title: 'Bon de livraison CMD-2026-00142', orderId: 'CMD-2026-00142', sizeLabel: '160 KB', createdAt: '2026-03-05T10:15:00.000Z' },
    ],
  },
  {
    id: 'CMD-2026-00157',
    items: [
      { productId: 'P2-00112-K9', productCode: 'P2-00112-K9', productName: 'Biofertilisant organique laine active', grade: 'A', quantityKg: 900, unitPriceDzd: 640 },
      { productId: 'P1-00057-Q4', productCode: 'P1-00057-Q4', productName: 'Geotextile laine stabilisee 8 mm', grade: 'B', quantityKg: 250, unitPriceDzd: 710 },
    ],
    status: 'confirmed',
    channel: 'export',
    totalAmountDzd: 753500,
    totalQuantityKg: 1150,
    placedAt: '2026-03-06T11:30:00.000Z',
    estimatedDelivery: '2026-03-16T12:00:00.000Z',
    shippingAddress: addresses[1],
    trackingNumber: 'TRK-EXP-00157',
    documents: [
      { id: 'DOC-INV-157', type: 'invoice', title: 'Facture CMD-2026-00157', orderId: 'CMD-2026-00157', sizeLabel: '252 KB', createdAt: '2026-03-06T12:15:00.000Z' },
      { id: 'DOC-CERT-157', type: 'certificate', title: 'Certificat NFN CMD-2026-00157', orderId: 'CMD-2026-00157', sizeLabel: '188 KB', createdAt: '2026-03-06T12:20:00.000Z' },
      { id: 'DOC-EXP-157', type: 'export', title: 'Documents export CMD-2026-00157', orderId: 'CMD-2026-00157', sizeLabel: '412 KB', createdAt: '2026-03-07T08:45:00.000Z' },
    ],
  },
  {
    id: 'CMD-2026-00163',
    items: [
      { productId: 'P1-00042-X7', productCode: 'P1-00042-X7', productName: 'Panneau isolant laine brute 10 cm', grade: 'A', quantityKg: 300, unitPriceDzd: 890 },
    ],
    status: 'disputed',
    channel: 'institutional',
    totalAmountDzd: 267000,
    totalQuantityKg: 300,
    placedAt: '2026-02-21T10:15:00.000Z',
    deliveredAt: '2026-02-28T15:10:00.000Z',
    shippingAddress: addresses[0],
    trackingNumber: 'TRK-INS-00163',
    documents: [
      { id: 'DOC-INV-163', type: 'invoice', title: 'Facture CMD-2026-00163', orderId: 'CMD-2026-00163', sizeLabel: '214 KB', createdAt: '2026-02-21T10:30:00.000Z' },
      { id: 'DOC-BL-163', type: 'delivery', title: 'Bon de livraison CMD-2026-00163', orderId: 'CMD-2026-00163', sizeLabel: '154 KB', createdAt: '2026-02-27T14:00:00.000Z' },
    ],
  },
];

export const complaints: BuyerComplaint[] = [
  { id: 'REC-2026-0041', orderId: 'CMD-2026-00163', type: 'delivery', description: '', resolution: '', submittedAt: '2026-03-01T09:00:00.000Z', status: 'review' },
  { id: 'REC-2026-0037', orderId: 'CMD-2026-00142', type: 'quantity', description: '', resolution: '', submittedAt: '2026-02-18T13:30:00.000Z', status: 'resolved' },
];

export const buyerProfile: BuyerProfile = {
  companyName: 'Noura Fibres SARL',
  registrationNumber: 'RC-16-2026-B-0042',
  contactEmail: 'contact@nourafibres.dz',
  preferredChannel: 'national',
};
