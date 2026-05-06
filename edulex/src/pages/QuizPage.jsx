import { useEffect, useState } from 'react'
import { BookOpen, Bot, Lock, Check, Bookmark, Trophy, BookMarked, Dumbbell, RotateCcw } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { LIB, BOOK_COLORS } from '../constants/theme'

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

const CHOICE_LABELS = ['A', 'B', 'C', 'D']

// ── 레벨 정의 ─────────────────────────────────────────────────────

const LEVELS = [
  { lv: 1, label: 'Lv 1', desc: '뜻 → 영어 객관식', locked: false },
  { lv: 2, label: 'Lv 2', desc: '영어 → 뜻 객관식', locked: true },
  { lv: 3, label: 'Lv 3', desc: '뜻 → 영어 주관식', locked: true },
  { lv: 4, label: 'Lv 4', desc: '영어 예문 빈칸채우기', locked: true },
]

// ── 선택 화면 ─────────────────────────────────────────────────────

function SelectView({ wordbooks, selectedWb, onSelect, onStart }) {
  const [activeLevel, setActiveLevel] = useState(1)
  const [wbTab, setWbTab] = useState('official') // 'official' | 'user'

  const officialBooks = wordbooks.filter(w => w.type === 'official')
  const userBooks     = wordbooks.filter(w => w.type === 'user')
  const visibleBooks  = wbTab === 'official' ? officialBooks : userBooks

  return (
    <div
      className="min-h-[calc(100vh-72px)] flex items-start justify-center p-6 pt-8"
      style={{ background: LIB.parchment }}
    >
      <div className="w-full max-w-lg">

        {/* 헤더 */}
        <div className="mb-7">
          <h1 className="text-2xl font-black mb-1 flex items-center gap-2" style={{ color: LIB.ink }}><BookMarked size={22} strokeWidth={2} /> 단어 테스트</h1>
          <p className="text-sm" style={{ color: LIB.inkLight }}>레벨과 단어장을 선택하고 테스트를 시작하세요</p>
        </div>

        {/* ── 1단계: 레벨 선택 ── */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LIB.inkMid }}>
            Step 1 · 레벨 선택
          </p>
          <div className="grid grid-cols-4 gap-2">
            {LEVELS.map(({ lv, label, desc, locked }) => {
              const isActive = activeLevel === lv
              return (
                <button
                  key={lv}
                  onClick={() => !locked && setActiveLevel(lv)}
                  disabled={locked}
                  className="relative flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all duration-150"
                  style={locked
                    ? { background: LIB.parchmentDark, borderColor: 'transparent', cursor: 'not-allowed', opacity: 0.55 }
                    : isActive
                      ? { background: `linear-gradient(135deg, ${LIB.wood} 0%, ${LIB.woodLight} 100%)`, borderColor: LIB.gold, boxShadow: `0 4px 14px rgba(92,58,30,0.3)` }
                      : { background: 'white', borderColor: LIB.shelfLine }
                  }
                >
                  {locked && (
                    <span className="absolute top-2 right-2"><Lock size={11} strokeWidth={2} style={{ color: LIB.shelfLine }} /></span>
                  )}
                  <span
                    className="text-sm font-black"
                    style={{ color: locked ? LIB.shelfLine : isActive ? LIB.gold : LIB.ink }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[9px] font-semibold text-center leading-tight px-1"
                    style={{ color: locked ? LIB.shelfLine : isActive ? LIB.goldLight : LIB.inkLight }}
                  >
                    {desc}
                  </span>
                  {isActive && !locked && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: LIB.gold, color: LIB.ink }}>
                      MVP
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── 2단계: 단어장 선택 ── */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LIB.inkMid }}>
            Step 2 · 단어장 선택
          </p>

          {/* 탭: 공식 / 나만의 */}
          <div
            className="flex rounded-xl p-1 mb-3 gap-1"
            style={{ background: LIB.parchmentDark }}
          >
            {[
              { key: 'official', icon: <BookOpen size={13} strokeWidth={2} />, label: '공식 단어장', count: officialBooks.length },
              { key: 'user',     icon: <Bot size={13} strokeWidth={2} />,      label: '나만의 단어장', count: userBooks.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setWbTab(tab.key); onSelect(null) }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-150 whitespace-nowrap"
                style={wbTab === tab.key
                  ? { background: 'white', color: LIB.ink, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }
                  : { color: LIB.inkLight }
                }
              >
                {tab.icon}{tab.label}
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                  style={wbTab === tab.key
                    ? { background: LIB.parchmentDark, color: LIB.inkMid }
                    : { background: 'rgba(0,0,0,0.08)', color: LIB.inkLight }
                  }
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* 단어장 목록 */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {visibleBooks.length === 0 ? (
              <div
                className="text-center py-8 rounded-xl text-sm"
                style={{ color: LIB.inkLight, background: 'white', border: `1px solid ${LIB.shelfLine}` }}
              >
                {wbTab === 'user' ? '아직 나만의 단어장이 없어요' : '공식 단어장이 없어요'}
              </div>
            ) : visibleBooks.map((wb, idx) => {
              const bookCol  = BOOK_COLORS[idx % BOOK_COLORS.length]
              const selected = selectedWb?.id === wb.id
              return (
                <button
                  key={wb.id}
                  onClick={() => onSelect(wb)}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-150"
                  style={{
                    background: selected ? LIB.cream : 'white',
                    border: `2px solid ${selected ? LIB.gold : LIB.shelfLine}`,
                    boxShadow: selected ? '0 2px 10px rgba(201,168,76,0.2)' : 'none',
                  }}
                >
                  <div
                    className="w-2.5 self-stretch rounded-sm shrink-0"
                    style={{
                      background: `linear-gradient(180deg, ${bookCol.spine} 0%, ${bookCol.cover} 100%)`,
                      boxShadow: 'inset -1px 0 3px rgba(0,0,0,0.2)',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: LIB.ink }}>{wb.title}</p>
                    {wb.major && (
                      <p className="text-[10px] mt-0.5" style={{ color: LIB.inkLight }}>{wb.major}</p>
                    )}
                  </div>
                  {selected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: LIB.gold, color: LIB.ink }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={onStart}
          disabled={!selectedWb}
          className="w-full py-4 rounded-xl text-sm font-black tracking-wide transition-all duration-200 disabled:opacity-40"
          style={{
            background: selectedWb
              ? `linear-gradient(135deg, ${LIB.wood} 0%, ${LIB.woodLight} 100%)`
              : LIB.parchmentDark,
            color: selectedWb ? LIB.parchment : LIB.inkLight,
            boxShadow: selectedWb ? '0 4px 14px rgba(92,58,30,0.35)' : 'none',
          }}
        >
          {selectedWb ? `Lv ${activeLevel} 테스트 시작 →` : '단어장을 선택하세요'}
        </button>

      </div>
    </div>
  )
}

// ── 퀴즈 화면 ─────────────────────────────────────────────────────

function QuizView({ question, current, total, chosen, onChoose }) {
  return (
    <div
      className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6"
      style={{ background: LIB.parchment }}
    >
      <div className="w-full max-w-lg">

        {/* 책갈피형 분절 진행바 */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold shrink-0" style={{ color: LIB.inkMid }}>
            {current + 1} / {total}
          </span>
          <div className="flex-1 flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-sm transition-all duration-300"
                style={{
                  background: i < current ? LIB.gold : i === current ? LIB.woodLight : LIB.parchmentDark,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: LIB.parchmentDark, color: LIB.inkMid }}>
            Lv 1
          </span>
        </div>

        {/* 문제 카드 — 열린 책 */}
        <div
          className="rounded-2xl p-8 mb-5 text-center relative overflow-hidden"
          style={{
            background: LIB.cream,
            border: `1px solid ${LIB.shelfLine}`,
            boxShadow: '0 4px 20px rgba(92,58,30,0.12)',
          }}
        >
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-px w-px opacity-15"
            style={{ background: LIB.shelfLine }} />
          <div className="absolute top-0 right-8 w-3 h-8 rounded-b-sm opacity-60"
            style={{ background: LIB.deepRed }} />
          <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: LIB.inkLight }}>
            이 뜻에 해당하는 영어 단어는?
          </p>
          <p className="text-2xl font-black leading-snug" style={{ color: LIB.ink }}>
            {question.question}
          </p>
        </div>

        {/* 선택지 */}
        <div className="space-y-3">
          {question.choices.map((choice, i) => {
            let bg = 'white', borderColor = LIB.shelfLine, textColor = LIB.ink
            let labelBg = LIB.parchmentDark, labelColor = LIB.inkMid

            if (chosen !== null) {
              if (choice === question.answer) {
                bg = '#f0fdf4'; borderColor = '#4ade80'; textColor = '#166534'
                labelBg = '#4ade80'; labelColor = 'white'
              } else if (choice === chosen) {
                bg = '#fff1f2'; borderColor = '#f87171'; textColor = '#991b1b'
                labelBg = '#f87171'; labelColor = 'white'
              } else {
                borderColor = LIB.parchmentDark; textColor = LIB.shelfLine
                labelBg = LIB.parchmentDark; labelColor = LIB.shelfLine
              }
            }

            return (
              <button
                key={i}
                onClick={() => onChoose(choice)}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-sm font-semibold text-left transition-all duration-150 hover:scale-[1.01]"
                style={{ background: bg, borderColor, color: textColor }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: labelBg, color: labelColor }}
                >
                  {CHOICE_LABELS[i]}
                </span>
                {choice}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── 결과 화면 ─────────────────────────────────────────────────────

function ResultView({ answers, total, saving, onRetry }) {
  const correctCount = answers.filter(a => a.correct).length
  const score        = Math.round((correctCount / total) * 100)

  const grade = score >= 90 ? { label: '완벽해요!',  icon: <Trophy   size={48} strokeWidth={1.2} style={{ color: LIB.gold }} />,        color: LIB.gold }
    : score >= 70           ? { label: '잘했어요!',  icon: <BookOpen  size={48} strokeWidth={1.2} style={{ color: '#4ade80' }} />,          color: '#4ade80' }
    : score >= 50           ? { label: '조금 더!',   icon: <BookMarked size={48} strokeWidth={1.2} style={{ color: LIB.woodLight }} />,    color: LIB.woodLight }
    :                         { label: '다시 도전!', icon: <Dumbbell  size={48} strokeWidth={1.2} style={{ color: LIB.deepRed }} />,        color: LIB.deepRed }

  return (
    <div
      className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6"
      style={{ background: LIB.parchment }}
    >
      <div className="w-full max-w-sm">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}`, boxShadow: '0 8px 32px rgba(92,58,30,0.18)' }}
        >
          {/* 우드 헤더 */}
          <div
            className="px-8 py-6 text-center relative"
            style={{ background: `linear-gradient(135deg, ${LIB.wood} 0%, ${LIB.woodLight} 100%)` }}
          >
            <div className="flex justify-center mb-2">{grade.icon}</div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: LIB.shelfLine }}>
              Lv 1 테스트 결과
            </p>
            <p className="text-5xl font-black" style={{ color: LIB.gold }}>{score}</p>
            <p className="text-sm font-bold" style={{ color: LIB.goldLight }}>점</p>
            <div className="absolute top-0 left-6 w-2.5 h-7 rounded-b-sm" style={{ background: LIB.deepRed, opacity: 0.8 }} />
            <div className="absolute top-0 right-10 w-2.5 h-5 rounded-b-sm" style={{ background: LIB.gold, opacity: 0.6 }} />
          </div>

          {/* 본문 */}
          <div className="px-8 py-6 text-center">
            <p className="text-lg font-black mb-1" style={{ color: LIB.ink }}>{grade.label}</p>
            <p className="text-sm mb-5" style={{ color: LIB.inkLight }}>
              {total}문제 중 <span className="font-bold" style={{ color: LIB.ink }}>{correctCount}개</span> 정답
            </p>

            {/* 정답률 바 */}
            <div className="w-full h-2 rounded-full mb-5" style={{ background: LIB.parchmentDark }}>
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${score}%`, background: grade.color }}
              />
            </div>

            {/* 다음 레벨 예고 */}
            <div
              className="rounded-xl px-4 py-3 mb-4 text-left"
              style={{ background: LIB.parchment, border: `1px solid ${LIB.shelfLine}` }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: LIB.inkLight }}>
                다음 레벨 미리보기
              </p>
              <div className="space-y-1.5">
                {LEVELS.filter(l => l.lv > 1).map(l => (
                  <div key={l.lv} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: LIB.parchmentDark, color: LIB.inkLight }}>
                      {l.label}
                    </span>
                    <span className="text-[10px]" style={{ color: LIB.inkLight }}>{l.desc}</span>
                    <Lock size={10} strokeWidth={2} className="ml-auto shrink-0" style={{ color: LIB.shelfLine }} />
                  </div>
                ))}
              </div>
            </div>

            {/* 보상 */}
            <div
              className="rounded-xl px-4 py-3 mb-5 text-sm font-semibold"
              style={{ background: LIB.parchment, color: LIB.inkMid }}
            >
              {saving ? <span className="opacity-60">결과 저장 중...</span> : <span className="flex items-center justify-center gap-1.5"><Bookmark size={14} fill="currentColor" style={{ color: LIB.gold }} /> 책갈피 보상 지급 완료!</span>}
            </div>

            <button
              onClick={onRetry}
              className="w-full py-3.5 rounded-xl text-sm font-black tracking-wide transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${LIB.wood} 0%, ${LIB.woodLight} 100%)`,
                color: LIB.parchment,
                boxShadow: '0 4px 14px rgba(92,58,30,0.3)',
              }}
            >
              <span className="flex items-center justify-center gap-2"><RotateCcw size={15} strokeWidth={2.5} /> 다시 테스트</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 메인 ─────────────────────────────────────────────────────────

export default function QuizPage() {
  const { user } = useAuth()
  const [step, setStep]             = useState('select')
  const [wordbooks, setWordbooks]   = useState([])
  const [selectedWb, setSelectedWb] = useState(null)
  const [questions, setQuestions]   = useState([])
  const [current, setCurrent]       = useState(0)
  const [answers, setAnswers]       = useState([])
  const [chosen, setChosen]         = useState(null)
  const [saving, setSaving]         = useState(false)

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

  if (step === 'select') return (
    <SelectView wordbooks={wordbooks} selectedWb={selectedWb} onSelect={setSelectedWb} onStart={startQuiz} />
  )
  if (step === 'quiz') return (
    <QuizView question={questions[current]} current={current} total={questions.length} chosen={chosen} onChoose={handleChoose} />
  )
  if (step === 'result') return (
    <ResultView answers={answers} total={questions.length} saving={saving} onRetry={() => { setStep('select'); setSelectedWb(null) }} />
  )
}
