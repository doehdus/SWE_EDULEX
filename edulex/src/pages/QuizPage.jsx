import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { COLOR } from '../constants/theme'

// ── 유틸 ──────────────────────────────────────────────────────────

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildQuestions(allWords) {
  const pool = shuffle(allWords).slice(0, Math.min(10, allWords.length))
  return pool.map(word => {
    const wrongs  = shuffle(allWords.filter(w => w.id !== word.id)).slice(0, 3).map(w => w.english)
    const choices = shuffle([word.english, ...wrongs])
    return { id: word.id, question: word.major_meaning, answer: word.english, choices }
  })
}

// ── 단계별 뷰 ─────────────────────────────────────────────────────

function SelectView({ wordbooks, selectedWb, onSelect, onStart }) {
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1a1a2e' }}>테스트</h1>
      <p className="text-sm text-gray-400 mb-6">Lv1 — 뜻을 보고 영어 단어를 고르세요 (4지선다)</p>

      <div className="space-y-2 mb-6">
        {wordbooks.map(wb => (
          <button
            key={wb.id}
            onClick={() => onSelect(wb)}
            className={`w-full text-left px-4 py-3.5 rounded-xl text-sm border transition
              ${selectedWb?.id === wb.id
                ? 'text-white border-transparent'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#7c3aed]'}`}
            style={selectedWb?.id === wb.id ? { backgroundColor: COLOR.purple, borderColor: COLOR.purple } : {}}
          >
            <span className="font-medium">{wb.title}</span>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${selectedWb?.id === wb.id ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {wb.type === 'official' ? '공식' : 'AI 생성'}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onStart}
        disabled={!selectedWb}
        className="w-full text-white font-semibold rounded-xl py-3.5 text-sm transition disabled:opacity-40"
        style={{ backgroundColor: COLOR.purple }}
      >
        테스트 시작
      </button>
    </div>
  )
}

function QuizView({ question, current, total, chosen, onChoose }) {
  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* 진행 바 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${(current / total) * 100}%`, backgroundColor: COLOR.purple }}
          />
        </div>
        <span className="text-xs text-gray-400">{current + 1} / {total}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 text-center">
        <p className="text-xs text-gray-400 mb-2">이 뜻에 해당하는 영어 단어는?</p>
        <p className="text-xl font-bold" style={{ color: '#1a1a2e' }}>{question.question}</p>
      </div>

      <div className="space-y-3">
        {question.choices.map((choice, i) => {
          let cls = 'bg-white border-gray-200 text-gray-700 hover:border-[#7c3aed]'
          if (chosen !== null) {
            if (choice === question.answer) cls = 'bg-green-50 border-green-400 text-green-700'
            else if (choice === chosen)     cls = 'bg-red-50 border-red-400 text-red-600'
            else                            cls = 'bg-white border-gray-100 text-gray-300'
          }
          return (
            <button
              key={i}
              onClick={() => onChoose(choice)}
              className={`w-full text-left px-5 py-4 rounded-xl text-sm border-2 font-medium transition ${cls}`}
            >
              <span className="text-gray-400 mr-2">{i + 1}.</span> {choice}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ResultView({ answers, total, saving, onRetry }) {
  const correctCount = answers.filter(a => a.correct).length
  const score        = Math.round((correctCount / total) * 100)
  const emoji        = score >= 80 ? '🎉' : score >= 50 ? '👍' : '📖'

  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <div className="bg-white rounded-2xl shadow-sm p-10">
        <p className="text-5xl mb-4">{emoji}</p>
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#1a1a2e' }}>{score}점</h2>
        <p className="text-sm text-gray-400 mb-2">{total}문제 중 {correctCount}개 정답</p>
        {saving
          ? <p className="text-xs text-gray-300 mt-4">결과 저장 중...</p>
          : <p className="text-xs text-yellow-600 font-semibold mt-4">⭐ 별가루 보상 지급 완료!</p>
        }
        <button
          onClick={onRetry}
          className="mt-6 text-white font-semibold rounded-xl py-3 px-8 text-sm transition"
          style={{ backgroundColor: COLOR.purple }}
        >
          다시 테스트
        </button>
      </div>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────

export default function QuizPage() {
  const { user } = useAuth()
  const [step, setStep]           = useState('select') // select | quiz | result
  const [wordbooks, setWordbooks] = useState([])
  const [selectedWb, setSelectedWb] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent]     = useState(0)
  const [answers, setAnswers]     = useState([])
  const [chosen, setChosen]       = useState(null)
  const [saving, setSaving]       = useState(false)

  useEffect(() => { fetchWordbooks() }, [user])

  const fetchWordbooks = async () => {
    const [{ data: official }, { data: mine }] = await Promise.all([
      supabase.from('official_wordbooks').select('id, title, major').order('created_at'),
      supabase.from('user_wordbooks').select('id, title').eq('user_id', user.id),
    ])
    setWordbooks([
      ...(official ?? []).map(w => ({ ...w, type: 'official' })),
      ...(mine    ?? []).map(w => ({ ...w, type: 'user' })),
    ])
  }

  const startQuiz = async () => {
    if (!selectedWb) return
    const table = selectedWb.type === 'official' ? 'official_words' : 'user_words'
    const { data: allWords } = await supabase
      .from(table)
      .select('id, english, major_meaning')
      .eq('wordbook_id', selectedWb.id)

    if (!allWords || allWords.length < 4) {
      alert('퀴즈를 위해 단어가 4개 이상 필요합니다.')
      return
    }

    setQuestions(buildQuestions(allWords))
    setAnswers([])
    setCurrent(0)
    setChosen(null)
    setStep('quiz')
  }

  const handleChoose = (choice) => {
    if (chosen !== null) return
    setChosen(choice)
    const isCorrect   = choice === questions[current].answer
    const nextAnswers = [...answers, { chosen: choice, correct: isCorrect }]

    setTimeout(() => {
      setChosen(null)
      if (current + 1 < questions.length) {
        setAnswers(nextAnswers)
        setCurrent(c => c + 1)
      } else {
        finishQuiz(nextAnswers)
      }
    }, 800)
  }

  const finishQuiz = async (finalAnswers) => {
    setSaving(true)
    setAnswers(finalAnswers)
    const correctCount = finalAnswers.filter(a => a.correct).length
    const score        = Math.round((correctCount / questions.length) * 100)

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

  if (step === 'select') {
    return (
      <SelectView
        wordbooks={wordbooks}
        selectedWb={selectedWb}
        onSelect={setSelectedWb}
        onStart={startQuiz}
      />
    )
  }

  if (step === 'quiz') {
    return (
      <QuizView
        question={questions[current]}
        current={current}
        total={questions.length}
        chosen={chosen}
        onChoose={handleChoose}
      />
    )
  }

  if (step === 'result') {
    return (
      <ResultView
        answers={answers}
        total={questions.length}
        saving={saving}
        onRetry={() => { setStep('select'); setSelectedWb(null) }}
      />
    )
  }
}
