-- ================================================================
-- Title System — Phase 1 + Phase 2 통합 번들 (단일 적용용)
-- ----------------------------------------------------------------
-- 합쳐진 마이그레이션:
--   1. 20260518000000_title_schema.sql               (T02 — 스키마/RLS)
--   2. 20260518010000_title_check_function.sql       (T03 — 칭호 체크 함수)
--   3. 20260518020000_check_attendance_titles.sql    (T04 — check_attendance)
--   4. 20260518030000_quiz_purchase_titles.sql       (T06 — save_quiz_result + purchase_item)
--
-- 사용법:
--   - Supabase SQL Editor 에 본 파일 전체를 붙여넣고 Run.
--   - 단일 트랜잭션이므로 어느 한 단계라도 실패하면 전체 롤백.
--   - 멱등 — IF NOT EXISTS / DROP IF EXISTS / ON CONFLICT 등으로 재적용 안전.
--
-- 적용 전 선행 조건:
--   - 4번 백로그(상점)의 마이그레이션 3개가 이미 적용되어 있어야 함:
--       20260516000000_shop_schema.sql
--       20260516010000_shop_purchase_rpc.sql
--       20260516020000_fix_users_bookmark_constraints.sql
--   - users / attendance / bookmark_logs / quiz_results 테이블이 init.sql 기준으로 존재.
--
-- 정책 결정 (2026-05-17):
--   - 기존 유저 backfill 없음. 현재 유저는 테스트 인원 한정이므로 적용 시점부터 누적.
--   - 출석 보상: 10 → 100. 정답 보상: greatest(5, c*2) → c*5.
--   - 출석 칭호 기준: 누적 출석 일수 (COUNT FROM attendance).
-- ================================================================

BEGIN;

-- ================================================================
-- ▣ [1/4] 스키마 (SBI-T02)
--   - user_titles 테이블 + 인덱스
--   - users.bookmark_total_earned / bookmark_total_spent 컬럼
--   - RLS: user_titles SELECT 정책 (INSERT 는 RPC SECURITY DEFINER 전용)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.user_titles (
  user_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title_key  text        NOT NULL,
  earned_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, title_key)
);

CREATE INDEX IF NOT EXISTS idx_user_titles_user_earned
  ON public.user_titles (user_id, earned_at DESC);

COMMENT ON TABLE public.user_titles IS
  '유저별 보유 칭호. title_key 는 클라이언트 constants/titles.js 의 키와 동일.';
COMMENT ON COLUMN public.user_titles.title_key IS
  '칭호 식별자 (text). 카탈로그는 클라이언트 상수로 관리.';

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bookmark_total_earned int NOT NULL DEFAULT 0;
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bookmark_total_spent int NOT NULL DEFAULT 0;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_bookmark_total_earned_nonneg_chk;
ALTER TABLE public.users
  ADD CONSTRAINT users_bookmark_total_earned_nonneg_chk
  CHECK (bookmark_total_earned >= 0);

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_bookmark_total_spent_nonneg_chk;
ALTER TABLE public.users
  ADD CONSTRAINT users_bookmark_total_spent_nonneg_chk
  CHECK (bookmark_total_spent >= 0);

ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_titles_select ON public.user_titles;
CREATE POLICY user_titles_select
  ON public.user_titles
  FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON public.user_titles TO authenticated;


-- ================================================================
-- ▣ [2/4] 칭호 체크 함수 (SBI-T03)
--   - check_titles_for_user(uuid, int, int, int) RETURNS text[]
--   - RPC 내부 호출 전용 (REVOKE EXECUTE FROM PUBLIC)
-- ================================================================

CREATE OR REPLACE FUNCTION public.check_titles_for_user(
  p_user_id              uuid,
  p_bookmark_earned      integer,
  p_bookmark_spent       integer,
  p_attendance_count     integer
)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_candidates text[] := ARRAY[]::text[];
  v_new_keys   text[];
