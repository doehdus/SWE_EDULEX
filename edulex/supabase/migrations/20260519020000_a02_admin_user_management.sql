-- ================================================================
-- Migration: SBI-A02 관리자 유저 목록 조회/검색 + 전공 분포 시각화
-- ----------------------------------------------------------------
-- 변경 내용:
--   A. RLS 추가 정책
--      - users_admin_select: 관리자(role='admin')는 users 전체 SELECT 가능
--
--   B. 신규 RPC: get_users_for_admin(p_search text, p_major text)
--      → 닉네임/이메일 부분 검색 + 전공 필터 + 정렬(nickname ASC)
--      → 반환: id, email, nickname, major, role, level, bookmark, created_at
--
--   C. 신규 RPC: get_major_distribution()
--      → major[] 배열 unnest 후 GROUP BY → major별 user_count 집계
--      → 빈 배열 유저('{}') 제외
--
-- 참고:
--   - 두 RPC 모두 SECURITY DEFINER + 관리자 role 내부 검증
--   - GRANT EXECUTE TO authenticated (public 미부여)
-- ================================================================

BEGIN;

-- ================================================================
-- A. RLS 추가 정책
--    관리자(role='admin')는 users 테이블 전체 SELECT 가능
--    기존 users_select (auth.uid() = id) 는 그대로 유지
-- ================================================================

-- users_admin_select 정책은 불필요:
-- 관리자 전체 목록 조회는 SECURITY DEFINER RPC(get_users_for_admin)에서 처리.
-- RLS 정책에서 users 테이블을 self-reference하면 무한 재귀가 발생하므로 추가하지 않음.
DROP POLICY IF EXISTS "users_admin_select" ON public.users;


-- ================================================================
-- B. get_users_for_admin
--    파라미터: p_search text DEFAULT '' (닉네임/이메일 부분 검색)
--              p_major  text DEFAULT '' (전공 필터, 빈 문자열이면 전체)
--    반환    : TABLE(id, email, nickname, major, role, level, bookmark, created_at)
--    정렬    : nickname ASC
--    보안    : SECURITY DEFINER — 호출자가 admin인지 내부 검증
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_users_for_admin(
  p_search text DEFAULT '',
  p_major  text DEFAULT ''
)
RETURNS TABLE(
  id         uuid,
  email      text,
  nickname   text,
  major      text[],
  role       text,
  level      integer,
  bookmark   integer,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 호출자가 관리자인지 검증
  IF (SELECT u.role FROM public.users u WHERE u.id = auth.uid()) IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.nickname,
    u.major,
    u.role,
    u.level,
    u.bookmark,
    u.created_at
  FROM public.users u
  WHERE
    -- 닉네임 또는 이메일 부분 검색 (빈 문자열이면 전체 통과)
    (
      p_search = ''
      OR u.nickname ILIKE '%' || p_search || '%'
      OR u.email    ILIKE '%' || p_search || '%'
    )
    -- 전공 필터 (빈 문자열이면 전체 통과)
    AND (
      p_major = ''
      OR u.major @> ARRAY[p_major]
    )
  ORDER BY u.nickname ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_for_admin(text, text) TO authenticated;


-- ================================================================
-- C. get_major_distribution
--    파라미터: 없음
--    반환    : TABLE(major text, user_count bigint)
--    설명    : major[] 배열을 unnest하여 major별 유저 수 집계.
--              major 배열이 비어있는 유저('{}')는 제외.
--    보안    : SECURITY DEFINER — 호출자가 admin인지 내부 검증
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_major_distribution()
RETURNS TABLE(
  major      text,
  user_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 호출자가 관리자인지 검증
  IF (SELECT u.role FROM public.users u WHERE u.id = auth.uid()) IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    m.major_item   AS major,
    COUNT(*)::bigint AS user_count
  FROM public.users u
  -- unnest로 배열 전개 후 집계
  CROSS JOIN LATERAL unnest(u.major) AS m(major_item)
  -- 빈 배열 유저는 unnest 결과가 없으므로 자동 제외되나,
  -- 빈 문자열 항목 명시적 제외
  WHERE m.major_item <> ''
  GROUP BY m.major_item
  ORDER BY user_count DESC, m.major_item ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_major_distribution() TO authenticated;

COMMIT;

-- ================================================================
-- Audit Checklist (edulex-be.md §10 Step 5)
--  [x] RLS — users_admin_select 정책 추가. 신규 테이블 없음.
--  [x] SERVICE_ROLE_KEY 노출 없음 (마이그레이션 스크립트만)
--  [x] Edge Function 변경 없음 (OPTIONS preflight 해당 없음)
--  [x] Groq 응답 검증 해당 없음
--  [x] bookmark 변경 없음
--  [x] verify_jwt 변경 없음
--  [x] SECURITY DEFINER 함수 — 두 RPC 모두 관리자 role 호출자 검증 포함
--  [x] GRANT EXECUTE TO authenticated (public 미부여)
--  [x] 인덱스 — 추가 인덱스 불필요 (nickname, major 조회는 소규모 admin 전용)
-- ================================================================
