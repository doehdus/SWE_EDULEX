BEGIN;

ALTER TABLE public.users RENAME COLUMN star_dust TO bookmark;

COMMIT;
