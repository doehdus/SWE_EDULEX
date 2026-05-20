-- ================================================================
-- Migration: Q02 — quiz_book_anim 특수효과 아이템 추가
-- 목적: purchase_item RPC 가격 매핑에 'quiz_book_anim' (9,000 책갈피) 추가.
--       테스트 책 쌓기/무너지기 특수효과 아이템으로 슬롯 없이 owned_items 배열에만 저장.
--
-- 기반: N08 T06 버전 purchase_item (bookmark_total_spent 누적 + check_titles_for_user)
-- 변경: CASE 가격 매핑에 'quiz_book_anim' THEN 9000 추가
-- 신규 테이블/컬럼 없음.
-- ================================================================

BEGIN;

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
  -- 호출자 검증 (SECURITY DEFINER 필수)
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- 가격 매핑 (constants/character.js + EFFECT_ITEMS 미러링)
  -- 0원 아이템(bedhead, outfit_basic)은 기본 지급 → 구매 불가
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
    WHEN 'quiz_book_anim'  THEN 9000  -- Q02: 테스트 책 쌓기/무너지기 특수효과
    ELSE NULL
  END;

  -- 유효성 검증 (순서 중요: 존재하지 않는 아이템 → 이미 보유 → 잔액 부족)
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

  -- 원자적 차감 + 보유 추가 + 총 소비 누적
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
-- Audit Checklist
--  [x] RLS — purchase_item 은 SECURITY DEFINER + auth.uid() 검증
--  [x] SERVICE_ROLE_KEY 노출 없음
--  [x] 신규 테이블/컬럼 없음
--  [x] bookmark 변경 — RPC 경유 원칙 유지
--  [x] quiz_book_anim 은 슬롯 없음 (owned_items 배열에만 저장, equipped_items 무관)
-- ================================================================
