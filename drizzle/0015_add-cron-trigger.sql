ALTER TYPE "public"."node_type" ADD VALUE 'CRON_TRIGGER';--> statement-breakpoint
ALTER TABLE "workflow" ADD COLUMN "active" boolean DEFAULT false;