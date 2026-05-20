-- SBI-N04: 커뮤니티 정보 공유 (posts, comments 테이블)
-- Supabase 대시보드 SQL Editor에서 실행

-- posts 테이블
CREATE TABLE IF NOT EXISTS posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  content     text NOT NULL,
  major       text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- comments 테이블 (대댓글 없음 — depth=1)
CREATE TABLE IF NOT EXISTS comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- posts RLS
DROP POLICY IF EXISTS "posts_select" ON posts;
CREATE POLICY "posts_select" ON posts FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "posts_insert" ON posts;
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "posts_update" ON posts;
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "posts_delete" ON posts;
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);

-- comments RLS
DROP POLICY IF EXISTS "comments_select" ON comments;
CREATE POLICY "comments_select" ON comments FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "comments_insert" ON comments;
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "comments_delete" ON comments;
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);
