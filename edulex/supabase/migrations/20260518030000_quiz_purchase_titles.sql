-- ================================================================
-- Migration: save_quiz_result + purchase_item title integration (SBI-T06)
-- 목적: 칭호 시스템 Phase 2 — 정답·구매 RPC 확장.
--
-- save_quiz_result 변경점:
--   1. 보상 greatest(5, correct*2) → correct * 5 (백로그 G01 명세, 2026-05-17 결정)
--   2. users.bookmark_total_earned += reward
--   3. check_titles_for_user 호출
--   4. 반환 타입 void → jsonb { gained_bookmark, new_bookmark, earned_titles }
--   ※ 단어장 완료 칭호(T05) 는 단어장 숙련도 기능 의존으로 본 마이그레이션 범위 외.
--
-- purchase_item 변경점:
--   1. users.bookmark_total_spent += v_price (누적 통계 갱신)
--   2. check_titles_for_user 호출
--   3. 반환 jsonb 에 earned_titles 추가 (기존 new_bookmark / owned_items 유지)
--
-- save_quiz_result 반환 타입 변경(void→jsonb) → DROP + CREATE.
-- purchase_item 은 이미 jsonb 반환 → CREATE OR REPLACE.
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. save_quiz_result (DROP + CREATE)
-- ----------------------------------------------------------------

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

  -- 결과 저장
  INSERT INTO public.quiz_results(user_id, wordbook_id, wordbook_type, score, total, correct)
  VALUES (p_user_id, p_wordbook_id, p_wordbook_type, p_score, p_total, p_correct)
  RETURNING id INTO v_result_id;

  -- 보상 계산 — 정답 1개당 5개
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

  -- 칭호 체크 — 누적 책갈피·소모·출석 동시 평가
  SELECT count(*) INTO v_attendance_count
    FROM public.attendance
   WHERE user_id = p_user_id;

  v_earned_titles := public.check_titles_for_user(
    p_user_id,
    v_new_total_earned,
    v_total_spent,
    v_attendance_count
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
-- 2. purchase_item (CREATE OR REPLACE)
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
  -- 호출자 검증
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- 가격 매핑 (constants/character.js 미러링)
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

  -- 원자적 차감 + 보유 추가 + 누적 소모 갱신
  UPDATE public.users
     SET bookmark             = bookmark - v_price,
         bookmark_total_spent = bookmark_total_spent + v_price,
         owned_items          = array_append(owned_items, p_item_id)
   WHERE id = p_user_id
  RETURNING bookmark, owned_items, bookmark_total_spent, bookmark_total_earned
       INTO v_new_bookmark, v_new_owned, v_new_total_spent, v_total_earned;

  -- 구매 이력 기록
  INSERT INTO public.bookmark_logs (user_id, change_amount, reason, ref_id, note)
  VALUES (p_user_id, -v_price, 'shop_purchase', NULL, p_item_id);

  -- 칭호 체크 — 누적 책갈피·소모·출석 동시 평가
  SELECT count(*) INTO v_attendance_count
    FROM public.attendance
   WHERE user_id = p_user_id;

  v_earned_titles := public.check_titles_for_user(
    p_user_id,
    v_total_earned,
    v_new_total_spent,
    v_attendance_count
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
-- Audit Checklist (edulex-be.md §10 Step 5)
--  [x] RLS — 두 RPC 모두 SECURITY DEFINER, auth.uid() 검증
--  [x] SERVICE_ROLE_KEY 노출 없음
--  [x] Edge Function 변경 없음
--  [x] Groq 응답 검증 해당 없음
--  [x] bookmark 변경 — RPC 경유 (purchase_item / save_quiz_result) 원칙 유지
--  [x] verify_jwt 변경 없음
--  [x] GRANT EXECUTE TO authenticated
--  [x] 가격 하드코딩 유지 — 클라이언트 입력값 미신뢰
--  [x] 인덱스: 변경 없음
-- ================================================================
