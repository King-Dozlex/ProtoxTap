-- ProtoxTap V2: add the admin action audit log.
-- Safe to re-run if the table already exists.

BEGIN;

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
