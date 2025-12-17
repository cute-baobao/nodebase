ALTER TABLE "node" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."node_type";--> statement-breakpoint
CREATE TYPE "public"."node_type" AS ENUM('INITIAL', 'MANUAL_TRIGGER', 'HTTP_REQUEST', 'GOOGLE_FORM_TRIGGER', 'STRIPE_TRIGGER', 'OPENAI', 'GEMINI', 'DEEPSEEK', 'DISCORD', 'RESEND', 'CRON_TRIGGER', 'X_CREATE_POST', 'X_GET_TWEET');--> statement-breakpoint
ALTER TABLE "node" ALTER COLUMN "type" SET DATA TYPE "public"."node_type" USING "type"::"public"."node_type";