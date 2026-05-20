-- SBI-N04 미비사항 수정 (2026-05-19)

-- 1. users 테이블에 icon_index 컬럼 추가 (랭킹 아이콘 식별자)
ALTER TABLE users ADD COLUMN IF NOT EXISTS icon_index int DEFAULT 1;

-- 2. users 테이블 RLS 활성화 + 인증 사용자 SELECT 허용
--    게시글·댓글 JOIN 시 다른 유저 닉네임이 '알 수 없음'으로 표시되는 문제 수정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_authenticated" ON users;
CREATE POLICY "users_select_authenticated" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- 본인 레코드만 수정 허용 (icon_index 저장 포함)
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);
