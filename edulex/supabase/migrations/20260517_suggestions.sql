-- SBI-N07: 건의사항 게시판 (suggestions 테이블)
-- Supabase 대시보드 SQL Editor에서 실행

CREATE TABLE suggestions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content     text NOT NULL,
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- 본인 건의사항만 조회 가능
CREATE POLICY "suggestions_select" ON suggestions
  FOR SELECT USING (auth.uid() = user_id);

-- 작성만 허용 (수정/삭제 정책 없음 → RLS에 의해 불가)
CREATE POLICY "suggestions_insert" ON suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
