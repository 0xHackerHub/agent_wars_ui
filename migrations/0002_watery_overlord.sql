ALTER TABLE "wallets" DROP CONSTRAINT "wallets_publicKey_unique";--> statement-breakpoint
ALTER TABLE "wallets" DROP COLUMN "publicKey";--> statement-breakpoint
ALTER TABLE "wallets" DROP COLUMN "privateKey";