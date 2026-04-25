import { pgEnum } from 'drizzle-orm/pg-core';

// regions
export const regionTypeEnum = pgEnum('region_type', ['wilaya', 'commune', 'village']);

// users
export const userTypeEnum = pgEnum('user_type', [
  'shepherd',
  'collector',
  'transporter',
  'depot_manager',
  'laverie_operator',
  'transformer_operator',
  'sales_agent',
  'certification_authority',
  'central_admin',
  'regional_manager',
  'buyer',
  'institutional',
  'system',
]);

export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'deleted']);

// sources
export const sourceTypeEnum = pgEnum('source_type', [
  'c1_shepherd',
  'c2_slaughterhouse',
  'c3_aggregator',
]);

export const sourceStatusEnum = pgEnum('source_status', ['pending', 'active', 'suspended']);

export const sourceProfessionEnum = pgEnum('source_profession', [
  'shepherd',
  'slaughterhouse',
  'butcher',
  'aggregator',
  'other',
]);

// collection
export const preLotStatusEnum = pgEnum('pre_lot_status', [
  'announced',
  'assigned',
  'collected',
  'cancelled',
  'expired',
]);

export const routeStatusEnum = pgEnum('route_status', ['planned', 'in_progress', 'completed']);

export const routeStopStatusEnum = pgEnum('route_stop_status', [
  'pending',
  'completed',
  'skipped',
]);

export const collectionJobStatusEnum = pgEnum('collection_job_status', [
  'pending',
  'assigned',
  'accepted',
  'in_progress',
  'arrived',
  'completed',
  'cancelled',
]);

// lots
export const lotStatusEnum = pgEnum('lot_status', [
  'announced',
  'collected',
  'in_transit',
  'received_depot',
  'in_pretri',
  'stored',
  'dispatched_to_laverie',
  'received_laverie',
  'washing',
  'washed',
  'qualified',
  'dispatched_to_d3',
  'dispatched_to_d4',
  'in_transformation',
  'transformed',
  'certified',
  'sold',
  'delivered',
  'rejected',
  'lost',
  'quarantined',
]);

export const lotStateQuickEnum = pgEnum('lot_state_quick', [
  'clean',
  'dirty',
  'very_dirty',
  'contaminated',
  'with_meat',
]);

export const urgencyLevelEnum = pgEnum('urgency_level', ['normal', 'urgent']);

export const lotPhotoAngleEnum = pgEnum('lot_photo_angle', [
  'overview',
  'closeup',
  'surroundings',
  'other',
]);

export const signatureTypeEnum = pgEnum('signature_type', [
  'digital',
  'thumbprint',
  'paper_photo',
]);

export const lotLineageOperationEnum = pgEnum('lot_lineage_operation', ['split', 'merge']);

export const weighSourceEnum = pgEnum('weigh_source', [
  'scale_bluetooth',
  'manual',
  'estimated',
]);

// transport
export const transportLaneEnum = pgEnum('transport_lane', [
  'normal',
  'urgent_cold_chain',
  'urgent_standard',
]);

export const jobStatusEnum = pgEnum('job_status', [
  'pending',
  'assigned',
  'accepted',
  'in_progress',
  'delivered',
  'cancelled',
]);

// depot
export const depotZonePurposeEnum = pgEnum('depot_zone_purpose', [
  'c1_normal',
  'c2_urgent',
  'c3_aggregator',
  'quarantine',
  'dispatch_ready',
]);

export const a1SeverityEnum = pgEnum('a1_severity', ['info', 'warning', 'critical']);

export const a1StatusEnum = pgEnum('a1_status', ['open', 'acknowledged', 'resolved']);

// laverie
export const gradeEnum = pgEnum('grade', ['A', 'B', 'C', 'reject']);

export const safetyStatusEnum = pgEnum('safety_status', ['clear', 'flagged', 'rejected']);

export const dispatchTrackEnum = pgEnum('dispatch_track', [
  'd3_textile',
  'd4_bio',
  'quarantine',
  'reject',
]);

export const preWashActionEnum = pgEnum('pre_wash_action', [
  'approved',
  'quarantined',
  'rejected',
]);

// transformation
export const transformerTrackEnum = pgEnum('transformer_track', ['d3_textile', 'd4_bio']);

export const productStatusEnum = pgEnum('product_status', [
  'in_production',
  'produced',
  'certified',
  'sold',
  'shipped',
  'delivered',
  'rejected',
]);

export const wasteCategoryEnum = pgEnum('waste_category', [
  'reusable',
  'recoverable',
  'disposal',
]);

// certification
export const certStatusEnum = pgEnum('cert_status', ['pending', 'issued', 'revoked']);

// sales
export const channelEnum = pgEnum('channel', ['national', 'export', 'institutional']);

export const orderStatusEnum = pgEnum('order_status', [
  'draft',
  'quote',
  'confirmed',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'returned',
  'cancelled',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'partial',
  'paid',
  'refunded',
]);

export const shipmentStatusEnum = pgEnum('shipment_status', [
  'pending',
  'in_transit',
  'delivered',
  'returned',
]);

export const salesDocTypeEnum = pgEnum('sales_doc_type', [
  'invoice',
  'traceability_certificate',
  'origin_certificate',
  'export_declaration',
  'other',
]);

// institutional
export const institutionalQueryTypeEnum = pgEnum('institutional_query_type', [
  'lot_lookup',
  'product_lookup',
  'shepherd_lookup',
  'cert_verify',
  'aggregate_stats',
  'export',
]);

// audit
export const auditTypeEnum = pgEnum('audit_type', [
  'entry_e1',
  'exit_s1',
  'internal_ex',
  'internal_sx',
  'reconciliation',
]);

// files
export const fileKindEnum = pgEnum('file_kind', [
  'photo',
  'voice_note',
  'signature',
  'document',
  'certificate_pdf',
]);

// sync
export const syncDirectionEnum = pgEnum('sync_direction', ['push', 'pull']);

export const syncBatchStatusEnum = pgEnum('sync_batch_status', [
  'pending',
  'completed',
  'failed',
]);
