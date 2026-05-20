-- ================================================================
-- Migration: N03-5 단어 레벨 승급 시스템
-- 목적:
--   1. user_words.word_level 컬럼 추가 (LV1~4 단계 승급)
--   2. save_quiz_result RPC 통합 재정의
--      - 3번 팀(G01) 변경사항 유지: c*5 보상, jsonb 반환, 칭호 체크
--      - N03-5 추가: p_level, p_correct_word_ids, word_level 승급 로직
--   3. get_wordbook_progress RPC 신규 (단어장 성취도 조회)
--   4. get_level_word_count RPC 신규 (레벨별 단어 수 조회)
--
-- 선행 조건:
--   - 3번 팀(G01) 마이그레이션(shop,title.sql) 적용 완료 후 실행
--     (check_titles_for_user, bookmark_total_earned 컬럼 존재 필요)
-- ================================================================

BEGIN;

-- ================================================================
-- 1. user_words 테이블에 word_level 컬럼 추가
-- ================================================================

ALTER TABLE public.user_words
  ADD COLUMN IF NOT EXISTS word_level integer NOT NULL DEFAULT 1;

ALTER TABLE public.user_words
  DROP CONSTRAINT IF EXISTS user_words_word_level_chk;

ALTER TABLE public.user_words
  ADD CONSTRAINT user_words_word_level_chk
  CHECK (word_level BETWEEN 1 AND 4);

-- 기존 레코드: ADD COLUMN DEFAULT 1 로 자동 백필됨


-- ================================================================
-- 2. save_quiz_result RPC — 통합 재정의 (황희 버전)
--    3번 팀(G01) 변경사항 + N03-5 word_level 승급 로직 합본
--    파라미터 추가(p_level, p_correct_word_ids)로 시그니처 변경
--    → DROP 후 CREATE
-- ================================================================

DROP FUNCTION IF EXISTS public.save_quiz_result(uuid, uuid, text, integer, integer, integer);

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
  -- 호출자 검증
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- wordbook_id 서버 검증
  IF p_wordbook_type = 'official' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.official_wordbooks WHERE id = p_wordbook_id
    ) THEN
      RAISE EXCEPTION 'invalid wordbook_id';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM public.user_wordbooks
       WHERE id = p_wordbook_id AND user_id = p_user_id
    ) THEN
      RAISE EXCEPTION 'invalid wordbook_id';
    END IF;
  END IF;

  -- 퀴즈 결과 저장
  INSERT INTO public.quiz_results(user_id, wordbook_id, wordbook_type, score, total, correct)
  VALUES (p_user_id, p_wordbook_id, p_wordbook_type, p_score, p_total, p_correct)
  RETURNING id INTO v_result_id;

  -- 책갈피 보상 (c * 5)
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
      FROM public.users
     WHERE id = p_user_id;
  END IF;

  -- 칭호 체크 (3번 팀 G01)
  SELECT count(*) INTO v_attendance_count
    FROM public.attendance
   WHERE user_id = p_user_id;

  v_earned_titles := public.check_titles_for_user(
    p_user_id, v_new_total_earned, v_total_spent, v_attendance_count
  );

  -- word_level 승급 (N03-5) — user 단어장 + 레벨 파라미터 있을 때만
  IF p_level IS NOT NULL
     AND p_correct_word_ids IS NOT NULL
     AND array_length(p_correct_word_ids, 1) > 0
     AND p_wordbook_type = 'user'
  THEN
    FOREACH v_word_id IN ARRAY p_correct_word_ids LOOP
      UPDATE public.user_words
         SET word_level = LEAST(word_level + 1, 4)
       WHERE id           = v_word_id
         AND word_level   = p_level
         AND wordbook_id  = p_wordbook_id
         AND EXISTS (
           SELECT 1 FROM public.user_wordbooks
            WHERE id = p_wordbook_id AND user_id = p_user_id
         );

      IF FOUND THEN
        v_promoted_count := v_promoted_count + 1;
      END IF;
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


-- ================================================================
-- 3. get_wordbook_progress RPC — 단어장 성취도 조회
--    반환: { total, lv1_count, lv2_count, lv3_count, lv4_count, ratio, lv4_words }
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
  v_total  integer;
  v_lv1    integer;
  v_lv2    integer;
  v_lv3    integer;
  v_lv4    integer;
  v_words  json;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_wordbooks
     WHERE id = p_wordbook_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT count(*)                                           INTO v_total FROM public.user_words WHERE wordbook_id = p_wordbook_id;
  SELECT count(*) FILTER (WHERE word_level = 1)            INTO v_lv1   FROM public.user_words WHERE wordbook_id = p_wordbook_id;
  SELECT count(*) FILTER (WHERE word_level = 2)            INTO v_lv2   FROM public.user_words WHERE wordbook_id = p_wordbook_id;
  SELECT count(*) FILTER (WHERE word_level = 3)            INTO v_lv3   FROM public.user_words WHERE wordbook_id = p_wordbook_id;
  SELECT count(*) FILTER (WHERE word_level = 4)            INTO v_lv4   FROM public.user_words WHERE wordbook_id = p_wordbook_id;

  SELECT COALESCE(
    json_agg(json_build_object('id', id, 'english', english, 'major_meaning', major_meaning)),
    '[]'::json
  ) INTO v_words
  FROM public.user_words
  WHERE wordbook_id = p_wordbook_id AND word_level = 4;

  RETURN json_build_object(
    'total',     v_total,
    'lv1_count', v_lv1,
    'lv2_count', v_lv2,
    'lv3_count', v_lv3,
    'lv4_count', v_lv4,
    'ratio',     CASE WHEN v_total = 0 THEN 0
                      ELSE round(v_lv4::numeric / v_total, 4) END,
    'lv4_words', v_words
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_wordbook_progress(uuid, uuid) TO authenticated;


-- ================================================================
-- 4. get_level_word_count RPC — 레벨별 단어 수 조회 (진입 전 검사용)
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
  v_count integer;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_wordbooks
     WHERE id = p_wordbook_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT count(*) INTO v_count
    FROM public.user_words
   WHERE wordbook_id = p_wordbook_id AND word_level = p_level;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_level_word_count(uuid, uuid, integer) TO authenticated;

COMMIT;

-- ================================================================
-- 사후 검증 SQL (별도 실행 권장)
-- ================================================================
-- -- word_level 컬럼 확인
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'user_words' AND column_name = 'word_level';
--
-- -- RPC 목록 확인
-- SELECT proname, pg_get_function_result(oid) AS returns
-- FROM pg_proc
-- WHERE proname IN ('save_quiz_result','get_wordbook_progress','get_level_word_count')
--   AND pronamespace = 'public'::regnamespace
-- ORDER BY proname;
-- ================================================================
