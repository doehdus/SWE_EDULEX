-- Migration: ui02_cleanup_official_words
-- Delete dummy rows where english column equals 'test' (case-insensitive)
BEGIN;

DELETE FROM public.official_words
WHERE lower(english) = 'test';

COMMIT;
