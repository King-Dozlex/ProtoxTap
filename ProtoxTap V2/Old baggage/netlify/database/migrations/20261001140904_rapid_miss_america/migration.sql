CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