BEGIN
  -- 누적 책갈피 (4종)
  IF p_bookmark_earned >= 3000  THEN v_candidates := array_append(v_candidates, 'bookmark_collector'); END IF;
  IF p_bookmark_earned >= 10000 THEN v_candidates := array_append(v_candidates, 'bookmark_hunter');    END IF;
  IF p_bookmark_earned >= 27000 THEN v_candidates := array_append(v_candidates, 'collection_master');  END IF;
  IF p_bookmark_earned >= 54000 THEN v_candidates := array_append(v_candidates, 'collection_king');    END IF;

  -- 누적 소모 (4종)
  IF p_bookmark_spent >= 5000   THEN v_candidates := array_append(v_candidates, 'investor');           END IF;
  IF p_bookmark_spent >= 10000  THEN v_candidates := array_append(v_candidates, 'wise_spender');       END IF;
  IF p_bookmark_spent >= 20000  THEN v_candidates := array_append(v_candidates, 'impulse_buyer');      END IF;
  IF p_bookmark_spent >= 40000  THEN v_candidates := array_append(v_candidates, 'white_whale');        END IF;

  -- 누적 출석 일수 (6종)
  IF p_attendance_count >= 10   THEN v_candidates := array_append(v_candidates, 'novice_scholar');     END IF;
  IF p_attendance_count >= 30   THEN v_candidates := array_append(v_candidates, 'diligent_disciple');  END IF;
  IF p_attendance_count >= 50   THEN v_candidates := array_append(v_candidates, 'deep_scholar');       END IF;
  IF p_attendance_count >= 100  THEN v_candidates := array_append(v_candidates, 'wisdom_sage');        END IF;
  IF p_attendance_count >= 200  THEN v_candidates := array_append(v_candidates, 'honored_advisor');    END IF;
  IF p_attendance_count >= 365  THEN v_candidates := array_append(v_candidates, 'truth_guardian');     END IF;

  IF array_length(v_candidates, 1) IS NULL THEN
    RETURN ARRAY[]::text[];
  END IF;

  WITH ins AS (
    INSERT INTO public.user_titles (user_id, title_key)
    SELECT p_user_id, unnest(v_candidates)
    ON CONFLICT (user_id, title_key) DO NOTHING
    RETURNING title_key
  )
  SELECT COALESCE(array_agg(title_key), ARRAY[]::text[]) INTO v_new_keys FROM ins;

  RETURN v_new_keys;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_titles_for_user(uuid, integer, integer, integer) FROM PUBLIC;


-- ================================================================
-- ▣ [3/4] check_attendance 재정의 (SBI-T04)
--   - 보상 10 → 100
--   - bookmark_total_earned 누적 + 멱등 처리 (already_checked)
--   - 칭호 체크 + jsonb 반환
--   - 반환 타입 변경(void → jsonb)으로 DROP + CREATE
-- ================================================================

DROP FUNCTION IF EXISTS public.check_attendance(uuid);

