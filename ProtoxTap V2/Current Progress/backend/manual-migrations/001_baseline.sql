-- ProtoxTap V2: baseline database schema
-- Safe to run against an existing database: existing tables and data are preserved.
-- Run this file before any incremental migrations.

BEGIN;

CREATE TABLE IF NOT EXISTS public.businesses (
    id SERIAL PRIMARY KEY,
    business_name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    notes TEXT,
    google_place_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cards (
    id SERIAL PRIMARY KEY,
    card_code TEXT NOT NULL UNIQUE,
    business_id INTEGER REFERENCES public.businesses(id),
    redirect_url TEXT,
    status TEXT NOT NULL DEFAULT 'unassigned',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    activated_at TIMESTAMP,
    deactivated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.card_events (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL REFERENCES public.cards(id),
    event_type TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
    id SERIAL PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    admin_user_id INTEGER NOT NULL
        REFERENCES public.admin_users(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_actions (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER NOT NULL
        REFERENCES public.admin_users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER,
    target_label TEXT,
    details JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMIT;
