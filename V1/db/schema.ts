import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),

  businessName: text("business_name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),

  cardCode: text("card_code").notNull().unique(),

  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id),

  googleReviewUrl: text("google_review_url").notNull(),

  status: text("status").notNull().default("inactive"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  activatedAt: timestamp("activated_at"),
});