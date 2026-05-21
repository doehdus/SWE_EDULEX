-- get_official_words_for_level RPC에 major_example 필드 추가 (Lv4 빈칸채우기 지원)
CREATE OR REPLACE FUNCTION public.get_official_words_for_level(
  p_user_id     uuid,
  p_wordbook_id uuid,
  p_level       integer
)
RETURNS TABLE(id uuid, english text, major_meaning text, major_example text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF p_level IS NULL THEN
    RETURN QUERY
    SELECT ow.id, ow.english, ow.major_meaning, ow.major_example
    FROM public.official_words ow
    WHERE ow.wordbook_id = p_wordbook_id;
  ELSE
    RETURN QUERY
    SELECT ow.id, ow.english, ow.major_meaning, ow.major_example
    FROM public.official_words ow
    LEFT JOIN public.user_official_word_progress uop
      ON uop.word_id = ow.id AND uop.user_id = p_user_id
    WHERE ow.wordbook_id = p_wordbook_id
      AND COALESCE(uop.word_level, 1) = p_level;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_official_words_for_level(uuid, uuid, integer) TO authenticated;
