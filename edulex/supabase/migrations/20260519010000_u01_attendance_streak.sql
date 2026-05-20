-- ================================================================
-- Migration: SBI-U01 출석 스트릭 조회 RPC
-- ----------------------------------------------------------------
-- 신규 RPC:
--   1. get_annual_attendance(p_user_id uuid)
--        → TABLE(date date, attended boolean)
--        오늘 기준 52주(364일) 전부터 오늘까지 날짜별 출석 여부 반환.
--
--   2. get_streak_count(p_user_id uuid)
--        → integer
--        오늘을 기준으로 연속된 출석 일수 계산.
--        오늘 출석 기록이 있으면 오늘 포함, 없으면 어제부터 역순으로 산정.
--
-- 참고:
--   - check_attendance RPC 는 shop,title.sql 에서 이미 +100 보상으로 재정의됨.
--     본 마이그레이션은 check_attendance 를 수정하지 않는다.
--   - 두 RPC 모두 SECURITY DEFINER + auth.uid() 호출자 검증.
--   - GRANT EXECUTE TO authenticated (public 미부여).
-- ================================================================

BEGIN;

-- ================================================================
-- 1. get_annual_attendance
--    파라미터 : p_user_id uuid
--    반환     : TABLE(date date, attended boolean)
--    범위     : current_date - 363 days ~ current_date (364일 = 52주)
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_annual_attendance(
  p_user_id uuid
)
RETURNS TABLE(date date, attended boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 호출자 검증 (SECURITY DEFINER 필수)
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    gs.day::date                                          AS date,
    EXISTS (
      SELECT 1
        FROM public.attendance a
       WHERE a.user_id = p_user_id
         AND a.date    = gs.day::date
    )                                                     AS attended
  FROM generate_series(
    current_date - INTERVAL '363 days',
    current_date,
    INTERVAL '1 day'
  ) AS gs(day)
  ORDER BY gs.day;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_annual_attendance(uuid) TO authenticated;


-- ================================================================
-- 2. get_streak_count
--    파라미터 : p_user_id uuid
--    반환     : integer  (연속 출석 일수)
--
--    알고리즘:
--      - 오늘 출석 기록이 있으면 오늘부터 역순으로, 없으면 어제부터 역순으로
--        연속된 날짜를 카운트한다.
--      - lag() 를 써서 날짜 간격이 1일 초과하는 시점을 단절점으로 판단.
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_streak_count(
  p_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date  date;
  v_streak      integer := 0;
  v_prev_date   date;
  v_cur_date    date;
  rec           record;
BEGIN
  -- 호출자 검증
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- 오늘 출석 여부에 따라 카운트 시작 기준일 결정
  IF EXISTS (
    SELECT 1 FROM public.attendance
     WHERE user_id = p_user_id AND date = current_date
  ) THEN
    v_start_date := current_date;
  ELSE
    v_start_date := current_date - INTERVAL '1 day';
  END IF;

  -- 기준일까지의 출석 기록을 내림차순으로 순회하며 연속 여부 확인
  -- 기준일에 출석 기록이 없으면 streak = 0
  v_prev_date := v_start_date + INTERVAL '1 day'; -- sentinel: 루프 첫 회 비교용

  FOR rec IN
    SELECT a.date
      FROM public.attendance a
     WHERE a.user_id = p_user_id
       AND a.date   <= v_start_date
     ORDER BY a.date DESC
  LOOP
    v_cur_date := rec.date;

    -- 이전(더 최근) 날짜와 정확히 1일 차이가 나야 연속
    IF v_prev_date - v_cur_date = 1 THEN
      v_streak    := v_streak + 1;
      v_prev_date := v_cur_date;
    ELSE
      -- 단절 — 루프 종료
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_streak_count(uuid) TO authenticated;

COMMIT;

-- ================================================================
-- Audit Checklist (edulex-be.md §10 Step 5)
--  [x] RLS — attendance 테이블은 init.sql 에서 이미 RLS 활성화 및
--            attendance_all 정책 설정 완료. 신규 테이블 없음.
--  [x] SERVICE_ROLE_KEY 노출 없음 (마이그레이션 스크립트만)
--  [x] Edge Function 변경 없음 (OPTIONS preflight 해당 없음)
--  [x] Groq 응답 검증 해당 없음
--  [x] bookmark 변경 없음 — check_attendance 는 기존 RPC 그대로 사용
--  [x] verify_jwt 변경 없음
--  [x] SECURITY DEFINER 함수 — 두 RPC 모두 auth.uid() = p_user_id 호출자 검증 포함
--  [x] GRANT EXECUTE TO authenticated (public 미부여)
--  [x] 인덱스 — attendance(user_id, date) 는 UNIQUE 제약으로 이미 인덱스 존재.
--              추가 인덱스 불필요.
-- ================================================================
