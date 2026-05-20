-- ================================================================
-- Migration: N03-5 v1.5 — LV4 졸업(graduation) 시스템
-- 목적:
--   word_level=5 를 "졸업" 상태로 도입.
--   LV4 정답 시 word_level 4→5 로 승급되며, 이후 일반 테스트에 미출제.
--   단어장 내 모든 단어가 word_level=5 → 복습 모드 자동 전환.
--
-- 변경 내용:
--   1. CHECK 제약 확장 : user_words, user_official_word_progress (1-4 → 1-5)
--   2. save_quiz_result  재정의 : LEAST cap 4 → 5
--   3. get_wordbook_progress 재정의 : graduated_count / graduated_words 추가
--
-- 선행 조건:
--   - 20260519000002_official_word_level.sql 적용 완료
--
-- 적용 방법:
--   공유 Supabase 프로젝트(jiprhynqysjkbrhnstkt)이므로
--   팀원 한 명이 Supabase SQL Editor 에서 이 파일 전체를 붙여넣고 실행.
--   기존 word_level 1~4 데이터는 무변경 (CHECK 범위 확장만 수행).
-- ================================================================

BEGIN;

-- ================================================================
-- 1. CHECK 제약 확장 (1-4 → 1-5)
--    기존 데이터 무변경. 범위만 넓힘.
-- ================================================================

-- user_words
ALTER TABLE public.user_words
  DROP CONSTRAINT IF EXISTS user_words_word_level_chk,
  ADD  CONSTRAINT user_words_word_level_chk CHECK (word_level BETWEEN 1 AND 5);

-- user_official_word_progress
ALTER TABLE public.user_official_word_progress
  DROP CONSTRAINT IF EXISTS uowp_word_level_chk,
  ADD  CONSTRAINT uowp_word_level_chk CHECK (word_level BETWEEN 1 AND 5);


-- ================================================================
-- 2. save_quiz_result 재정의
--    변경: LEAST(word_level + 1, 4) → LEAST(word_level + 1, 5)
--    LV4 정답 → word_level 4→5 (졸업), 이후 일반 테스트 미출제.
-- ================================================================

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

  -- word_level 승급 — user 단어장 (cap: 4→5)
  IF p_level IS NOT NULL
     AND p_correct_word_ids IS NOT NULL
     AND array_length(p_correct_word_ids, 1) > 0
     AND p_wordbook_type = 'user'
  THEN
    FOREACH v_word_id IN ARRAY p_correct_word_ids LOOP
      UPDATE public.user_words
         SET word_level = LEAST(word_level + 1, 5)
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

  -- word_level 승급 — official 단어장 (cap: 4→5)
  IF p_level IS NOT NULL
     AND p_correct_word_ids IS NOT NULL
     AND array_length(p_correct_word_ids, 1) > 0
     AND p_wordbook_type = 'official'
  THEN
    FOREACH v_word_id IN ARRAY p_correct_word_ids LOOP
      INSERT INTO public.user_official_word_progress (user_id, word_id, word_level)
      VALUES (p_user_id, v_word_id, 1)
      ON CONFLICT (user_id, word_id) DO NOTHING;

      UPDATE public.user_official_word_progress
         SET word_level = LEAST(word_level + 1, 5)
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


-- ================================================================
-- 3. get_wordbook_progress 재정의
--    변경:
--      - v_lv4 → lv4 대기(word_level=4) 유지
--      - v_graduated 신규 → word_level=5 카운트
--      - ratio = graduated_count / total (기존: lv4_count / total)
--      - graduated_words 반환 (기존: lv4_words)
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
  v_is_official    boolean;
  v_total          integer;
  v_lv1            integer;
  v_lv2            integer;
  v_lv3            integer;
  v_lv4            integer;
  v_graduated      integer;
  v_graduated_words json;
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
      count(*) FILTER (WHERE COALESCE(uop.word_level, 1) = 4),
      count(*) FILTER (WHERE COALESCE(uop.word_level, 1) = 5)
    INTO v_lv1, v_lv2, v_lv3, v_lv4, v_graduated
    FROM public.official_words ow
    LEFT JOIN public.user_official_word_progress uop
      ON uop.word_id = ow.id AND uop.user_id = p_user_id
    WHERE ow.wordbook_id = p_wordbook_id;

    SELECT COALESCE(
      json_agg(json_build_object('id', ow.id, 'english', ow.english, 'major_meaning', ow.major_meaning)),
      '[]'::json
    ) INTO v_graduated_words
    FROM public.official_words ow
    JOIN public.user_official_word_progress uop
      ON uop.word_id = ow.id AND uop.user_id = p_user_id
    WHERE ow.wordbook_id = p_wordbook_id AND uop.word_level = 5;

  ELSE
    SELECT count(*)                              INTO v_total     FROM public.user_words WHERE wordbook_id = p_wordbook_id;
    SELECT count(*) FILTER (WHERE word_level=1) INTO v_lv1       FROM public.user_words WHERE wordbook_id = p_wordbook_id;
    SELECT count(*) FILTER (WHERE word_level=2) INTO v_lv2       FROM public.user_words WHERE wordbook_id = p_wordbook_id;
    SELECT count(*) FILTER (WHERE word_level=3) INTO v_lv3       FROM public.user_words WHERE wordbook_id = p_wordbook_id;
    SELECT count(*) FILTER (WHERE word_level=4) INTO v_lv4       FROM public.user_words WHERE wordbook_id = p_wordbook_id;
    SELECT count(*) FILTER (WHERE word_level=5) INTO v_graduated FROM public.user_words WHERE wordbook_id = p_wordbook_id;

    SELECT COALESCE(
      json_agg(json_build_object('id', id, 'english', english, 'major_meaning', major_meaning)),
      '[]'::json
    ) INTO v_graduated_words
    FROM public.user_words
    WHERE wordbook_id = p_wordbook_id AND word_level = 5;
  END IF;

  RETURN json_build_object(
    'total',           v_total,
    'lv1_count',       v_lv1,
    'lv2_count',       v_lv2,
    'lv3_count',       v_lv3,
    'lv4_count',       v_lv4,
    'graduated_count', v_graduated,
    'ratio',           CASE WHEN v_total = 0 THEN 0 ELSE round(v_graduated::numeric / v_total, 4) END,
    'graduated_words', v_graduated_words
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_wordbook_progress(uuid, uuid) TO authenticated;

COMMIT;

-- ================================================================
-- 사후 검증 SQL (별도 실행 권장)
-- ================================================================
-- -- CHECK 제약 범위 확인
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conname IN ('user_words_word_level_chk', 'uowp_word_level_chk');
--
-- -- get_wordbook_progress 반환값에 graduated_count 포함 여부 확인
-- SELECT public.get_wordbook_progress('<your-user-id>', '<your-wordbook-id>');
-- ================================================================
