CREATE TABLE "chatHistory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userAddress" varchar(256) NOT NULL,
	"message" text NOT NULL,
	"response" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userAddress" varchar(256) NOT NULL,
	"sessionToken" varchar(256) NOT NULL,
	"expires" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userAddress" varchar(256) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_userAddress_unique" UNIQUE("userAddress")
);
--> statement-breakpoint
ALTER TABLE "chatHistory" ADD CONSTRAINT "chatHistory_userAddress_wallets_userAddress_fk" FOREIGN KEY ("userAddress") REFERENCES "public"."wallets"("userAddress") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userAddress_wallets_userAddress_fk" FOREIGN KEY ("userAddress") REFERENCES "public"."wallets"("userAddress") ON DELETE no action ON UPDATE no action;