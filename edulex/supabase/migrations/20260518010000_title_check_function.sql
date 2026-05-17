-- ================================================================
-- Migration: title check function (SBI-T03)
-- 목적: 칭호 시스템 Phase 2 — 누적 통계를 받아 충족된 미보유 칭호를
--       멱등하게 INSERT 하는 단일 plpgsql 함수.
--
-- 호출 위치: check_attendance / save_quiz_result / purchase_item RPC 내부.
--            (T04, T06 마이그레이션에서 각 RPC 트랜잭션 종료 직전 호출)
--
-- 멱등성: ON CONFLICT (user_id, title_key) DO NOTHING 으로 보장.
-- 반환:   신규 INSERT 된 title_key 배열 (이미 보유 중인 칭호는 제외).
--
-- 이중 소스 주의:
--   임계치 매핑은 본 함수 plpgsql 상수로 하드코딩. constants/titles.js 의
--   TITLES[*].threshold 와 동기화 유지 필요. 변경 시 두 곳 모두 갱신.
--
-- 단어장 완료 칭호 (SBI-T05) 는 단어장 숙련도 기능 의존으로 본 함수에서 제외.
-- 활성화 시 시그니처에 p_wordbook_complete_count int 추가 + 카테고리 분기 추가.
-- ================================================================

BEGIN;

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
  -- ── 누적 책갈피 (4종) ────────────────────────────────────────
  IF p_bookmark_earned >= 3000  THEN v_candidates := array_append(v_candidates, 'bookmark_collector'); END IF;
  IF p_bookmark_earned >= 10000 THEN v_candidates := array_append(v_candidates, 'bookmark_hunter');    END IF;
  IF p_bookmark_earned >= 27000 THEN v_candidates := array_append(v_candidates, 'collection_master');  END IF;
  IF p_bookmark_earned >= 54000 THEN v_candidates := array_append(v_candidates, 'collection_king');    END IF;

  -- ── 누적 소모 (4종) ─────────────────────────────────────────
  IF p_bookmark_spent >= 5000   THEN v_candidates := array_append(v_candidates, 'investor');           END IF;
  IF p_bookmark_spent >= 10000  THEN v_candidates := array_append(v_candidates, 'wise_spender');       END IF;
  IF p_bookmark_spent >= 20000  THEN v_candidates := array_append(v_candidates, 'impulse_buyer');      END IF;
  IF p_bookmark_spent >= 40000  THEN v_candidates := array_append(v_candidates, 'white_whale');        END IF;

  -- ── 누적 출석 일수 (6종) ─────────────────────────────────────
  IF p_attendance_count >= 10   THEN v_candidates := array_append(v_candidates, 'novice_scholar');     END IF;
  IF p_attendance_count >= 30   THEN v_candidates := array_append(v_candidates, 'diligent_disciple');  END IF;
  IF p_attendance_count >= 50   THEN v_candidates := array_append(v_candidates, 'deep_scholar');       END IF;
  IF p_attendance_count >= 100  THEN v_candidates := array_append(v_candidates, 'wisdom_sage');        END IF;
  IF p_attendance_count >= 200  THEN v_candidates := array_append(v_candidates, 'honored_advisor');    END IF;
  IF p_attendance_count >= 365  THEN v_candidates := array_append(v_candidates, 'truth_guardian');     END IF;

  -- 후보가 없으면 빈 배열 즉시 반환 (INSERT 스킵)
  IF array_length(v_candidates, 1) IS NULL THEN
    RETURN ARRAY[]::text[];
  END IF;

  -- 신규 INSERT — 이미 보유 중인 키는 ON CONFLICT 로 스킵, 새로 들어간 키만 수집
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

-- 본 함수는 RPC 내부 호출 전용 — authenticated 에 EXECUTE 미부여.
-- SECURITY DEFINER 이므로 호출 RPC 가 권한 가짐.
REVOKE EXECUTE ON FUNCTION public.check_titles_for_user(uuid, integer, integer, integer) FROM PUBLIC;

COMMIT;

-- ================================================================
-- Audit Checklist (edulex-be.md §10 Step 5)
--  [x] RLS — user_titles INSERT 는 SECURITY DEFINER 권한으로만 수행
--  [x] SERVICE_ROLE_KEY 노출 없음
--  [x] Edge Function 변경 없음
--  [x] Groq 응답 검증 해당 없음
--  [x] bookmark 변경 없음 (본 함수는 user_titles INSERT 만)
--  [x] verify_jwt 변경 없음
--  [x] GRANT EXECUTE 미부여 + REVOKE FROM PUBLIC — RPC 내부 호출 전용
--  [x] 인덱스: user_titles 의 PK (user_id, title_key) 가 ON CONFLICT 처리에 사용됨
-- ================================================================
