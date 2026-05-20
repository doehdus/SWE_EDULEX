-- SBI-UI02: 컴퓨터과학 핵심 어휘 단어장의 'test' 항목 삭제
-- 해당 단어는 테스트 데이터로 삽입된 항목으로, 학습 콘텐츠에서 제거
DELETE FROM public.official_words
WHERE english = 'test'
  AND wordbook_id = (
    SELECT id FROM public.official_wordbooks
    WHERE title = '컴퓨터과학 핵심 어휘'
    LIMIT 1
  );
