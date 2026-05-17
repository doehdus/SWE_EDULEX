-- ================================================================
-- Migration: check_attendance + title award (SBI-T04)
-- 목적: 칭호 시스템 Phase 2 — check_attendance 확장.
--
-- 변경점:
--   1. 보상 10 → 100 (백로그 G01 명세 적용, 2026-05-17 사용자 결정)
--   2. users.bookmark_total_earned += 100 (누적 통계 갱신)
--   3. 누적 출석 일수(COUNT) 계산 후 check_titles_for_user 호출
--   4. 반환 타입 void → jsonb
--      { gained_bookmark, new_bookmark, attendance_count,
--        earned_titles: text[], already_checked: boolean }
--   5. 동일 날짜 재호출 시 unique 위반으로 예외가 나던 동작을
--      ON CONFLICT DO NOTHING 으로 변경 → already_checked=true 로 응답
--
-- 반환 타입 변경 때문에 CREATE OR REPLACE 만으로는 불가 → DROP + CREATE.
-- ================================================================

BEGIN;

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
  -- 호출자 검증
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- ── 1. 출석 기록 시도 (오늘 이미 체크된 경우 스킵) ─────────
  INSERT INTO public.attendance(user_id, date)
  VALUES (p_user_id, current_date)
  ON CONFLICT (user_id, date) DO NOTHING
  RETURNING id INTO v_attendance_id;

  IF v_attendance_id IS NULL THEN
    v_already_checked := true;
  END IF;

  -- ── 2. 신규 출석인 경우만 책갈피 지급 + 통계 갱신 ──────────
  IF NOT v_already_checked THEN
    v_gained := 100;

    UPDATE public.users
       SET bookmark               = bookmark + v_gained,
           bookmark_total_earned  = bookmark_total_earned + v_gained
     WHERE id = p_user_id
    RETURNING bookmark, bookmark_total_earned, bookmark_total_spent
         INTO v_new_bookmark, v_new_total_earned, v_total_spent;

    INSERT INTO public.bookmark_logs(user_id, change_amount, reason, ref_id)
    VALUES (p_user_id, v_gained, 'attendance', v_attendance_id);
  ELSE
    -- 이미 체크한 경우엔 통계만 조회
    SELECT bookmark, bookmark_total_earned, bookmark_total_spent
      INTO v_new_bookmark, v_new_total_earned, v_total_spent
      FROM public.users
     WHERE id = p_user_id;
  END IF;

  -- ── 3. 누적 출석 일수 (이미 체크한 경우에도 현재 카운트 반환) ──
  SELECT count(*) INTO v_attendance_count
    FROM public.attendance
   WHERE user_id = p_user_id;

  -- ── 4. 칭호 체크 (출석 / 누적 책갈피 모두 평가) ──────────────
  v_earned_titles := public.check_titles_for_user(
    p_user_id,
    v_new_total_earned,
    v_total_spent,
    v_attendance_count
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

COMMIT;

-- ================================================================
-- Audit Checklist (edulex-be.md §10 Step 5)
--  [x] RLS — 본 RPC 가 SECURITY DEFINER 로 user_titles INSERT 권한 부여
--  [x] SERVICE_ROLE_KEY 노출 없음
--  [x] Edge Function 변경 없음
--  [x] Groq 응답 검증 해당 없음
--  [x] bookmark 변경 — RPC 경유 원칙 유지 (직접 UPDATE 추가 없음)
--  [x] verify_jwt 변경 없음
--  [x] SECURITY DEFINER + auth.uid() 검증
--  [x] GRANT EXECUTE TO authenticated
--  [x] 멱등성 — ON CONFLICT (user_id, date) DO NOTHING + already_checked 응답
-- ================================================================
