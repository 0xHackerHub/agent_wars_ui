CREATE TABLE "canvases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"data" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"node_id" text NOT NULL,
	"canvas_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pipeFlowId" uuid,
	"name" text NOT NULL,
	"metadata" jsonb,
	"multi_run" boolean DEFAULT false,
	"current_call_count" integer DEFAULT 0,
	"maxCalls" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pipe_Flow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerId" uuid,
	"title" varchar NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "pipes" ADD CONSTRAINT "pipes_pipeFlowId_pipe_Flow_id_fk" FOREIGN KEY ("pipeFlowId") REFERENCES "public"."pipe_Flow"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipe_Flow" ADD CONSTRAINT "pipe_Flow_ownerId_wallets_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;