function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestions(allWords) {
  const pool = shuffle(allWords).slice(0, Math.min(10, allWords.length))
  return pool.map(word => {
    const wrongs = shuffle(allWords.filter(w => w.id !== word.id)).slice(0, 3).map(w => w.english)
    const choices = shuffle([word.english, ...wrongs])
    return { id: word.id, question: word.major_meaning, answer: word.english, choices }
  })
}

export default function QuizPage() {
  const { user } = useAuth()

  // 공식/나만의 단어장 목록 조회
  const fetchWordbooks = async () => {
    const [{ data: official }, { data: mine }] = await Promise.all([
      supabase.from('official_wordbooks').select('id, title, major').order('created_at'),
      supabase.from('user_wordbooks').select('id, title').eq('user_id', user.id),
    ])
    setWordbooks([
      ...(official ?? []).map(w => ({ ...w, type: 'official' })),
      ...(mine ?? []).map(w => ({ ...w, type: 'user' })),
    ])
  }

  // save_quiz_result RPC 호출 → quiz_results 저장 + 책갈피 보상 트랜잭션
  const finishQuiz = async (finalAnswers) => {
    setSaving(true)
    setAnswers(finalAnswers)
    const correctCount = finalAnswers.filter(a => a.correct).length
    const score = Math.round((correctCount / questions.length) * 100)

    await supabase.rpc('save_quiz_result', {
      p_user_id:       user.id,
      p_wordbook_id:   selectedWb.id,
      p_wordbook_type: selectedWb.type,
      p_score:         score,
      p_total:         questions.length,
      p_correct:       correctCount,
    })

    setSaving(false)
    setStep('result')
  }
}
