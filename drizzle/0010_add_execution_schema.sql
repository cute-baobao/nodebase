CREATE TYPE "public"."execution_status" AS ENUM('SUCCESS', 'FAILED', 'RUNNING');--> statement-breakpoint
CREATE TABLE "execution" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "execution_status" DEFAULT 'RUNNING',
	"inngest_event_id" text NOT NULL,
	"error" text,
	"errorStack" text,
	"workflowId" uuid NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"output" jsonb,
	"nodeStatus" jsonb DEFAULT '{}',
	CONSTRAINT "execution_inngest_event_id_unique" UNIQUE("inngest_event_id")
);
--> statement-breakpoint
ALTER TABLE "execution" ADD CONSTRAINT "execution_workflowId_workflow_id_fk" FOREIGN KEY ("workflowId") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;