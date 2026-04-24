// ── Institutions ─────────────────────────────────────────
export type InstitutionMandate = "agriculture" | "commerce" | "douanes" | "ons";

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  mandate: InstitutionMandate;
  allowedModules: string[];
  color: string;
}

export const INSTITUTIONS: Institution[] = [
  {
    id: "min-agri",
    name: "Ministère de l'Agriculture et du Développement Rural",
    shortName: "Agriculture",
    mandate: "agriculture",
    allowedModules: ["statistics", "queries", "audit-log", "exports", "filings"],
    color: "text-success",
  },
  {
    id: "min-com",
    name: "Ministère du Commerce et de la Promotion des Exportations",
    shortName: "Commerce",
    mandate: "commerce",
    allowedModules: ["statistics", "queries", "audit-log", "exports", "filings"],
    color: "text-primary",
  },
  {
    id: "dgd",
    name: "Direction Générale des Douanes",
    shortName: "Douanes",
    mandate: "douanes",
    allowedModules: ["statistics", "queries", "audit-log", "exports"],
    color: "text-warning",
  },
  {
    id: "ons",
    name: "Office National des Statistiques",
    shortName: "ONS",
    mandate: "ons",
    allowedModules: ["statistics", "exports"],
    color: "text-info",
  },
];

// ── Wilayas ───────────────────────────────────────────────
export const ACTIVE_WILAYAS = [
  { code: "15", name: "Tizi Ouzou", kg: 87_420, lots: 312, shepherds: 189 },
  { code: "10", name: "Bouira", kg: 64_180, lots: 241, shepherds: 143 },
  { code: "26", name: "Médéa", kg: 58_930, lots: 198, shepherds: 121 },
  { code: "19", name: "Sétif", kg: 52_670, lots: 187, shepherds: 108 },
  { code: "05", name: "Batna", kg: 61_250, lots: 218, shepherds: 134 },
  { code: "28", name: "M'Sila", kg: 44_810, lots: 156, shepherds: 97 },
  { code: "17", name: "Djelfa", kg: 48_390, lots: 172, shepherds: 112 },
  { code: "03", name: "Laghouat", kg: 38_580, lots: 138, shepherds: 89 },
];

// ── Monthly production 2025 ───────────────────────────────
export const MONTHLY_PRODUCTION = [
  { month: "Jan", kg: 18_200, lots: 68 },
  { month: "Fév", kg: 21_450, lots: 79 },
  { month: "Mar", kg: 38_700, lots: 142 },
  { month: "Avr", kg: 72_340, lots: 267 },
  { month: "Mai", kg: 89_120, lots: 328 },
  { month: "Juin", kg: 76_830, lots: 283 },
  { month: "Juil", kg: 42_190, lots: 156 },
  { month: "Août", kg: 31_450, lots: 116 },
  { month: "Sep", kg: 24_870, lots: 92 },
  { month: "Oct", kg: 19_340, lots: 71 },
  { month: "Nov", kg: 14_820, lots: 55 },
  { month: "Déc", kg: 7_120, lots: 26 },
];

// ── KPIs ──────────────────────────────────────────────────
export const NATIONAL_KPIS = {
  totalKg: 456_230,
  totalLots: 2_341,
  totalShepherds: 847,
  activeWilayas: 8,
  avgYieldPercent: 62.4,
  certifiedProducts: 312,
  exportKg: 84_200,
  c1Percent: 68,
  c2Percent: 19,
  c3Percent: 13,
};

// ── Lots ─────────────────────────────────────────────────
export type LotStatus =
  | "collected"
  | "in_transit"
  | "received_depot"
  | "washing"
  | "qualified"
  | "certified"
  | "sold";

export interface MockLot {
  id: string;
  qrCode: string;
  sourceType: "C1" | "C2" | "C3";
  status: LotStatus;
  wilaya: string;
  declaredWeightKg: number;
  actualWeightKg: number;
  grade?: "A" | "B" | "C";
  collectedAt: string;
  region: string;
  isUrgent: boolean;
}

