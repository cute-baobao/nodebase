CREATE TYPE "public"."credential_type" AS ENUM('OPENAI', 'GEMINI', 'DEEPSEEK');--> statement-breakpoint
CREATE TABLE "credential" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "credential_type" NOT NULL,
	"value" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "node" ADD COLUMN "credential_id" uuid;--> statement-breakpoint
ALTER TABLE "credential" ADD CONSTRAINT "credential_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node" ADD CONSTRAINT "node_credential_id_credential_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."credential"("id") ON DELETE set null ON UPDATE no action;