-- ================================================================
-- Migration: N03-5 단어 레벨 승급 시스템 (통합 번들)
-- ----------------------------------------------------------------
-- 합쳐진 마이그레이션:
--   1. 20260519000000_n03_5_word_level.sql       (user 단어장 레벨 시스템)
--   2. 20260519000002_official_word_level.sql    (official 단어장 레벨 확장)
--
-- 목적:
--   1. user_words.word_level 컬럼 추가 (LV1~4 단계 승급)
--   2. user_official_word_progress 테이블 신규 (공식 단어 유저별 레벨 추적)
--   3. get_official_words_for_level RPC 신규 (레벨별 공식 단어 조회)
--   4. get_wordbook_progress RPC (user + official 양쪽 지원)
--   5. get_level_word_count RPC (user + official 양쪽 지원)
--   6. save_quiz_result RPC 재정의 (user + official 승급 로직 통합)
--
-- 사용법:
--   - Supabase SQL Editor 에 본 파일 전체를 붙여넣고 Run.
--   - 단일 트랜잭션이므로 어느 한 단계라도 실패하면 전체 롤백.
--   - 멱등 — IF NOT EXISTS / DROP IF EXISTS / ON CONFLICT 등으로 재적용 안전.
--
-- 선행 조건:
--   - G01(shop+title) 마이그레이션 적용 완료
--     (check_titles_for_user, bookmark_total_earned 컬럼 존재 필요)
-- ================================================================

BEGIN;

-- ================================================================
-- 1. user_words.word_level 컬럼 추가
-- ================================================================

ALTER TABLE public.user_words
  ADD COLUMN IF NOT EXISTS word_level integer NOT NULL DEFAULT 1;

ALTER TABLE public.user_words
  DROP CONSTRAINT IF EXISTS user_words_word_level_chk;

ALTER TABLE public.user_words
  ADD CONSTRAINT user_words_word_level_chk
  CHECK (word_level BETWEEN 1 AND 4);


-- ================================================================
-- 2. user_official_word_progress 테이블
--    공식 단어는 전체 유저가 공유하는 행이므로 별도 진도 테이블 필요
-- ================================================================

CREATE TABLE IF NOT EXISTS public.user_official_word_progress (
  user_id    uuid    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  word_id    uuid    NOT NULL REFERENCES public.official_words(id) ON DELETE CASCADE,
  word_level integer NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, word_id)
);

ALTER TABLE public.user_official_word_progress
  DROP CONSTRAINT IF EXISTS uowp_word_level_chk;
ALTER TABLE public.user_official_word_progress
  ADD CONSTRAINT uowp_word_level_chk CHECK (word_level BETWEEN 1 AND 4);

ALTER TABLE public.user_official_word_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS uowp_select ON public.user_official_word_progress;
CREATE POLICY uowp_select ON public.user_official_word_progress
  FOR SELECT USING (auth.uid() = user_id);

GRANT SELECT ON public.user_official_word_progress TO authenticated;


