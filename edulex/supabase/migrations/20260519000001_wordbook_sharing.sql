-- ================================================================
-- Migration: Wordbook Sharing (SBI-N05)
-- Purpose: Add community sharing capabilities to user wordbooks
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. Add Columns to user_wordbooks
-- ----------------------------------------------------------------

ALTER TABLE public.user_wordbooks
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_shared boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_wordbook_id uuid DEFAULT NULL;

-- ----------------------------------------------------------------
-- 2. Modify Wordbook Limit Trigger
-- Allow unlimited shared wordbooks (is_shared = true)
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_wordbook_limit()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Only check limits for original wordbooks (is_shared = false)
  IF NEW.is_shared = false THEN
    IF (
      SELECT count(*) FROM public.user_wordbooks 
      WHERE user_id = NEW.user_id AND is_shared = false
    ) >= 2 THEN
      RAISE EXCEPTION '단어장은 최대 2개까지만 생성할 수 있습니다.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------
-- 3. RLS Policy Updates
-- Allow anyone to select public wordbooks and their words
-- ----------------------------------------------------------------

DROP POLICY IF EXISTS "user_wb_public_select" ON public.user_wordbooks;
CREATE POLICY "user_wb_public_select" ON public.user_wordbooks
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "user_w_public_select" ON public.user_words;
CREATE POLICY "user_w_public_select" ON public.user_words
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_wordbooks
      WHERE id = user_words.wordbook_id AND is_public = true
    )
  );

-- ----------------------------------------------------------------
-- 4. RPC: toggle_wordbook_public
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.toggle_wordbook_public(
  p_user_id uuid,
  p_wordbook_id uuid,
  p_is_public boolean
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN RAISE EXCEPTION 'unauthorized'; END IF;

  -- Only allow toggling if it's original (is_shared = false)
  UPDATE public.user_wordbooks
  SET is_public = p_is_public, updated_at = now()
  WHERE id = p_wordbook_id AND user_id = p_user_id AND is_shared = false;
END;
$$;
GRANT EXECUTE ON FUNCTION public.toggle_wordbook_public(uuid, uuid, boolean) TO authenticated;

-- ----------------------------------------------------------------
-- 5. RPC: get_shared_wordbooks
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_shared_wordbooks(p_sort text)
RETURNS TABLE (
  id uuid,
  title text,
  created_at timestamptz,
  share_count integer,
  word_count bigint,
  author_id uuid,
  author_nickname text,
  author_title text,
  author_bookmark integer
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    wb.id,
    wb.title,
    wb.created_at,
    wb.share_count,
    (SELECT COUNT(*) FROM public.user_words WHERE wordbook_id = wb.id) as word_count,
    u.id as author_id,
    u.nickname as author_nickname,
    -- Get latest title from user_titles
    (SELECT title_key FROM public.user_titles WHERE user_id = u.id ORDER BY earned_at DESC LIMIT 1) as author_title,
    u.bookmark_total_earned as author_bookmark
  FROM public.user_wordbooks wb
  JOIN public.users u ON wb.user_id = u.id
  WHERE wb.is_public = true
  ORDER BY
    CASE WHEN p_sort = 'popular' THEN wb.share_count END DESC NULLS LAST,
    CASE WHEN p_sort = 'popular' THEN wb.created_at END DESC NULLS LAST,
    CASE WHEN p_sort = 'latest' OR p_sort IS NULL THEN wb.created_at END DESC NULLS LAST;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_shared_wordbooks(text) TO authenticated;

-- ----------------------------------------------------------------
-- 6. RPC: import_shared_wordbook
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.import_shared_wordbook(
  p_user_id uuid,
  p_source_wordbook_id uuid
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_new_wordbook_id uuid;
  v_source_record record;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN RAISE EXCEPTION 'unauthorized'; END IF;

  -- Get source wordbook
  SELECT * INTO v_source_record FROM public.user_wordbooks WHERE id = p_source_wordbook_id AND is_public = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'wordbook not found or not public'; END IF;

  -- Insert new wordbook (is_shared = true)
  INSERT INTO public.user_wordbooks (user_id, title, is_shared, source_wordbook_id)
  VALUES (p_user_id, v_source_record.title, true, p_source_wordbook_id)
  RETURNING id INTO v_new_wordbook_id;

  -- Copy words
  INSERT INTO public.user_words (wordbook_id, english, general_meaning, major_meaning, general_example, major_example, word_level)
  SELECT v_new_wordbook_id, english, general_meaning, major_meaning, general_example, major_example, 1
  FROM public.user_words
  WHERE wordbook_id = p_source_wordbook_id;

  -- Increment share_count on source
  UPDATE public.user_wordbooks SET share_count = share_count + 1 WHERE id = p_source_wordbook_id;

  RETURN v_new_wordbook_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.import_shared_wordbook(uuid, uuid) TO authenticated;

COMMIT;