export const MOCK_LOTS: MockLot[] = [
  { id: "L-C1-TZ-00312", qrCode: "C1-00312-X7K", sourceType: "C1", status: "certified", wilaya: "15", region: "Tizi Ouzou", declaredWeightKg: 48.5, actualWeightKg: 47.8, grade: "A", collectedAt: "2025-05-14", isUrgent: false },
  { id: "L-C2-ALG-00044", qrCode: "C2-00044-Z9P", sourceType: "C2", status: "washing", wilaya: "16", region: "Alger", declaredWeightKg: 44.0, actualWeightKg: 43.5, collectedAt: "2025-05-18", isUrgent: true },
  { id: "L-C1-SET-00106", qrCode: "C1-00106-I1J", sourceType: "C1", status: "qualified", wilaya: "19", region: "Sétif", declaredWeightKg: 50.0, actualWeightKg: 49.2, grade: "B", collectedAt: "2025-05-16", isUrgent: false },
  { id: "L-C3-ORA-00202", qrCode: "C3-00202-M7N", sourceType: "C3", status: "received_depot", wilaya: "31", region: "Oran", declaredWeightKg: 98.5, actualWeightKg: 97.1, collectedAt: "2025-05-17", isUrgent: false },
  { id: "L-C1-BAT-00089", qrCode: "C1-00089-R3T", sourceType: "C1", status: "in_transit", wilaya: "05", region: "Batna", declaredWeightKg: 62.0, actualWeightKg: 61.4, collectedAt: "2025-05-19", isUrgent: false },
  { id: "L-C1-BOU-00143", qrCode: "C1-00143-W5V", sourceType: "C1", status: "sold", wilaya: "10", region: "Bouira", declaredWeightKg: 55.5, actualWeightKg: 54.9, grade: "A", collectedAt: "2025-04-28", isUrgent: false },
  { id: "L-C2-MED-00021", qrCode: "C2-00021-Y8N", sourceType: "C2", status: "certified", wilaya: "26", region: "Médéa", declaredWeightKg: 38.0, actualWeightKg: 37.5, grade: "B", collectedAt: "2025-05-10", isUrgent: true },
  { id: "L-C1-MSL-00067", qrCode: "C1-00067-P2Q", sourceType: "C1", status: "collected", wilaya: "28", region: "M'Sila", declaredWeightKg: 71.0, actualWeightKg: 70.3, collectedAt: "2025-05-20", isUrgent: false },
];

// ── Audit log ─────────────────────────────────────────────
export interface AuditEntry {
  id: string;
  timestamp: string;
  institution: string;
  user: string;
  queryType: "lot_lookup" | "cert_verify" | "aggregate_stats" | "export" | "shepherd_lookup";
  queryParams: string;
  resultCount: number;
  justification?: string;
}

export const AUDIT_LOG: AuditEntry[] = [
  { id: "AUD-001", timestamp: "2025-05-20 09:14:32", institution: "Agriculture", user: "b.khelifa@madr.gov.dz", queryType: "aggregate_stats", queryParams: "wilaya=15, période=2025-Q1", resultCount: 1, },
  { id: "AUD-002", timestamp: "2025-05-20 10:31:08", institution: "Douanes", user: "r.bensalem@dgd.gov.dz", queryType: "export", queryParams: "type=export_declarations, mois=avril 2025", resultCount: 47, },
  { id: "AUD-003", timestamp: "2025-05-20 11:02:45", institution: "Commerce", user: "n.hamdi@mincom.gov.dz", queryType: "lot_lookup", queryParams: "qrCode=C1-00312-X7K", resultCount: 1, justification: "Vérification qualité export" },
  { id: "AUD-004", timestamp: "2025-05-20 13:17:22", institution: "ONS", user: "a.zerrouki@ons.gov.dz", queryType: "aggregate_stats", queryParams: "national, période=2025", resultCount: 1, },
  { id: "AUD-005", timestamp: "2025-05-20 14:55:11", institution: "Agriculture", user: "b.khelifa@madr.gov.dz", queryType: "shepherd_lookup", queryParams: "wilaya=19, commune=Ain Oulmène", resultCount: 23, justification: "Recensement annuel" },
  { id: "AUD-006", timestamp: "2025-05-19 16:08:30", institution: "Douanes", user: "f.meziane@dgd.gov.dz", queryType: "cert_verify", queryParams: "lotId=L-C1-TZ-00312", resultCount: 1, },
  { id: "AUD-007", timestamp: "2025-05-19 08:44:15", institution: "Commerce", user: "n.hamdi@mincom.gov.dz", queryType: "aggregate_stats", queryParams: "channel=export, période=2025-Q1", resultCount: 1, },
  { id: "AUD-008", timestamp: "2025-05-18 15:30:00", institution: "Agriculture", user: "k.boudali@madr.gov.dz", queryType: "lot_lookup", queryParams: "qrCode=C2-00044-Z9P", resultCount: 1, justification: "Contrôle chaîne du froid C2" },
];

