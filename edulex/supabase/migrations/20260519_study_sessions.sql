CREATE TABLE study_sessions (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('quiz', 'wordbook')),
  started_at   timestamptz DEFAULT now() NOT NULL,
  ended_at     timestamptz
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION get_daily_study_time(
  p_user_id uuid,
  p_days    int DEFAULT 7
)
RETURNS TABLE (study_date date, quiz_seconds bigint, wordbook_seconds bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    DATE(started_at AT TIME ZONE 'Asia/Seoul') AS study_date,
    SUM(CASE WHEN session_type = 'quiz'
        THEN EXTRACT(EPOCH FROM (ended_at - started_at))::bigint ELSE 0 END),
    SUM(CASE WHEN session_type = 'wordbook'
        THEN EXTRACT(EPOCH FROM (ended_at - started_at))::bigint ELSE 0 END)
  FROM study_sessions
  WHERE user_id = p_user_id
    AND ended_at IS NOT NULL
    AND started_at >= now() - make_interval(days => p_days)
  GROUP BY study_date
  ORDER BY study_date;
$$;
