-- ================================================================
-- Migration: Remove Wordbook Limit
-- Purpose: Remove the 2-wordbook limit check for all wordbooks
-- ================================================================

BEGIN;

DROP TRIGGER IF EXISTS trg_wordbook_limit ON public.user_wordbooks;
DROP FUNCTION IF EXISTS public.check_wordbook_limit() CASCADE;

COMMIT;
