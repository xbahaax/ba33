DO $$ BEGIN
 CREATE TYPE "public"."source_profession" AS ENUM('shepherd', 'slaughterhouse', 'butcher', 'aggregator', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."collection_job_status" AS ENUM('pending', 'assigned', 'accepted', 'in_progress', 'arrived', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN IF NOT EXISTS "profession" "source_profession";--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collection_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pre_lot_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"destination_depot_id" uuid NOT NULL,
	"collector_id" uuid,
	"urgency" "urgency_level" DEFAULT 'normal' NOT NULL,
	"status" "collection_job_status" DEFAULT 'pending' NOT NULL,
	"origin_lat" numeric(10, 7),
	"origin_lng" numeric(10, 7),
	"destination_lat" numeric(10, 7),
	"destination_lng" numeric(10, 7),
	"sla_deadline" timestamp with time zone,
	"notes" text,
	"issued_by" uuid,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"arrived_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancel_reason" text,
	"lot_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collection_job_gps_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"lat" numeric(10, 7) NOT NULL,
	"lng" numeric(10, 7) NOT NULL,
	"speed_mps" numeric(8, 3),
	"accuracy" numeric(8, 3),
	"recorded_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_pre_lot_id_pre_lots_id_fk" FOREIGN KEY ("pre_lot_id") REFERENCES "public"."pre_lots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_destination_depot_id_depots_id_fk" FOREIGN KEY ("destination_depot_id") REFERENCES "public"."depots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_collector_id_collectors_user_id_fk" FOREIGN KEY ("collector_id") REFERENCES "public"."collectors"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_job_gps_points" ADD CONSTRAINT "collection_job_gps_points_job_id_collection_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."collection_jobs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collection_jobs_status_idx" ON "collection_jobs" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collection_jobs_collector_idx" ON "collection_jobs" ("collector_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collection_jobs_depot_idx" ON "collection_jobs" ("destination_depot_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collection_job_gps_job_recorded_idx" ON "collection_job_gps_points" ("job_id","recorded_at");