-- ================================================================
-- 3. get_official_words_for_level RPC
--    공식 단어장 레벨별 단어 조회 (FE startQuiz 용)
--    p_level NULL → 복습모드 (전체 반환)
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_official_words_for_level(
  p_user_id     uuid,
  p_wordbook_id uuid,
  p_level       integer
)
RETURNS TABLE(id uuid, english text, major_meaning text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF p_level IS NULL THEN
    -- 복습모드: 전체 단어 반환
    RETURN QUERY
    SELECT ow.id, ow.english, ow.major_meaning
    FROM public.official_words ow
    WHERE ow.wordbook_id = p_wordbook_id;
  ELSE
    -- 진도 레코드 없으면 LV1로 간주
    RETURN QUERY
    SELECT ow.id, ow.english, ow.major_meaning
    FROM public.official_words ow
    LEFT JOIN public.user_official_word_progress uop
      ON uop.word_id = ow.id AND uop.user_id = p_user_id
    WHERE ow.wordbook_id = p_wordbook_id
      AND COALESCE(uop.word_level, 1) = p_level;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_official_words_for_level(uuid, uuid, integer) TO authenticated;


-- ================================================================
-- 4. get_wordbook_progress RPC (user + official 양쪽 지원)
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_wordbook_progress(
  p_user_id     uuid,
  p_wordbook_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_official boolean;
  v_total       integer;
  v_lv1         integer;
  v_lv2         integer;
  v_lv3         integer;
  v_lv4         integer;
  v_words       json;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  v_is_official := EXISTS (SELECT 1 FROM public.official_wordbooks WHERE id = p_wordbook_id);

  IF NOT v_is_official AND NOT EXISTS (
    SELECT 1 FROM public.user_wordbooks WHERE id = p_wordbook_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF v_is_official THEN
    SELECT count(*) INTO v_total
      FROM public.official_words WHERE wordbook_id = p_wordbook_id;

    SELECT
      count(*) FILTER (WHERE COALESCE(uop.word_level, 1) = 1),
      count(*) FILTER (WHERE COALESCE(uop.word_level, 1) = 2),
      count(*) FILTER (WHERE COALESCE(uop.word_level, 1) = 3),
      count(*) FILTER (WHERE COALESCE(uop.word_level, 1) = 4)
    INTO v_lv1, v_lv2, v_lv3, v_lv4
    FROM public.official_words ow
    LEFT JOIN public.user_official_word_progress uop
      ON uop.word_id = ow.id AND uop.user_id = p_user_id
    WHERE ow.wordbook_id = p_wordbook_id;

    SELECT COALESCE(
      json_agg(json_build_object('id', ow.id, 'english', ow.english, 'major_meaning', ow.major_meaning)),
      '[]'::json
    ) INTO v_words
    FROM public.official_words ow
    JOIN public.user_official_word_progress uop
      ON uop.word_id = ow.id AND uop.user_id = p_user_id
    WHERE ow.wordbook_id = p_wordbook_id AND uop.word_level = 4;

  ELSE
    SELECT count(*) INTO v_total FROM public.user_words WHERE wordbook_id = p_wordbook_id;
    SELECT count(*) FILTER (WHERE word_level = 1) INTO v_lv1 FROM public.user_words WHERE wordbook_id = p_wordbook_id;
    SELECT count(*) FILTER (WHERE word_level = 2) INTO v_lv2 FROM public.user_words WHERE wordbook_id = p_wordbook_id;
    SELECT count(*) FILTER (WHERE word_level = 3) INTO v_lv3 FROM public.user_words WHERE wordbook_id = p_wordbook_id;
    SELECT count(*) FILTER (WHERE word_level = 4) INTO v_lv4 FROM public.user_words WHERE wordbook_id = p_wordbook_id;

    SELECT COALESCE(
      json_agg(json_build_object('id', id, 'english', english, 'major_meaning', major_meaning)),
      '[]'::json
    ) INTO v_words
    FROM public.user_words
    WHERE wordbook_id = p_wordbook_id AND word_level = 4;
  END IF;

  RETURN json_build_object(
    'total',     v_total,
    'lv1_count', v_lv1,
    'lv2_count', v_lv2,
    'lv3_count', v_lv3,
    'lv4_count', v_lv4,
    'ratio',     CASE WHEN v_total = 0 THEN 0 ELSE round(v_lv4::numeric / v_total, 4) END,
    'lv4_words', v_words
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_wordbook_progress(uuid, uuid) TO authenticated;


-- ================================================================
-- 5. get_level_word_count RPC (user + official 양쪽 지원)
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_level_word_count(
  p_user_id     uuid,
  p_wordbook_id uuid,
  p_level       integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count       integer;
  v_is_official boolean;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  v_is_official := EXISTS (SELECT 1 FROM public.official_wordbooks WHERE id = p_wordbook_id);

  IF NOT v_is_official AND NOT EXISTS (
    SELECT 1 FROM public.user_wordbooks WHERE id = p_wordbook_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF v_is_official THEN
    SELECT count(*) INTO v_count
    FROM public.official_words ow
    LEFT JOIN public.user_official_word_progress uop
      ON uop.word_id = ow.id AND uop.user_id = p_user_id
    WHERE ow.wordbook_id = p_wordbook_id
      AND COALESCE(uop.word_level, 1) = p_level;
  ELSE
    SELECT count(*) INTO v_count
    FROM public.user_words
    WHERE wordbook_id = p_wordbook_id AND word_level = p_level;
  END IF;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_level_word_count(uuid, uuid, integer) TO authenticated;


-- ================================================================
-- 6. save_quiz_result RPC 재정의 (user + official 승급 로직 통합)
--    파라미터: p_level, p_correct_word_ids 추가
--    반환: gained_bookmark, new_bookmark, earned_titles, promoted_count
-- ================================================================

DROP FUNCTION IF EXISTS public.save_quiz_result(uuid, uuid, text, integer, integer, integer);
DROP FUNCTION IF EXISTS public.save_quiz_result(uuid, uuid, text, integer, integer, integer, integer, uuid[]);

CREATE FUNCTION public.save_quiz_result(
  p_user_id          uuid,
  p_wordbook_id      uuid,
  p_wordbook_type    text,
  p_score            integer,
  p_total            integer,
  p_correct          integer,
  p_level            integer  DEFAULT NULL,
  p_correct_word_ids uuid[]   DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result_id        uuid;
  v_reward           integer;
  v_new_bookmark     integer;
  v_new_total_earned integer;
  v_total_spent      integer;
  v_attendance_count integer;
  v_earned_titles    text[]  := ARRAY[]::text[];
  v_promoted_count   integer := 0;
  v_word_id          uuid;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF p_wordbook_type = 'official' THEN
    IF NOT EXISTS (SELECT 1 FROM public.official_wordbooks WHERE id = p_wordbook_id) THEN
      RAISE EXCEPTION 'invalid wordbook_id';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM public.user_wordbooks WHERE id = p_wordbook_id AND user_id = p_user_id
    ) THEN
      RAISE EXCEPTION 'invalid wordbook_id';
    END IF;
  END IF;

  INSERT INTO public.quiz_results(user_id, wordbook_id, wordbook_type, score, total, correct)
  VALUES (p_user_id, p_wordbook_id, p_wordbook_type, p_score, p_total, p_correct)
  RETURNING id INTO v_result_id;

  v_reward := GREATEST(0, p_correct) * 5;

  IF v_reward > 0 THEN
    UPDATE public.users
       SET bookmark              = bookmark + v_reward,
           bookmark_total_earned = bookmark_total_earned + v_reward
     WHERE id = p_user_id
    RETURNING bookmark, bookmark_total_earned, bookmark_total_spent
         INTO v_new_bookmark, v_new_total_earned, v_total_spent;

    INSERT INTO public.bookmark_logs(user_id, change_amount, reason, ref_id)
    VALUES (p_user_id, v_reward, 'test_reward', v_result_id);
  ELSE
    SELECT bookmark, bookmark_total_earned, bookmark_total_spent
      INTO v_new_bookmark, v_new_total_earned, v_total_spent
      FROM public.users WHERE id = p_user_id;
  END IF;

  SELECT count(*) INTO v_attendance_count
    FROM public.attendance WHERE user_id = p_user_id;

  v_earned_titles := public.check_titles_for_user(
    p_user_id, v_new_total_earned, v_total_spent, v_attendance_count
  );

  -- word_level 승급 — user 단어장
  IF p_level IS NOT NULL
     AND p_correct_word_ids IS NOT NULL
     AND array_length(p_correct_word_ids, 1) > 0
     AND p_wordbook_type = 'user'
  THEN
    FOREACH v_word_id IN ARRAY p_correct_word_ids LOOP
      UPDATE public.user_words
         SET word_level = LEAST(word_level + 1, 4)
       WHERE id          = v_word_id
         AND word_level  = p_level
         AND wordbook_id = p_wordbook_id
         AND EXISTS (
           SELECT 1 FROM public.user_wordbooks
            WHERE id = p_wordbook_id AND user_id = p_user_id
         );
      IF FOUND THEN v_promoted_count := v_promoted_count + 1; END IF;
    END LOOP;
  END IF;

  -- word_level 승급 — official 단어장
  IF p_level IS NOT NULL
     AND p_correct_word_ids IS NOT NULL
     AND array_length(p_correct_word_ids, 1) > 0
     AND p_wordbook_type = 'official'
  THEN
    FOREACH v_word_id IN ARRAY p_correct_word_ids LOOP
      -- 진도 레코드 없으면 LV1으로 초기화
      INSERT INTO public.user_official_word_progress (user_id, word_id, word_level)
      VALUES (p_user_id, v_word_id, 1)
      ON CONFLICT (user_id, word_id) DO NOTHING;

      UPDATE public.user_official_word_progress
         SET word_level = LEAST(word_level + 1, 4)
       WHERE user_id   = p_user_id
         AND word_id   = v_word_id
         AND word_level = p_level;

      IF FOUND THEN v_promoted_count := v_promoted_count + 1; END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'gained_bookmark', v_reward,
    'new_bookmark',    v_new_bookmark,
    'earned_titles',   v_earned_titles,
    'promoted_count',  v_promoted_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_quiz_result(uuid, uuid, text, integer, integer, integer, integer, uuid[]) TO authenticated;

COMMIT;

-- ================================================================
-- 사후 검증 SQL (별도 실행 권장)
-- ================================================================
-- -- word_level 컬럼 확인
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'user_words' AND column_name = 'word_level';
--
-- -- 테이블 확인
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema='public' AND table_name='user_official_word_progress';
--
-- -- RPC 목록 확인
-- SELECT proname, pg_get_function_result(oid) AS returns
-- FROM pg_proc
-- WHERE proname IN ('get_official_words_for_level','get_wordbook_progress','get_level_word_count','save_quiz_result')
--   AND pronamespace = 'public'::regnamespace
-- ORDER BY proname;
-- ================================================================
