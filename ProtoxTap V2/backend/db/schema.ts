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
  googlePlaceId: text("google_place_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),

  cardCode: text("card_code").notNull().unique(),

  businessId: integer("business_id")
    .references(() => businesses.id),

  googleReviewUrl: text("google_review_url"),

  status: text("status").notNull().default("unassigned"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  activatedAt: timestamp("activated_at"),
  deactivatedAt: timestamp("deactivated_at"),
});

export const cardEvents = pgTable("card_events", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").notNull().references(() => cards.id),
  eventType: text("event_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),

  username: text("username").notNull().unique(),

  passwordHash: text("password_hash").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),

  tokenHash: text("token_hash").notNull().unique(),

  adminUserId: integer("admin_user_id")
    .notNull()
    .references(() => adminUsers.id),

  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