// ── Regulatory filings ────────────────────────────────────
export interface Filing {
  id: string;
  title: string;
  type: string;
  period: string;
  dueDate: string;
  status: "pending" | "generated" | "submitted";
  institution: InstitutionMandate;
}

export const FILINGS: Filing[] = [
  { id: "FIL-001", title: "Rapport de production T1 2025", type: "Production trimestrielle", period: "Jan–Mar 2025", dueDate: "2025-04-30", status: "submitted", institution: "agriculture" },
  { id: "FIL-002", title: "Déclaration exports Q1 2025", type: "Export douanier", period: "Jan–Mar 2025", dueDate: "2025-04-15", status: "submitted", institution: "douanes" },
  { id: "FIL-003", title: "Rapport de production T2 2025", type: "Production trimestrielle", period: "Avr–Juin 2025", dueDate: "2025-07-31", status: "generated", institution: "agriculture" },
  { id: "FIL-004", title: "Indicateurs économiques S1 2025", type: "Statistiques nationales", period: "Jan–Juin 2025", dueDate: "2025-08-15", status: "pending", institution: "ons" },
  { id: "FIL-005", title: "Bilan commercial laine 2025", type: "Rapport commercial", period: "Jan–Juin 2025", dueDate: "2025-08-01", status: "pending", institution: "commerce" },
  { id: "FIL-006", title: "Déclarations exports Q2 2025", type: "Export douanier", period: "Avr–Juin 2025", dueDate: "2025-07-15", status: "generated", institution: "douanes" },
];

// ── Certificates ──────────────────────────────────────────
export interface Certificate {
  id: string;
  productCode: string;
  lotId: string;
  status: "valid" | "revoked";
  issuedAt: string;
  grade: string;
  weightKg: number;
  originRegion: string;
  track: "D3" | "D4";
  gatesPassedCount: number;
}

export const CERTIFICATES: Certificate[] = [
  { id: "CERT-P1-00042", productCode: "P1-00042", lotId: "L-C1-TZ-00312", status: "valid", issuedAt: "2025-05-15", grade: "A", weightKg: 47.8, originRegion: "Tizi Ouzou", track: "D3", gatesPassedCount: 6 },
  { id: "CERT-P1-00038", productCode: "P1-00038", lotId: "L-C1-BOU-00143", status: "valid", issuedAt: "2025-05-02", grade: "A", weightKg: 54.9, originRegion: "Bouira", track: "D3", gatesPassedCount: 6 },
  { id: "CERT-P2-00019", productCode: "P2-00019", lotId: "L-C2-MED-00021", status: "valid", issuedAt: "2025-05-12", grade: "B", weightKg: 37.5, originRegion: "Médéa", track: "D4", gatesPassedCount: 6 },
  { id: "CERT-P1-00031", productCode: "P1-00031", lotId: "L-C1-SET-00106", status: "revoked", issuedAt: "2025-04-20", grade: "B", weightKg: 49.2, originRegion: "Sétif", track: "D3", gatesPassedCount: 5 },
];
