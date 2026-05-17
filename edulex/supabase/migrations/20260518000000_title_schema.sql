-- ================================================================
-- Migration: title schema (SBI-T02)
-- 목적: 칭호 시스템 Phase 1 — user_titles 테이블 + 누적 통계 컬럼.
-- 범위:
--   1. user_titles 테이블 (PK: user_id + title_key) + 인덱스
--   2. users 테이블에 bookmark_total_earned / bookmark_total_spent 컬럼 추가
--      (denormalized — RPC 내부 += 갱신, bookmark_logs SUM 회피)
--   3. RLS 정책 — SELECT 만 허용, INSERT 는 RPC SECURITY DEFINER 경유 전용
--
-- 정책 결정 (2026-05-17):
--   - 기존 유저 backfill 미수행. 현재 유저는 테스트 인원 한정이므로
--     이벤트 발생 시점부터 누적 시작.
--   - users.bookmark 와 bookmark_total_earned/spent 의 무결성은
--     RPC 가 보증 (CHECK 제약 미추가 — 트리거 의존 부담 회피).
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. user_titles 테이블
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_titles (
  user_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title_key  text        NOT NULL,
  earned_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, title_key)
);

-- "최근 획득한 N개" 조회용 보조 인덱스
CREATE INDEX IF NOT EXISTS idx_user_titles_user_earned
  ON public.user_titles (user_id, earned_at DESC);

COMMENT ON TABLE public.user_titles IS
  '유저별 보유 칭호. title_key 는 클라이언트 constants/titles.js 의 키와 동일.';
COMMENT ON COLUMN public.user_titles.title_key IS
  '칭호 식별자 (text). 카탈로그는 클라이언트 상수로 관리.';

-- ----------------------------------------------------------------
-- 2. users 테이블 — 누적 통계 컬럼 추가
-- ----------------------------------------------------------------

-- 누적 획득 책갈피 (출석·정답 등으로 받은 총합)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bookmark_total_earned int NOT NULL DEFAULT 0;

-- 누적 소모 책갈피 (상점 구매로 사용한 총합)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bookmark_total_spent int NOT NULL DEFAULT 0;

-- 음수 진입 방어 (RPC 외 경로에서 직접 UPDATE 차단)
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

-- ----------------------------------------------------------------
-- 3. RLS — user_titles
-- ----------------------------------------------------------------
-- SELECT: 본인 행만 조회 가능
-- INSERT/UPDATE/DELETE: 명시적 정책 미부여 →
--   RLS 가 활성화된 상태에서 정책 없는 명령은 차단됨.
--   user_titles 의 INSERT 는 SECURITY DEFINER RPC (check_titles_for_user
--   — T03) 경유로만 수행.

ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_titles_select ON public.user_titles;
CREATE POLICY user_titles_select
  ON public.user_titles
  FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON public.user_titles TO authenticated;

-- ----------------------------------------------------------------
-- 4. 검증 SQL (수동 실행)
-- ----------------------------------------------------------------
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='users'
--   AND column_name IN ('bookmark_total_earned', 'bookmark_total_spent');
-- 기대: 두 컬럼 모두 int4, default 0, NOT NULL
--
-- SELECT conname FROM pg_constraint
-- WHERE conrelid='public.users'::regclass AND contype='c'
--   AND conname LIKE 'users_bookmark_total_%_nonneg_chk';
-- 기대: 2개 CHECK 제약 존재
--
-- SELECT polname, cmd FROM pg_policies
-- WHERE schemaname='public' AND tablename='user_titles';
-- 기대: user_titles_select / SELECT
--
-- -- 클라이언트 직접 INSERT 차단 검증 (anon JWT 로):
-- INSERT INTO user_titles (user_id, title_key) VALUES (auth.uid(), 'novice_scholar');
-- 기대: ERROR — RLS 정책 위반

COMMIT;

-- ================================================================
-- Audit Checklist (edulex-be.md §10 Step 5)
--  [x] RLS — user_titles 활성화 + SELECT 정책만, INSERT 는 RPC 전용
--  [x] SERVICE_ROLE_KEY 노출 없음 (마이그레이션 파일만)
--  [x] Edge Function 변경 없음
--  [x] Groq 응답 검증 해당 없음
--  [x] bookmark 자체는 변경 없음 — 누적 통계 컬럼 추가만 (RPC 경유 원칙 유지)
--  [x] verify_jwt 변경 없음
--  [x] 인덱스: user_titles (user_id, earned_at DESC) — 최근 획득 조회용
-- ================================================================
