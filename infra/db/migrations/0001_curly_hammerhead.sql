DO $$ BEGIN
 CREATE TYPE "public"."antimites_treatment_type" AS ENUM('natural', 'synthetic');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."bag_type" AS ENUM('PP', 'jute');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."conditioning_state" AS ENUM('correct', 'torn', 'humid');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."depot_destination_direct" AS ENUM('laverie', 'transformer_direct');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."extraction_method" AS ENUM('pelade', 'echauffe');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."lot_classification" AS ENUM('class_a', 'class_b');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."product_destination_type" AS ENUM('flux_a1_panels', 'flux_a2_rolls', 'flux_a3_geotextile', 'flux_b_engrais');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."unloading_mode" AS ENUM('vrac', 'balles');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."wool_type" AS ENUM('full_fleece', 'fleece_pieces', 'tail_wool');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "user_type" ADD VALUE 'shepherd';--> statement-breakpoint
ALTER TYPE "user_type" ADD VALUE 'transporter';--> statement-breakpoint
ALTER TYPE "user_type" ADD VALUE 'certification_authority';--> statement-breakpoint
ALTER TABLE "depot_dispatches" ALTER COLUMN "destination_laverie_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pre_lots" ADD COLUMN "shearing_date" date;--> statement-breakpoint
ALTER TABLE "pre_lots" ADD COLUMN "sheep_breed" text;--> statement-breakpoint
ALTER TABLE "pre_lots" ADD COLUMN "bag_count" integer;--> statement-breakpoint
ALTER TABLE "pre_lots" ADD COLUMN "bag_type" "bag_type";--> statement-breakpoint
ALTER TABLE "pre_lots" ADD COLUMN "last_parasite_treatment_date" date;--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "wool_type" "wool_type";--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "cleanliness_score" integer;--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "cleanliness_annotations" jsonb;--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "staple_length_mm" numeric(7, 2);--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "wool_color" text;--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "jarre_rate_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "extraction_method" "extraction_method";--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "humidity_entry_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "skin_residue_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "quality_score" integer;--> statement-breakpoint
ALTER TABLE "lots" ADD COLUMN "specialist_note" text;--> statement-breakpoint
ALTER TABLE "depot_dispatches" ADD COLUMN "destination_transformer_id" uuid;--> statement-breakpoint
ALTER TABLE "depot_dispatches" ADD COLUMN "flux_a_weight_kg" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "depot_dispatches" ADD COLUMN "flux_b_weight_kg" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "depot_dispatches" ADD COLUMN "impurity_rate_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "depot_dispatches" ADD COLUMN "humidity_exit_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "depot_dispatches" ADD COLUMN "destination_direct" "depot_destination_direct";--> statement-breakpoint
ALTER TABLE "depot_receptions" ADD COLUMN "lot_classification" "lot_classification";--> statement-breakpoint
ALTER TABLE "depot_receptions" ADD COLUMN "stack_temperature_c" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "depot_receptions" ADD COLUMN "humidity_entry_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "depot_receptions" ADD COLUMN "vegetal_matter_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "depot_receptions" ADD COLUMN "planned_exit_date" date;--> statement-breakpoint
ALTER TABLE "laverie_receptions" ADD COLUMN "conditioning_state" "conditioning_state";--> statement-breakpoint
ALTER TABLE "laverie_receptions" ADD COLUMN "required_wash_temp_c" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "laverie_receptions" ADD COLUMN "required_detergent_type" text;--> statement-breakpoint
ALTER TABLE "qualifications" ADD COLUMN "residual_humidity_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "qualifications" ADD COLUMN "residual_suint_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "qualifications" ADD COLUMN "whiteness_index" numeric(7, 2);--> statement-breakpoint
ALTER TABLE "qualifications" ADD COLUMN "ph_level" numeric(4, 2);--> statement-breakpoint
ALTER TABLE "qualifications" ADD COLUMN "energy_kwh_used" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "qualifications" ADD COLUMN "water_liters_per_kg" numeric(7, 3);--> statement-breakpoint
ALTER TABLE "washing_runs" ADD COLUMN "detergent_type" text;--> statement-breakpoint
ALTER TABLE "washing_runs" ADD COLUMN "suint_recovered_liters" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "production_runs" ADD COLUMN "dryness_index" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "production_runs" ADD COLUMN "foreign_body_present" boolean;--> statement-breakpoint
ALTER TABLE "production_runs" ADD COLUMN "foreign_body_notes" text;--> statement-breakpoint
ALTER TABLE "production_runs" ADD COLUMN "unloading_mode" "unloading_mode";--> statement-breakpoint
ALTER TABLE "production_runs" ADD COLUMN "product_destination_type" "product_destination_type";--> statement-breakpoint
ALTER TABLE "production_runs" ADD COLUMN "target_thickness_mm" numeric(7, 2);--> statement-breakpoint
ALTER TABLE "production_runs" ADD COLUMN "target_density_kg_m3" numeric(7, 3);--> statement-breakpoint
ALTER TABLE "production_runs" ADD COLUMN "antimites_treatment_type" "antimites_treatment_type";--> statement-breakpoint
ALTER TABLE "production_runs" ADD COLUMN "binding_fiber_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "production_runs" ADD COLUMN "fire_retardant_product" text;--> statement-breakpoint
ALTER TABLE "buyer_complaints" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "buyer_complaints" ADD COLUMN "resolution" text DEFAULT '' NOT NULL;