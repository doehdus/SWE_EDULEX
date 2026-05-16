-- ================================================================
-- Migration: fix users.bookmark column — NULL backfill + constraints
--
-- 배경:
--   2026-05-16 진단 결과, users.bookmark 컬럼이 NULL 인 행이 존재하여
--   check_attendance / save_quiz_result RPC 의 UPDATE bookmark = bookmark + N
--   연산이 NULL + N = NULL 로 무의미하게 끝나는 문제가 확인됨.
--   원본 init.sql 의 default 0 가 어느 시점부터 누락 또는 행에 미적용된 것으로 추정.
--
-- 처리:
--   1. NULL bookmark → 0 으로 백필
--   2. DEFAULT 0 + NOT NULL 제약 추가
--   3. CHECK (bookmark >= 0) 제약 추가 — 음수 진입 방어 (동시 구매 음수 방지)
--
-- 멱등성: ALTER 는 PostgreSQL 이 동일 제약이 있을 시 무시하거나 에러를 내지만,
--   본 마이그레이션은 일회성 정정이므로 후속 실행 시 CHECK 중복 에러가 날 수 있음.
--   이를 방지하기 위해 CHECK 추가 전 IF NOT EXISTS 가드 사용.
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. NULL 백필
-- ----------------------------------------------------------------
UPDATE public.users
SET bookmark = 0
WHERE bookmark IS NULL;

-- ----------------------------------------------------------------
-- 2. DEFAULT 0 + NOT NULL 제약
-- ----------------------------------------------------------------
ALTER TABLE public.users
  ALTER COLUMN bookmark SET DEFAULT 0;

ALTER TABLE public.users
  ALTER COLUMN bookmark SET NOT NULL;

-- ----------------------------------------------------------------
-- 3. CHECK (bookmark >= 0) — 음수 진입 방어
-- ----------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_bookmark_nonneg_chk'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_bookmark_nonneg_chk
      CHECK (bookmark >= 0);
  END IF;
END
$$;

COMMIT;

-- ================================================================
-- 사후 검증 SQL:
--
--   SELECT count(*) FROM users WHERE bookmark IS NULL;
--   -- 기대: 0
--
--   SELECT column_default, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='users' AND column_name='bookmark';
--   -- 기대: column_default='0', is_nullable='NO'
--
--   SELECT conname FROM pg_constraint
--   WHERE conrelid='public.users'::regclass AND contype='c';
--   -- 기대: users_bookmark_nonneg_chk 포함
-- ================================================================
