DO $$ BEGIN
 CREATE TYPE "public"."a1_severity" AS ENUM('info', 'warning', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."a1_status" AS ENUM('open', 'acknowledged', 'resolved');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."audit_type" AS ENUM('entry_e1', 'exit_s1', 'internal_ex', 'internal_sx', 'reconciliation');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."cert_status" AS ENUM('pending', 'issued', 'revoked');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."channel" AS ENUM('national', 'export', 'institutional');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."depot_zone_purpose" AS ENUM('c1_normal', 'c2_urgent', 'c3_aggregator', 'quarantine', 'dispatch_ready');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."dispatch_track" AS ENUM('d3_textile', 'd4_bio', 'quarantine', 'reject');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."file_kind" AS ENUM('photo', 'voice_note', 'signature', 'document', 'certificate_pdf');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."grade" AS ENUM('A', 'B', 'C', 'reject');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."institutional_query_type" AS ENUM('lot_lookup', 'product_lookup', 'shepherd_lookup', 'cert_verify', 'aggregate_stats', 'export');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."job_status" AS ENUM('pending', 'assigned', 'accepted', 'in_progress', 'delivered', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."lot_lineage_operation" AS ENUM('split', 'merge');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."lot_photo_angle" AS ENUM('overview', 'closeup', 'surroundings', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."lot_state_quick" AS ENUM('clean', 'dirty', 'very_dirty', 'contaminated', 'with_meat');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."lot_status" AS ENUM('announced', 'collected', 'in_transit', 'received_depot', 'in_pretri', 'stored', 'dispatched_to_laverie', 'received_laverie', 'washing', 'washed', 'qualified', 'dispatched_to_d3', 'dispatched_to_d4', 'in_transformation', 'transformed', 'certified', 'sold', 'delivered', 'rejected', 'lost', 'quarantined');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('draft', 'quote', 'confirmed', 'paid', 'preparing', 'shipped', 'delivered', 'returned', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_status" AS ENUM('pending', 'partial', 'paid', 'refunded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."pre_lot_status" AS ENUM('announced', 'assigned', 'collected', 'cancelled', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."pre_wash_action" AS ENUM('approved', 'quarantined', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."product_status" AS ENUM('in_production', 'produced', 'certified', 'sold', 'shipped', 'delivered', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."region_type" AS ENUM('wilaya', 'commune', 'village');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."route_status" AS ENUM('planned', 'in_progress', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."route_stop_status" AS ENUM('pending', 'completed', 'skipped');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."safety_status" AS ENUM('clear', 'flagged', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sales_doc_type" AS ENUM('invoice', 'traceability_certificate', 'origin_certificate', 'export_declaration', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."shipment_status" AS ENUM('pending', 'in_transit', 'delivered', 'returned');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."signature_type" AS ENUM('digital', 'thumbprint', 'paper_photo');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."source_status" AS ENUM('pending', 'active', 'suspended');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."source_type" AS ENUM('c1_shepherd', 'c2_slaughterhouse', 'c3_aggregator');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sync_batch_status" AS ENUM('pending', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sync_direction" AS ENUM('push', 'pull');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."transformer_track" AS ENUM('d3_textile', 'd4_bio');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."transport_lane" AS ENUM('normal', 'urgent_cold_chain', 'urgent_standard');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."urgency_level" AS ENUM('normal', 'urgent');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'deleted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_type" AS ENUM('collector', 'depot_manager', 'laverie_operator', 'transformer_operator', 'sales_agent', 'central_admin', 'regional_manager', 'buyer', 'institutional', 'system');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."waste_category" AS ENUM('reusable', 'recoverable', 'disposal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."weigh_source" AS ENUM('scale_bluetooth', 'manual', 'estimated');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"parent_id" uuid,
	"type" "region_type" NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "regions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"permissions" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"device_info" jsonb,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"user_type" "user_type" NOT NULL,
	"status" "user_status" DEFAULT 'active',
	"region_id" uuid,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aggregators" (
	"source_id" uuid PRIMARY KEY NOT NULL,
	"business_registration" text NOT NULL,
	"registered_upstream_count" integer DEFAULT 0,
	"premium_certified" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shepherds" (
	"source_id" uuid PRIMARY KEY NOT NULL,
	"has_smartphone" boolean NOT NULL,
	"preferred_language" text,
	"flock_size_estimate" integer,
	"typical_yield_kg_per_year" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "slaughterhouses" (
	"source_id" uuid PRIMARY KEY NOT NULL,
	"license_number" text NOT NULL,
	"daily_capacity_heads" integer,
	"has_cold_storage" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" "source_type" NOT NULL,
	"name" text NOT NULL,
	"contact_phone" text,
	"contact_email" text,
	"region_id" uuid NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"address" text,
	"status" "source_status" DEFAULT 'pending',
	"registered_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collector_booklets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collector_id" uuid NOT NULL,
	"serial_start" text,
	"serial_end" text,
	"issued_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collectors" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"assigned_regions" jsonb,
	"certifications" jsonb,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pre_lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"estimated_weight_kg" numeric(10, 2) NOT NULL,
	"estimated_range" text,
	"location_lat" numeric(10, 7),
	"location_lng" numeric(10, 7),
	"region_id" uuid,
	"notes" text,
	"voice_note_id" uuid,
	"status" "pre_lot_status" DEFAULT 'announced',
	"assigned_collector_id" uuid,
	"scheduled_at" timestamp with time zone,
	"lot_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "route_stops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"pre_lot_id" uuid,
	"source_id" uuid,
	"order" integer NOT NULL,
	"status" "route_stop_status" DEFAULT 'pending',
	"arrival_time" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collector_id" uuid NOT NULL,
	"date" timestamp with time zone,
	"status" "route_status" DEFAULT 'planned',
	"total_planned_kg" numeric(10, 2),
	"total_actual_kg" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lot_lineage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_lot_id" uuid NOT NULL,
	"parent_lot_id" uuid NOT NULL,
	"weight_contribution_kg" numeric(10, 2),
	"operation" "lot_lineage_operation",
	"performed_by" uuid,
	"performed_at" timestamp with time zone,
	"notes" text,
	CONSTRAINT "lot_lineage_child_lot_id_parent_lot_id_unique" UNIQUE("child_lot_id","parent_lot_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lot_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"angle" "lot_photo_angle",
	"captured_at" timestamp with time zone,
	"gps_lat" numeric(10, 7),
	"gps_lng" numeric(10, 7)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lot_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_id" uuid NOT NULL,
	"type" "signature_type",
	"file_id" uuid NOT NULL,
	"signed_by_name" text,
	"captured_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lot_weighs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_id" uuid NOT NULL,
	"phase" text NOT NULL,
	"weight_kg" numeric(10, 2) NOT NULL,
	"source" "weigh_source",
	"recorded_by" uuid,
	"recorded_at" timestamp with time zone,
	"event_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"source_type" "source_type",
	"collector_id" uuid,
	"qr_code" text NOT NULL,
	"declared_weight_kg" numeric(10, 2),
	"actual_weight_kg" numeric(10, 2),
	"state_quick" "lot_state_quick",
	"urgency" "urgency_level" DEFAULT 'normal',
	"cold_chain_temp_c" numeric(5, 2),
	"gps_lat" numeric(10, 7),
	"gps_lng" numeric(10, 7),
	"status" "lot_status" NOT NULL,
	"is_urgent" boolean DEFAULT false,
	"collected_at" timestamp with time zone,
	"pre_lot_id" uuid,
	"route_stop_id" uuid,
	"current_location_id" uuid,
	"current_location_type" text,
	"notes" text,
	"voice_note_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lots_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transport_gps_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"lat" numeric(10, 7) NOT NULL,
	"lng" numeric(10, 7) NOT NULL,
	"temperature_c" numeric(5, 2),
	"recorded_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transport_job_lots" (
	"job_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"loaded_weight_kg" numeric(10, 2),
	"delivered_weight_kg" numeric(10, 2),
	"loaded_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	CONSTRAINT "transport_job_lots_job_id_lot_id_pk" PRIMARY KEY("job_id","lot_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transport_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transporter_id" uuid,
	"origin_type" text NOT NULL,
	"origin_id" uuid NOT NULL,
	"destination_type" text NOT NULL,
	"destination_id" uuid NOT NULL,
	"lane" "transport_lane" NOT NULL,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"sla_deadline" timestamp with time zone,
	"requested_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transporters" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"vehicle_info" jsonb,
	"certifications" jsonb,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "a1_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"depot_id" uuid NOT NULL,
	"trigger_condition" jsonb NOT NULL,
	"severity" "a1_severity" NOT NULL,
	"status" "a1_status" DEFAULT 'open' NOT NULL,
	"fired_at" timestamp with time zone NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "depot_dispatch_lots" (
	"dispatch_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"weight_kg" numeric(10, 2) NOT NULL,
	CONSTRAINT "depot_dispatch_lots_dispatch_id_lot_id_pk" PRIMARY KEY("dispatch_id","lot_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "depot_dispatches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"depot_id" uuid NOT NULL,
	"destination_laverie_id" uuid NOT NULL,
	"manifest_weight_kg" numeric(10, 2) NOT NULL,
	"dispatched_by" uuid NOT NULL,
	"dispatched_at" timestamp with time zone NOT NULL,
	"transport_job_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "depot_receptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"depot_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"declared_weight_kg" numeric(10, 2) NOT NULL,
	"actual_weight_kg" numeric(10, 2) NOT NULL,
	"discrepancy_kg" numeric(10, 2) NOT NULL,
	"tolerance_exceeded" boolean NOT NULL,
	"zone_id" uuid,
	"received_by" uuid NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "depot_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"depot_id" uuid NOT NULL,
	"code" text NOT NULL,
	"purpose" "depot_zone_purpose" NOT NULL,
	"capacity_kg" numeric(10, 2) NOT NULL,
	"current_weight_kg" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "depots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"region_id" uuid NOT NULL,
	"address" text NOT NULL,
	"capacity_kg" numeric(10, 2) NOT NULL,
	"current_weight_kg" numeric(10, 2) NOT NULL,
	"manager_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "laverie_dispatches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_id" uuid NOT NULL,
	"qualification_id" uuid NOT NULL,
	"track" "dispatch_track" NOT NULL,
	"target_transformer_id" uuid,
	"rule_version" integer NOT NULL,
	"dispatched_by" uuid,
	"dispatched_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "laverie_receptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laverie_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"depot_dispatch_id" uuid,
	"received_weight_kg" numeric(10, 2) NOT NULL,
	"received_by" uuid NOT NULL,
	"received_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "laveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"region_id" uuid NOT NULL,
	"address" text NOT NULL,
	"daily_capacity_kg" numeric(10, 2) NOT NULL,
	"manager_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pre_wash_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_id" uuid NOT NULL,
	"vet_cert_reference" text,
	"visual_inspection_passed" boolean NOT NULL,
	"contamination_detected" boolean NOT NULL,
	"action" "pre_wash_action" NOT NULL,
	"performed_by" uuid NOT NULL,
	"performed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pricing_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_id" uuid NOT NULL,
	"qualification_id" uuid NOT NULL,
	"base_price_per_kg" numeric(10, 2) NOT NULL,
	"urgency_discount_percent" numeric(5, 2) NOT NULL,
	"source_type_adjustment_percent" numeric(5, 2) NOT NULL,
	"final_price_per_kg" numeric(10, 2) NOT NULL,
	"total_value" numeric(12, 2) NOT NULL,
	"computed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qualifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_id" uuid NOT NULL,
	"washing_run_id" uuid NOT NULL,
	"fiber_length_mm" numeric(7, 2),
	"fiber_diameter_micron" numeric(7, 2),
	"moisture_percent" numeric(5, 2),
	"cleanliness_score" integer,
	"color" text,
	"grade" "grade" NOT NULL,
	"safety_status" "safety_status" NOT NULL,
	"contamination_notes" text,
	"performed_by" uuid NOT NULL,
	"performed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "washing_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laverie_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"dirty_weight_kg" numeric(10, 2) NOT NULL,
	"clean_weight_kg" numeric(10, 2),
	"yield_percent" numeric(5, 2),
	"water_liters" numeric(10, 2),
	"chemicals" jsonb,
	"cycle_duration_minutes" integer,
	"water_temp_c" numeric(5, 2),
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"operated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "boms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transformer_id" uuid NOT NULL,
	"product_type_code" text NOT NULL,
	"product_name" text NOT NULL,
	"input_wool_kg_per_unit" numeric(10, 4) NOT NULL,
	"additives" jsonb,
	"expected_yield_percent" numeric(5, 2) NOT NULL,
	"version" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "production_run_lots" (
	"run_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"weight_used_kg" numeric(10, 2) NOT NULL,
	CONSTRAINT "production_run_lots_run_id_lot_id_pk" PRIMARY KEY("run_id","lot_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "production_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transformer_id" uuid NOT NULL,
	"bom_id" uuid NOT NULL,
	"bom_version" integer NOT NULL,
	"input_weight_kg" numeric(10, 2) NOT NULL,
	"output_weight_kg" numeric(10, 2),
	"waste_weight_kg" numeric(10, 2),
	"yield_percent" numeric(5, 2),
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"operated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"production_run_id" uuid NOT NULL,
	"product_code" text NOT NULL,
	"product_type_code" text NOT NULL,
	"track" "transformer_track" NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" text NOT NULL,
	"weight_kg" numeric(10, 2) NOT NULL,
	"status" "product_status" DEFAULT 'in_production' NOT NULL,
	"certification_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_product_code_unique" UNIQUE("product_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transformers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"track" "transformer_track" NOT NULL,
	"region_id" uuid NOT NULL,
	"address" text NOT NULL,
	"daily_capacity_kg" numeric(10, 2) NOT NULL,
	"manager_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waste_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"production_run_id" uuid,
	"washing_run_id" uuid,
	"amount_kg" numeric(10, 2) NOT NULL,
	"category" "waste_category" NOT NULL,
	"destination" text,
	"recorded_by" uuid NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"product_code" text NOT NULL,
	"status" "cert_status" DEFAULT 'pending' NOT NULL,
	"gates_passed" jsonb,
	"signature" text,
	"issued_by" uuid,
	"issued_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	"qr_code_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "buyer_catalog_products" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"grade" text NOT NULL,
	"region" text NOT NULL,
	"available_quantity_kg" numeric(10, 2) NOT NULL,
	"price_per_kg_dzd" numeric(10, 2) NOT NULL,
	"price_per_kg_eur" numeric(10, 2),
	"nfn_seal_status" text NOT NULL,
	"nfn_seal_code" text,
	"nfn_certified_at" timestamp with time zone,
	"description" text NOT NULL,
	"images" jsonb NOT NULL,
	"quality_parameters" jsonb NOT NULL,
	"traceability" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "buyer_catalog_products_code_unique" UNIQUE("code"),
	CONSTRAINT "buyer_catalog_products_nfn_seal_code_unique" UNIQUE("nfn_seal_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "buyer_complaints" (
	"id" text PRIMARY KEY NOT NULL,
	"buyer_id" uuid NOT NULL,
	"order_code" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'review' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "buyers" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"registration_number" text,
	"preferred_channel" "channel" NOT NULL,
	"credit_limit" numeric(12, 2),
	"billing_address" jsonb NOT NULL,
	"shipping_addresses" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" text NOT NULL,
	"product_code" text NOT NULL,
	"product_name" text NOT NULL,
	"grade" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_code" text NOT NULL,
	"buyer_id" uuid NOT NULL,
	"channel" "channel" NOT NULL,
	"status" "order_status" DEFAULT 'draft' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"tax" numeric(12, 2) NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'DZD' NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"quoted_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"type" "sales_doc_type" NOT NULL,
	"file_id" uuid NOT NULL,
	"title" text NOT NULL,
	"size_label" text NOT NULL,
	"generated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"status" "shipment_status" DEFAULT 'pending' NOT NULL,
	"tracking_reference" text,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "institutional_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"query_type" "institutional_query_type" NOT NULL,
	"query_params" jsonb NOT NULL,
	"result_count" integer NOT NULL,
	"justification" text,
	"performed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "institutional_users" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"institution_name" text NOT NULL,
	"mandate" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type_pattern" text NOT NULL,
	"handler_name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"actor_id" uuid,
	"actor_type" text NOT NULL,
	"payload" jsonb,
	"occurred_at" timestamp with time zone NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sync_source" text,
	"device_id" uuid,
	"version" integer NOT NULL,
	"checksum" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_type" "audit_type" NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" uuid NOT NULL,
	"findings" jsonb NOT NULL,
	"passed" boolean NOT NULL,
	"auditor_id" uuid NOT NULL,
	"performed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reconciliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_id" uuid NOT NULL,
	"phase_from" text NOT NULL,
	"phase_to" text NOT NULL,
	"weight_out_kg" numeric(10, 2) NOT NULL,
	"weight_in_kg" numeric(10, 2) NOT NULL,
	"delta_kg" numeric(10, 2) NOT NULL,
	"tolerance_kg" numeric(10, 2) NOT NULL,
	"within_tolerance" boolean NOT NULL,
	"flagged" boolean NOT NULL,
	"computed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rules_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"version" integer,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "file_kind" NOT NULL,
	"mime_type" text NOT NULL,
	"storage_path" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"uploaded_by" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"payload" jsonb,
	"read_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"direction" "sync_direction" NOT NULL,
	"event_count" integer NOT NULL,
	"status" "sync_batch_status" DEFAULT 'pending' NOT NULL,
	"error" text,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"device_info" jsonb NOT NULL,
	"last_sync_at" timestamp with time zone,
	"namespace_prefix" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sync_devices_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "regions" ADD CONSTRAINT "regions_parent_id_regions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "aggregators" ADD CONSTRAINT "aggregators_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shepherds" ADD CONSTRAINT "shepherds_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "slaughterhouses" ADD CONSTRAINT "slaughterhouses_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sources" ADD CONSTRAINT "sources_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sources" ADD CONSTRAINT "sources_registered_by_users_id_fk" FOREIGN KEY ("registered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collector_booklets" ADD CONSTRAINT "collector_booklets_collector_id_collectors_user_id_fk" FOREIGN KEY ("collector_id") REFERENCES "public"."collectors"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collectors" ADD CONSTRAINT "collectors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pre_lots" ADD CONSTRAINT "pre_lots_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pre_lots" ADD CONSTRAINT "pre_lots_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pre_lots" ADD CONSTRAINT "pre_lots_assigned_collector_id_collectors_user_id_fk" FOREIGN KEY ("assigned_collector_id") REFERENCES "public"."collectors"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_pre_lot_id_pre_lots_id_fk" FOREIGN KEY ("pre_lot_id") REFERENCES "public"."pre_lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "routes" ADD CONSTRAINT "routes_collector_id_collectors_user_id_fk" FOREIGN KEY ("collector_id") REFERENCES "public"."collectors"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lot_lineage" ADD CONSTRAINT "lot_lineage_child_lot_id_lots_id_fk" FOREIGN KEY ("child_lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lot_lineage" ADD CONSTRAINT "lot_lineage_parent_lot_id_lots_id_fk" FOREIGN KEY ("parent_lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lot_lineage" ADD CONSTRAINT "lot_lineage_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lot_photos" ADD CONSTRAINT "lot_photos_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lot_signatures" ADD CONSTRAINT "lot_signatures_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lot_weighs" ADD CONSTRAINT "lot_weighs_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lot_weighs" ADD CONSTRAINT "lot_weighs_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lots" ADD CONSTRAINT "lots_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transport_gps_points" ADD CONSTRAINT "transport_gps_points_job_id_transport_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."transport_jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transport_job_lots" ADD CONSTRAINT "transport_job_lots_job_id_transport_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."transport_jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transport_job_lots" ADD CONSTRAINT "transport_job_lots_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transport_jobs" ADD CONSTRAINT "transport_jobs_transporter_id_transporters_user_id_fk" FOREIGN KEY ("transporter_id") REFERENCES "public"."transporters"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transporters" ADD CONSTRAINT "transporters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "a1_alerts" ADD CONSTRAINT "a1_alerts_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depot_dispatch_lots" ADD CONSTRAINT "depot_dispatch_lots_dispatch_id_depot_dispatches_id_fk" FOREIGN KEY ("dispatch_id") REFERENCES "public"."depot_dispatches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depot_dispatch_lots" ADD CONSTRAINT "depot_dispatch_lots_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depot_dispatches" ADD CONSTRAINT "depot_dispatches_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depot_dispatches" ADD CONSTRAINT "depot_dispatches_dispatched_by_users_id_fk" FOREIGN KEY ("dispatched_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depot_dispatches" ADD CONSTRAINT "depot_dispatches_transport_job_id_transport_jobs_id_fk" FOREIGN KEY ("transport_job_id") REFERENCES "public"."transport_jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depot_receptions" ADD CONSTRAINT "depot_receptions_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depot_receptions" ADD CONSTRAINT "depot_receptions_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depot_receptions" ADD CONSTRAINT "depot_receptions_zone_id_depot_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."depot_zones"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depot_receptions" ADD CONSTRAINT "depot_receptions_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depot_zones" ADD CONSTRAINT "depot_zones_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depots" ADD CONSTRAINT "depots_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "depots" ADD CONSTRAINT "depots_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laverie_dispatches" ADD CONSTRAINT "laverie_dispatches_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laverie_dispatches" ADD CONSTRAINT "laverie_dispatches_qualification_id_qualifications_id_fk" FOREIGN KEY ("qualification_id") REFERENCES "public"."qualifications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laverie_dispatches" ADD CONSTRAINT "laverie_dispatches_dispatched_by_users_id_fk" FOREIGN KEY ("dispatched_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laverie_receptions" ADD CONSTRAINT "laverie_receptions_laverie_id_laveries_id_fk" FOREIGN KEY ("laverie_id") REFERENCES "public"."laveries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laverie_receptions" ADD CONSTRAINT "laverie_receptions_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laverie_receptions" ADD CONSTRAINT "laverie_receptions_depot_dispatch_id_depot_dispatches_id_fk" FOREIGN KEY ("depot_dispatch_id") REFERENCES "public"."depot_dispatches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laverie_receptions" ADD CONSTRAINT "laverie_receptions_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laveries" ADD CONSTRAINT "laveries_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laveries" ADD CONSTRAINT "laveries_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pre_wash_checks" ADD CONSTRAINT "pre_wash_checks_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pre_wash_checks" ADD CONSTRAINT "pre_wash_checks_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pricing_proposals" ADD CONSTRAINT "pricing_proposals_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pricing_proposals" ADD CONSTRAINT "pricing_proposals_qualification_id_qualifications_id_fk" FOREIGN KEY ("qualification_id") REFERENCES "public"."qualifications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_washing_run_id_washing_runs_id_fk" FOREIGN KEY ("washing_run_id") REFERENCES "public"."washing_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "washing_runs" ADD CONSTRAINT "washing_runs_laverie_id_laveries_id_fk" FOREIGN KEY ("laverie_id") REFERENCES "public"."laveries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "washing_runs" ADD CONSTRAINT "washing_runs_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "washing_runs" ADD CONSTRAINT "washing_runs_operated_by_users_id_fk" FOREIGN KEY ("operated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "boms" ADD CONSTRAINT "boms_transformer_id_transformers_id_fk" FOREIGN KEY ("transformer_id") REFERENCES "public"."transformers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_run_lots" ADD CONSTRAINT "production_run_lots_run_id_production_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."production_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_run_lots" ADD CONSTRAINT "production_run_lots_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_runs" ADD CONSTRAINT "production_runs_transformer_id_transformers_id_fk" FOREIGN KEY ("transformer_id") REFERENCES "public"."transformers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_runs" ADD CONSTRAINT "production_runs_bom_id_boms_id_fk" FOREIGN KEY ("bom_id") REFERENCES "public"."boms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production_runs" ADD CONSTRAINT "production_runs_operated_by_users_id_fk" FOREIGN KEY ("operated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_production_run_id_production_runs_id_fk" FOREIGN KEY ("production_run_id") REFERENCES "public"."production_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transformers" ADD CONSTRAINT "transformers_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transformers" ADD CONSTRAINT "transformers_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waste_records" ADD CONSTRAINT "waste_records_production_run_id_production_runs_id_fk" FOREIGN KEY ("production_run_id") REFERENCES "public"."production_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waste_records" ADD CONSTRAINT "waste_records_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certifications" ADD CONSTRAINT "certifications_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certifications" ADD CONSTRAINT "certifications_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "buyer_complaints" ADD CONSTRAINT "buyer_complaints_buyer_id_buyers_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "buyers" ADD CONSTRAINT "buyers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_buyers_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_documents" ADD CONSTRAINT "sales_documents_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "institutional_queries" ADD CONSTRAINT "institutional_queries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "institutional_users" ADD CONSTRAINT "institutional_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audits" ADD CONSTRAINT "audits_auditor_id_users_id_fk" FOREIGN KEY ("auditor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rules_config" ADD CONSTRAINT "rules_config_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sync_batches" ADD CONSTRAINT "sync_batches_device_id_sync_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."sync_devices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sync_devices" ADD CONSTRAINT "sync_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