CREATE FUNCTION public.check_attendance(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attendance_id    uuid;
  v_already_checked  boolean := false;
  v_gained           integer := 0;
  v_new_bookmark     integer;
  v_new_total_earned integer;
  v_total_spent      integer;
  v_attendance_count integer;
  v_earned_titles    text[] := ARRAY[]::text[];
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  INSERT INTO public.attendance(user_id, date)
  VALUES (p_user_id, current_date)
  ON CONFLICT (user_id, date) DO NOTHING
  RETURNING id INTO v_attendance_id;

  IF v_attendance_id IS NULL THEN
    v_already_checked := true;
  END IF;

  IF NOT v_already_checked THEN
    v_gained := 100;

    UPDATE public.users
       SET bookmark              = bookmark + v_gained,
           bookmark_total_earned = bookmark_total_earned + v_gained
     WHERE id = p_user_id
    RETURNING bookmark, bookmark_total_earned, bookmark_total_spent
         INTO v_new_bookmark, v_new_total_earned, v_total_spent;

    INSERT INTO public.bookmark_logs(user_id, change_amount, reason, ref_id)
    VALUES (p_user_id, v_gained, 'attendance', v_attendance_id);
  ELSE
    SELECT bookmark, bookmark_total_earned, bookmark_total_spent
      INTO v_new_bookmark, v_new_total_earned, v_total_spent
      FROM public.users
     WHERE id = p_user_id;
  END IF;

  SELECT count(*) INTO v_attendance_count
    FROM public.attendance
   WHERE user_id = p_user_id;

  v_earned_titles := public.check_titles_for_user(
    p_user_id, v_new_total_earned, v_total_spent, v_attendance_count
  );

  RETURN jsonb_build_object(
    'gained_bookmark',  v_gained,
    'new_bookmark',     v_new_bookmark,
    'attendance_count', v_attendance_count,
    'earned_titles',    v_earned_titles,
    'already_checked',  v_already_checked
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_attendance(uuid) TO authenticated;


-- ================================================================
-- ▣ [4/4] save_quiz_result + purchase_item 재정의 (SBI-T06)
--   - save_quiz_result: greatest(5,c*2) → c*5, void → jsonb, 칭호 체크
--   - purchase_item: bookmark_total_spent 누적 + 칭호 체크 + earned_titles 추가
-- ================================================================

DROP FUNCTION IF EXISTS public.save_quiz_result(uuid, uuid, text, integer, integer, integer);

CREATE FUNCTION public.save_quiz_result(
  p_user_id       uuid,
  p_wordbook_id   uuid,
  p_wordbook_type text,
  p_score         integer,
  p_total         integer,
  p_correct       integer
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
  v_earned_titles    text[] := ARRAY[]::text[];
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

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
      FROM public.users
     WHERE id = p_user_id;
  END IF;

  SELECT count(*) INTO v_attendance_count
    FROM public.attendance
   WHERE user_id = p_user_id;

  v_earned_titles := public.check_titles_for_user(
    p_user_id, v_new_total_earned, v_total_spent, v_attendance_count
  );

  RETURN jsonb_build_object(
    'gained_bookmark', v_reward,
    'new_bookmark',    v_new_bookmark,
    'earned_titles',   v_earned_titles
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_quiz_result(uuid, uuid, text, integer, integer, integer) TO authenticated;

-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.purchase_item(
  p_user_id uuid,
  p_item_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_price            integer;
  v_owned            text[];
  v_bookmark         integer;
  v_new_bookmark     integer;
  v_new_owned        text[];
  v_new_total_spent  integer;
  v_total_earned     integer;
  v_attendance_count integer;
  v_earned_titles    text[] := ARRAY[]::text[];
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  v_price := CASE p_item_id
    WHEN 'bedhead'         THEN 0
    WHEN 'outfit_basic'    THEN 0
    WHEN 'idol'            THEN 3000
    WHEN 'long'            THEN 3000
    WHEN 'bonnie'          THEN 3000
    WHEN 'crown'           THEN 3000
    WHEN 'backpack'        THEN 3000
    WHEN 'outfit_formal'   THEN 5000
    WHEN 'outfit_fashion2' THEN 5000
    WHEN 'outfit_armor'    THEN 9000
    WHEN 'jetpack'         THEN 9000
    WHEN 'bat_wings'       THEN 9000
    ELSE NULL
  END;

  IF v_price IS NULL OR v_price = 0 THEN
    RAISE EXCEPTION 'invalid_item';
  END IF;

  SELECT owned_items, bookmark
    INTO v_owned, v_bookmark
    FROM public.users
   WHERE id = p_user_id;

  IF p_item_id = ANY(v_owned) THEN
    RAISE EXCEPTION 'already_owned';
  END IF;

  IF v_bookmark < v_price THEN
    RAISE EXCEPTION 'insufficient_bookmark';
  END IF;

  UPDATE public.users
     SET bookmark             = bookmark - v_price,
         bookmark_total_spent = bookmark_total_spent + v_price,
         owned_items          = array_append(owned_items, p_item_id)
   WHERE id = p_user_id
  RETURNING bookmark, owned_items, bookmark_total_spent, bookmark_total_earned
       INTO v_new_bookmark, v_new_owned, v_new_total_spent, v_total_earned;

  INSERT INTO public.bookmark_logs (user_id, change_amount, reason, ref_id, note)
  VALUES (p_user_id, -v_price, 'shop_purchase', NULL, p_item_id);

  SELECT count(*) INTO v_attendance_count
    FROM public.attendance
   WHERE user_id = p_user_id;

  v_earned_titles := public.check_titles_for_user(
    p_user_id, v_total_earned, v_new_total_spent, v_attendance_count
  );

  RETURN jsonb_build_object(
    'new_bookmark',  v_new_bookmark,
    'owned_items',   v_new_owned,
    'earned_titles', v_earned_titles
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.purchase_item(uuid, text) TO authenticated;

COMMIT;

-- ================================================================
-- 사후 검증 SQL (별도 실행 권장)
-- ================================================================
-- -- 함수 시그니처 (4개 행 기대)
-- SELECT proname, pg_get_function_result(oid) AS returns
-- FROM pg_proc
-- WHERE proname IN ('check_titles_for_user','check_attendance','save_quiz_result','purchase_item')
--   AND pronamespace = 'public'::regnamespace
-- ORDER BY proname;
--
-- -- 누적 통계 컬럼
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='users'
--   AND column_name IN ('bookmark_total_earned','bookmark_total_spent');
--
-- -- RLS 정책
-- SELECT policyname, cmd FROM pg_policies
-- WHERE schemaname='public' AND tablename='user_titles';
-- ================================================================
