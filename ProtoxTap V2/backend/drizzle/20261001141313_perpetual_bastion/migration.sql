CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY,
	"token_hash" text NOT NULL UNIQUE,
	"admin_user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_admin_user_id_admin_users_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id");