-- ================================================================
-- Migration: shop purchase RPC (SBI-SH-03)
-- 목적: 상점 시스템 Phase 2 — 아이템 구매를 원자적으로 처리하는 purchase_item RPC
--       및 구매 이력 식별용 bookmark_logs.note 컬럼 추가.
--
-- 보안 모델:
--   - 가격은 RPC 내부에 하드코딩 (constants/character.js 미러링).
--     클라이언트가 보낸 가격을 신뢰하면 0원 구매 공격 가능 → p_item_id 만 받는다.
--   - SECURITY DEFINER + auth.uid() = p_user_id 호출자 검증.
--   - 단일 plpgsql 함수 본문 = 단일 트랜잭션 → UPDATE/INSERT 원자성 보장.
--
-- bookmark_logs.reason CHECK 제약: 없음 (init 마이그레이션 기준 `reason text not null` 만 존재).
-- 따라서 'shop_purchase' 추가에 별도 제약 조정 불필요.
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. bookmark_logs.note 컬럼 추가
-- 구매 이력 식별용. 'shop_purchase' reason 의 경우 item_id 가 저장된다.
-- 다른 reason(attendance, test_reward)은 ref_id 로 식별 가능하므로 NULL.
-- ----------------------------------------------------------------

ALTER TABLE public.bookmark_logs
  ADD COLUMN IF NOT EXISTS note text;

-- ----------------------------------------------------------------
-- 2. purchase_item RPC
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
  v_price        integer;
  v_owned        text[];
  v_bookmark     integer;
  v_new_bookmark integer;
  v_new_owned    text[];
BEGIN
  -- 호출자 검증 (SECURITY DEFINER 필수)
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- 가격 매핑 (constants/character.js 미러링)
  -- 0원 아이템(bedhead, outfit_basic)은 기본 지급이므로 구매 불가 → 아래에서 차단.
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

  -- 원자적 차감 + 보유 추가
  UPDATE public.users
     SET bookmark    = bookmark - v_price,
         owned_items = array_append(owned_items, p_item_id)
   WHERE id = p_user_id
  RETURNING bookmark, owned_items
       INTO v_new_bookmark, v_new_owned;

  -- 구매 이력 기록
  -- reason='shop_purchase', ref_id=NULL, note=item_id (사용자 결정 2026-05-16)
  INSERT INTO public.bookmark_logs (user_id, change_amount, reason, ref_id, note)
  VALUES (p_user_id, -v_price, 'shop_purchase', NULL, p_item_id);

  RETURN jsonb_build_object(
    'new_bookmark', v_new_bookmark,
    'owned_items',  v_new_owned
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.purchase_item(uuid, text) TO authenticated;

COMMIT;

-- ================================================================
-- Audit Checklist (edulex-be.md §10 Step 5)
--  [x] RLS — bookmark_logs.note 컬럼 추가만, 기존 row-level 정책이 자동 커버
--  [x] SERVICE_ROLE_KEY 노출 없음
--  [x] Edge Function 변경 없음 (OPTIONS preflight 해당 없음)
--  [x] Groq 응답 검증 해당 없음
--  [x] bookmark 변경 — RPC 경유 (purchase_item) 원칙 유지
--  [x] verify_jwt 변경 없음
--  [x] SECURITY DEFINER — auth.uid() = p_user_id 호출자 검증 포함
--  [x] GRANT EXECUTE TO authenticated (public 미부여)
--  [x] 가격 하드코딩 — 클라이언트 입력값 미신뢰 (0원 구매 공격 방지)
--  [x] 인덱스: bookmark_logs.note 는 식별용이며 조회 필터 컬럼 아님 → 인덱스 불필요
-- ================================================================
