CREATE TABLE "chatSessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userAddress" varchar(256) NOT NULL,
	"title" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chatHistory" ADD COLUMN "sessionId" uuid;--> statement-breakpoint
ALTER TABLE "chatSessions" ADD CONSTRAINT "chatSessions_userAddress_wallets_userAddress_fk" FOREIGN KEY ("userAddress") REFERENCES "public"."wallets"("userAddress") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatHistory" ADD CONSTRAINT "chatHistory_sessionId_chatSessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."chatSessions"("id") ON DELETE no action ON UPDATE no action;