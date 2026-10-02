CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY,
	"business_name" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" serial PRIMARY KEY,
	"card_code" text NOT NULL UNIQUE,
	"business_id" integer NOT NULL,
	"google_review_url" text NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"activated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id");