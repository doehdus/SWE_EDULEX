 SBI-N03/FE
// ── 레벨 정의
const LEVELS = [
  { lv: 1, label: 'Lv 1', desc: '뜻 → 영어 객관식', locked: false },
  { lv: 2, label: 'Lv 2', desc: '영어 → 뜻 객관식', locked: true },
  { lv: 3, label: 'Lv 3', desc: '뜻 → 영어 주관식', locked: true },
  { lv: 4, label: 'Lv 4', desc: '영어 예문 빈칸채우기', locked: true },
]

// ── 단어장 선택 화면 (Step1 레벨 선택 + Step2 단어장 선택 + 시작 버튼)
function SelectView({ wordbooks, selectedWb, onSelect, onStart }) {
  const [activeLevel, setActiveLevel] = useState(1)
  const [wbTab, setWbTab] = useState('official')
  const officialBooks = wordbooks.filter(w => w.type === 'official')
  const userBooks = wordbooks.filter(w => w.type === 'user')
  const visibleBooks = wbTab === 'official' ? officialBooks : userBooks
  // ... 레벨 카드, 단어장 탭/목록, 시작 버튼 UI
}

// ── 퀴즈 화면 (진행 바, 문제 카드, 4지선다 선택지)
function QuizView({ question, current, total, chosen, onChoose }) {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6" style={{ background: LIB.parchment }}>
      {/* 분절 진행 바 */}
      <div className="flex gap-1 flex-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex-1 h-2 rounded-sm"
            style={{ background: i < current ? LIB.gold : i === current ? LIB.woodLight : LIB.parchmentDark }} />
        ))}
      </div>
      {/* 문제 카드 */}
      <p className="text-2xl font-black leading-snug" style={{ color: LIB.ink }}>{question.question}</p>
      {/* 선택지 */}
      {question.choices.map((choice, i) => (
        <button key={i} onClick={() => onChoose(choice)}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-sm font-semibold transition-all">
          {choice}
        </button>
      ))}
    </div>
  )
}

// ── 결과 화면 (점수, 정답 수, 책갈피 보상 지급 메시지)
function ResultView({ answers, total, saving, onRetry }) {
  const correctCount = answers.filter(a => a.correct).length
  const score = Math.round((correctCount / total) * 100)
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6" style={{ background: LIB.parchment }}>
      <p className="text-5xl font-black" style={{ color: LIB.gold }}>{score}</p>
      <p>{total}문제 중 {correctCount}개 정답</p>
      <div>{saving ? '결과 저장 중...' : '책갈피 보상 지급 완료!'}</div>
      <button onClick={onRetry}>다시 테스트</button>
    </div>
  )
}

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
