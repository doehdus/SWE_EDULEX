-- ================================================================
-- Migration: shop schema (SBI-SH-02)
-- 목적: 상점 시스템 Phase 1 — users 테이블에 캐릭터 보유/장착 아이템 컬럼 추가
-- 범위: 보유/장착 상태 저장만 담당. 카탈로그 정의는 클라이언트 상수
--       (constants/character.js)로 관리. 구매 RPC(purchase_item)는 Phase 2.
--
-- RLS 검증 결과: 기존 users RLS 정책은 row-level 조건만 사용 → 새 컬럼 자동 커버.
--   - users_select : USING (auth.uid() = id)        -- 컬럼 화이트리스트 아님
--   - users_update : USING (auth.uid() = id)        -- 컬럼 화이트리스트 아님
--   따라서 owned_items / equipped_items 에 대한 별도 정책 추가 불필요.
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. 컬럼 추가
-- ----------------------------------------------------------------

-- 보유 아이템 목록 (캐릭터 자산 ID 배열)
-- 기본 보유: 헤어 'bedhead', 의상 'outfit_basic'
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS owned_items text[] NOT NULL
    DEFAULT ARRAY['bedhead', 'outfit_basic'];

-- 슬롯별 장착 아이템 (hair/outfit 은 필수, hat/bag/wings 는 선택)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS equipped_items jsonb NOT NULL
    DEFAULT '{"hair":"bedhead","outfit":"outfit_basic","hat":null,"bag":null,"wings":null}'::jsonb;

-- ----------------------------------------------------------------
-- 2. 기존 레코드 백필
-- ALTER ... ADD COLUMN ... DEFAULT 는 기존 행에도 DEFAULT 적용되지만,
-- 이전 마이그레이션이 부분적으로 적용된 환경을 대비해 명시적으로 한 번 더 백필.
-- ----------------------------------------------------------------

UPDATE public.users
SET owned_items = ARRAY['bedhead', 'outfit_basic']
WHERE owned_items IS NULL
   OR array_length(owned_items, 1) IS NULL;

UPDATE public.users
SET equipped_items = '{"hair":"bedhead","outfit":"outfit_basic","hat":null,"bag":null,"wings":null}'::jsonb
WHERE equipped_items IS NULL
   OR equipped_items->>'hair' IS NULL
   OR equipped_items->>'outfit' IS NULL;

-- ----------------------------------------------------------------
-- 3. 무결성 제약
-- 필수 슬롯(hair, outfit)이 NULL 인 상태로 저장되는 것을 차단한다.
-- jsonb 구조 자체는 자유 형식이지만, 핵심 슬롯 누락은 캐릭터 렌더 실패로 이어지므로
-- 단순 CHECK 제약으로 1차 방어한다. (장착 아이템이 owned_items 에 포함되는지 등의
-- 비즈니스 무결성은 Phase 2 의 purchase_item / equip_item RPC 에서 검증)
-- ----------------------------------------------------------------

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_equipped_items_required_slots_chk;

ALTER TABLE public.users
  ADD CONSTRAINT users_equipped_items_required_slots_chk
  CHECK (
    equipped_items ? 'hair'
    AND equipped_items ? 'outfit'
    AND equipped_items->>'hair' IS NOT NULL
    AND equipped_items->>'outfit' IS NOT NULL
  );

COMMIT;

-- ================================================================
-- Audit Checklist (edulex-be.md §10 Step 5)
--  [x] RLS — public.users 는 이미 RLS 활성화 상태이며 row-level 정책이 새 컬럼 자동 커버
--  [x] SERVICE_ROLE_KEY 노출 없음 (마이그레이션 스크립트만 수정)
--  [x] Edge Function 변경 없음 (OPTIONS preflight 해당 없음)
--  [x] Groq 응답 검증 해당 없음
--  [x] bookmark 변경 없음 (RPC 경유 원칙 유지)
--  [x] verify_jwt 변경 없음
--  [x] 인덱스: 단일 사용자 행 조회용 컬럼이므로 별도 인덱스 불필요 — 추가하지 않음
-- ================================================================
