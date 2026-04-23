import { pgEnum } from 'drizzle-orm/pg-core';

export const userTypeEnum = pgEnum('user_type', [
  'collector',
  'shepherd',
  'transporter',
  'depot_manager',
  'washer',
  'transformer',
  'certifier',
  'sales_agent',
  'buyer',
  'institutional',
  'admin',
  'super_admin',
]);

export const userStatusEnum = pgEnum('user_status', [
  'pending',
  'active',
  'suspended',
  'deactivated',
]);

export const sourceTypeEnum = pgEnum('source_type', [
  'restaurant',
  'hotel',
  'canteen',
  'industrial',
  'household',
  'other',
]);

export const sourceStatusEnum = pgEnum('source_status', [
  'prospecting',
  'active',
  'paused',
  'churned',
]);

export const lotStatusEnum = pgEnum('lot_status', [
  'collected',
  'in_transit',
  'at_depot',
  'washing',
  'washed',
  'transforming',
  'transformed',
  'certifying',
  'certified',
  'listed',
  'sold',
  'dispatched',
  'delivered',
]);

export const lotStateQuickEnum = pgEnum('lot_state_quick', [
  'raw',
  'cleaned',
  'processed',
  'certified',
  'sold',
]);

export const urgencyLevelEnum = pgEnum('urgency_level', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const transportLaneEnum = pgEnum('transport_lane', [
  'collection',
  'depot_inbound',
  'inter_depot',
  'depot_outbound',
  'delivery',
]);

export const jobStatusEnum = pgEnum('job_status', [
  'pending',
  'assigned',
  'in_progress',
  'completed',
  'failed',
  'cancelled',
]);

export const gradeEnum = pgEnum('grade', [
  'A',
  'B',
  'C',
  'D',
  'rejected',
]);

export const safetyStatusEnum = pgEnum('safety_status', [
  'pass',
  'fail',
  'pending',
]);

export const dispatchTrackEnum = pgEnum('dispatch_track', [
  'pending',
  'picked',
  'in_transit',
  'delivered',
  'returned',
]);

export const transformerTrackEnum = pgEnum('transformer_track', [
  'received',
  'processing',
  'processed',
  'quality_check',
  'stored',
]);

export const productStatusEnum = pgEnum('product_status', [
  'in_stock',
  'reserved',
  'sold',
  'expired',
]);

export const certStatusEnum = pgEnum('cert_status', [
  'pending',
  'in_review',
  'approved',
  'rejected',
  'expired',
]);

export const channelEnum = pgEnum('channel', [
  'b2b',
  'b2c',
  'export',
  'institutional',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'draft',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'partial',
  'paid',
  'overdue',
  'refunded',
]);

export const regionTypeEnum = pgEnum('region_type', [
  'country',
  'state',
  'province',
  'city',
  'district',
  'zone',
]);

export const preLotStatusEnum = pgEnum('pre_lot_status', [
  'draft',
  'confirmed',
  'collected',
  'cancelled',
]);

export const routeStatusEnum = pgEnum('route_status', [
  'planned',
  'in_progress',
  'completed',
  'cancelled',
]);

export const routeStopStatusEnum = pgEnum('route_stop_status', [
  'pending',
  'arrived',
  'completed',
  'skipped',
]);

export const lotPhotoAngleEnum = pgEnum('lot_photo_angle', [
  'top',
  'side',
  'label',
  'damage',
  'other',
]);

export const signatureTypeEnum = pgEnum('signature_type', [
  'collector',
  'source_contact',
  'transporter',
  'receiver',
]);

export const weighSourceEnum = pgEnum('weigh_source', [
  'manual',
  'scale',
  'estimated',
]);

export const depotZonePurposeEnum = pgEnum('depot_zone_purpose', [
  'receiving',
  'storage',
  'washing',
  'processing',
  'dispatch',
  'quarantine',
  'waste',
]);

export const a1SeverityEnum = pgEnum('a1_severity', [
  'info',
  'warning',
  'critical',
  'blocker',
]);

export const a1StatusEnum = pgEnum('a1_status', [
  'open',
  'acknowledged',
  'resolved',
  'dismissed',
]);

export const preWashActionEnum = pgEnum('pre_wash_action', [
  'soak',
  'scrape',
  'filter',
  'neutralize',
  'none',
]);

export const wasteCategoryEnum = pgEnum('waste_category', [
  'organic',
  'chemical',
  'plastic',
  'metal',
  'mixed',
  'hazardous',
]);

export const auditTypeEnum = pgEnum('audit_type', [
  'create',
  'update',
  'delete',
  'status_change',
  'login',
  'export',
]);

export const shipmentStatusEnum = pgEnum('shipment_status', [
  'pending',
  'picked_up',
  'in_transit',
  'delivered',
  'failed',
  'returned',
]);

export const salesDocTypeEnum = pgEnum('sales_doc_type', [
  'invoice',
  'receipt',
  'credit_note',
  'delivery_note',
  'purchase_order',
]);

export const institutionalQueryTypeEnum = pgEnum('institutional_query_type', [
  'traceability',
  'compliance',
  'statistics',
  'audit',
  'report',
]);

export const fileKindEnum = pgEnum('file_kind', [
  'photo',
  'document',
  'certificate',
  'signature',
  'report',
  'other',
]);

export const syncDirectionEnum = pgEnum('sync_direction', [
  'up',
  'down',
  'bidirectional',
]);

export const syncBatchStatusEnum = pgEnum('sync_batch_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'partial',
]);

export const lotLineageOperationEnum = pgEnum('lot_lineage_operation', [
  'merge',
  'split',
  'transform',
  'transfer',
  'grade',
  'certify',
]);
