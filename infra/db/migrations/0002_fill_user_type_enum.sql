-- Backfill missing user_type values that the schema declares but the original
-- migration omitted. Shepherd / transporter / certification_authority are
-- required by the seed script and the new two-actor collection model.
ALTER TYPE "public"."user_type" ADD VALUE IF NOT EXISTS 'shepherd';--> statement-breakpoint
ALTER TYPE "public"."user_type" ADD VALUE IF NOT EXISTS 'transporter';--> statement-breakpoint
ALTER TYPE "public"."user_type" ADD VALUE IF NOT EXISTS 'certification_authority';
