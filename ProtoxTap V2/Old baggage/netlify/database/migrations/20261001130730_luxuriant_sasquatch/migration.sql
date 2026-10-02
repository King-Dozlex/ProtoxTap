CREATE TABLE "card_events" (
	"id" serial PRIMARY KEY,
	"card_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_agent" text
);
--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "deactivated_at" timestamp;--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "business_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "google_review_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "status" SET DEFAULT 'unassigned';--> statement-breakpoint
ALTER TABLE "card_events" ADD CONSTRAINT "card_events_card_id_cards_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id");