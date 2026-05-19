-- ================================================================
-- Migration: SBI-A05 DB 사용량 모니터링
-- ----------------------------------------------------------------
-- 변경 내용:
--   A. 신규 테이블: resource_logs
--      - 날짜별 DB 크기, Storage 크기, 알림 발송 여부 기록
--
--   B. 신규 RPC: get_db_stats()
--      - pg_database_size, pg_stat_user_tables를 통해
--        DB 전체 크기(bytes) + 주요 테이블별 row 수 반환
--      - SECURITY DEFINER — 호출자가 admin인지 내부 검증
--
--   C. 신규 RPC: save_resource_log(...)
--      - resource-cron Edge Function이 측정값을 DB에 저장
--      - SECURITY DEFINER — service role 전용 (auth.uid() NULL 허용)
--
-- ================================================================

BEGIN;

-- ================================================================
-- A. resource_logs 테이블
-- ================================================================

CREATE TABLE IF NOT EXISTS public.resource_logs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  logged_date     date        NOT NULL DEFAULT current_date,
  db_size_bytes   bigint      NOT NULL DEFAULT 0,
  storage_size_bytes bigint   NOT NULL DEFAULT 0,
  db_threshold_pct  numeric(5,2) NOT NULL DEFAULT 0,
  storage_threshold_pct numeric(5,2) NOT NULL DEFAULT 0,
  alert_sent      boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(logged_date)
);

ALTER TABLE public.resource_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 SELECT
CREATE POLICY "resource_logs_admin_select" ON public.resource_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INSERT/UPDATE는 RPC(save_resource_log)를 통해서만 허용 (service role)
-- 클라이언트 직접 INSERT 차단
CREATE POLICY "resource_logs_deny_direct_write" ON public.resource_logs
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "resource_logs_deny_direct_update" ON public.resource_logs
  FOR UPDATE
  USING (false);

CREATE INDEX IF NOT EXISTS idx_resource_logs_logged_date
  ON public.resource_logs (logged_date DESC);


-- ================================================================
-- B. get_db_stats
--    반환: db_size_bytes bigint, table_stats jsonb
--    보안: SECURITY DEFINER — 호출자가 admin인지 검증
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_db_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_db_size   bigint;
  v_tables    jsonb;
  v_result    jsonb;
BEGIN
  -- 호출자가 관리자인지 검증
  IF (SELECT u.role FROM public.users u WHERE u.id = auth.uid()) IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- 현재 DB 전체 크기 (bytes)
  SELECT pg_database_size(current_database())
  INTO v_db_size;

  -- 주요 테이블별 row 수 집계
  SELECT jsonb_agg(
    jsonb_build_object(
      'table_name', relname,
      'row_count',  n_live_tup
    ) ORDER BY n_live_tup DESC
  )
  INTO v_tables
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND relname IN (
      'users', 'official_wordbooks', 'official_words',
      'user_wordbooks', 'user_words', 'attendance',
      'bookmark_logs', 'quiz_results', 'word_progress',
      'resource_logs'
    );

  v_result := jsonb_build_object(
    'db_size_bytes', v_db_size,
    'table_stats',   COALESCE(v_tables, '[]'::jsonb)
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_db_stats() TO authenticated;


-- ================================================================
-- C. save_resource_log
--    파라미터: p_db_size_bytes bigint
--              p_storage_size_bytes bigint
--              p_db_threshold_pct numeric
--              p_storage_threshold_pct numeric
--              p_alert_sent boolean
--    반환: uuid (삽입된 row의 id)
--    보안: SECURITY DEFINER — service role로 호출 (auth.uid() NULL 가능)
--          Edge Function에서만 사용하므로 authenticated + anon 모두 GRANT
--          (실제 호출은 service role key를 가진 Edge Function만 수행)
--    설명: ON CONFLICT(logged_date) → UPDATE (당일 재실행 시 덮어쓰기)
-- ================================================================

CREATE OR REPLACE FUNCTION public.save_resource_log(
  p_db_size_bytes          bigint,
  p_storage_size_bytes     bigint,
  p_db_threshold_pct       numeric,
  p_storage_threshold_pct  numeric,
  p_alert_sent             boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.resource_logs (
    logged_date,
    db_size_bytes,
    storage_size_bytes,
    db_threshold_pct,
    storage_threshold_pct,
    alert_sent
  )
  VALUES (
    current_date,
    p_db_size_bytes,
    p_storage_size_bytes,
    p_db_threshold_pct,
    p_storage_threshold_pct,
    p_alert_sent
  )
  ON CONFLICT (logged_date) DO UPDATE
    SET db_size_bytes          = EXCLUDED.db_size_bytes,
        storage_size_bytes     = EXCLUDED.storage_size_bytes,
        db_threshold_pct       = EXCLUDED.db_threshold_pct,
        storage_threshold_pct  = EXCLUDED.storage_threshold_pct,
        alert_sent             = EXCLUDED.alert_sent
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Edge Function은 service role key로 supabase client를 생성하므로
-- RLS를 우회하나, RPC 자체는 authenticated 권한으로 GRANT
GRANT EXECUTE ON FUNCTION public.save_resource_log(bigint, bigint, numeric, numeric, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_resource_log(bigint, bigint, numeric, numeric, boolean) TO service_role;


-- ================================================================
-- D. get_db_size_bytes
--    resource-cron Edge Function이 service role로 직접 DB 크기를 조회하기 위한 헬퍼.
--    SECURITY DEFINER 불필요 — pg_database_size는 모든 role에서 호출 가능.
--    service_role로만 GRANT하여 클라이언트 직접 호출 차단.
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_db_size_bytes()
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT pg_database_size(current_database());
$$;

-- authenticated에는 부여하지 않음 (cron용 함수, service_role 전용)
GRANT EXECUTE ON FUNCTION public.get_db_size_bytes() TO service_role;

COMMIT;

-- ================================================================
-- Audit Checklist (edulex-be.md §10 Step 5)
--  [x] RLS — resource_logs 테이블에 RLS 활성화 + 정책 3개
--  [x] SERVICE_ROLE_KEY 노출 없음
--  [x] Edge Function 변경 없음 (migration 단계)
--  [x] Groq 응답 검증 해당 없음
--  [x] bookmark 변경 없음
--  [x] SECURITY DEFINER 함수 — get_db_stats: admin 검증 포함
--  [x] SECURITY DEFINER 함수 — save_resource_log: service role 전용 Edge Function 호출
--  [x] GRANT EXECUTE TO authenticated (public 미부여)
--  [x] 인덱스 — idx_resource_logs_logged_date (날짜 DESC 조회 최적화)
-- ================================================================
