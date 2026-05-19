import { useEffect, useState } from 'react'
import {
  BookOpen, Bot, Lock, Check, Bookmark, Trophy, BookMarked, Dumbbell, RotateCcw,
  ChevronDown, ChevronUp, TrendingUp, RefreshCw,
} from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { LIB, BOOK_COLORS } from '../constants/theme'
import { useWordbookAchievement } from '../hooks/useWordbookAchievement'
import { QUIZ_BOOK_ANIM_ID } from '../constants/character'

// ── 유틸 ──────────────────────────────────────────────────────────

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
    const wrongs  = shuffle(allWords.filter(w => w.id !== word.id)).slice(0, 3).map(w => w.english)
    const choices = shuffle([word.english, ...wrongs])
    return { id: word.id, question: word.major_meaning, answer: word.english, choices }
  })
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D']

const LEVELS = [
  { lv: 1, label: 'Lv 1', desc: '뜻 → 영어 객관식' },
  { lv: 2, label: 'Lv 2', desc: '영어 → 뜻 객관식' },
  { lv: 3, label: 'Lv 3', desc: '뜻 → 영어 주관식' },
  { lv: 4, label: 'Lv 4', desc: '영어 예문 빈칸채우기' },
]

// ── 단어 없음 모달 ────────────────────────────────────────────────

function NoWordsModal({ level, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-xs rounded-2xl overflow-hidden" style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}>
        <div className="px-6 py-5 text-center" style={{ background: `linear-gradient(135deg, ${LIB.wood} 0%, ${LIB.woodLight} 100%)` }}>
          <BookOpen size={36} strokeWidth={1.4} style={{ color: LIB.gold, margin: '0 auto 8px' }} />
          <p className="text-sm font-black" style={{ color: LIB.parchment }}>Lv {level} 단어가 없어요</p>
        </div>
        <div className="px-6 py-5 text-center">
          <p className="text-sm mb-4" style={{ color: LIB.inkLight }}>
            해당 레벨의 단어가 없습니다.<br />낮은 레벨 테스트를 먼저 완료해보세요.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-black"
            style={{ background: `linear-gradient(135deg, ${LIB.wood} 0%, ${LIB.woodLight} 100%)`, color: LIB.parchment }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 선택 화면 ─────────────────────────────────────────────────────

function SelectView({ wordbooks, selectedWb, onSelect, onStart, activeLevel, onLevelChange, progress, isReviewMode, wbLevelCounts }) {
  const [wbTab, setWbTab]           = useState('official')
  const [lv4Open, setLv4Open]       = useState(false)

  const officialBooks = wordbooks.filter(w => w.type === 'official')
  const userBooks     = wordbooks.filter(w => w.type === 'user')
  const visibleBooks  = wbTab === 'official' ? officialBooks : userBooks
  const isUserWb      = selectedWb?.type === 'user'

  const lvCounts = progress
    ? [progress.lv1_count, progress.lv2_count, progress.lv3_count, progress.lv4_count]
    : null

  const achievePct   = progress?.total > 0 ? Math.round((progress.graduated_count / progress.total) * 100) : 0
  const achieveLabel = `성취도 ${achievePct}% (${progress?.graduated_count ?? 0}/${progress?.total ?? 0})`

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-start justify-center p-6 pt-8" style={{ background: LIB.parchment }}>
      <div className="w-full max-w-lg">

        {/* 헤더 */}
        <div className="mb-7">
          <h1 className="text-2xl font-black mb-1 flex items-center gap-2" style={{ color: LIB.ink }}>
            <BookMarked size={22} strokeWidth={2} /> 단어 테스트
          </h1>
          <p className="text-sm" style={{ color: LIB.inkLight }}>레벨과 단어장을 선택하고 테스트를 시작하세요</p>
        </div>

        {/* ── Step 1: 레벨 선택 ── */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LIB.inkMid }}>
            Step 1 · 레벨 선택
          </p>
          <div className="grid grid-cols-4 gap-2">
            {LEVELS.map(({ lv, label, desc }) => {
              const locked   = false
              const isActive = activeLevel === lv
              const count    = lvCounts ? lvCounts[lv - 1] : null

              return (
                <button
                  key={lv}
                  onClick={() => !locked && onLevelChange(lv)}
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
                    <span className="absolute top-2 right-2">
                      <Lock size={11} strokeWidth={2} style={{ color: LIB.shelfLine }} />
                    </span>
                  )}
                  <span className="text-sm font-black" style={{ color: locked ? LIB.shelfLine : isActive ? LIB.gold : LIB.ink }}>
                    {label}
                  </span>
                  <span className="text-[9px] font-semibold text-center leading-tight px-1" style={{ color: locked ? LIB.shelfLine : isActive ? LIB.goldLight : LIB.inkLight }}>
                    {desc}
                  </span>
                  {/* 레벨별 단어 수 배지 (user 단어장) */}
                  {count !== null && !locked && (
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: isActive ? LIB.gold : LIB.parchmentDark, color: isActive ? LIB.ink : LIB.inkMid }}
                    >
                      {isReviewMode ? '전체' : `${count}개`}
                    </span>
                  )}
                  {/* MVP 배지 (공식 단어장 Lv1) */}
                  {isActive && !isUserWb && lv === 1 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: LIB.gold, color: LIB.ink }}>
                      MVP
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* 복습 모드 배지 */}
          {isReviewMode && (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: `${LIB.gold}22`, border: `1px solid ${LIB.gold}` }}>
              <RefreshCw size={12} style={{ color: LIB.gold }} />
              <span className="text-xs font-bold" style={{ color: LIB.wood }}>복습 모드 — 모든 단어 출제 가능</span>
            </div>
          )}

          {/* 성취도 패널 */}
          {progress && (
            <div className="mt-3 rounded-xl overflow-hidden" style={{ border: `1px solid ${LIB.shelfLine}`, background: 'white' }}>
              <button
                onClick={() => setLv4Open(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5"
              >
                <span className="text-xs font-bold" style={{ color: LIB.inkMid }}>{achieveLabel}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: LIB.parchmentDark }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${achievePct}%`, background: LIB.gold }} />
                  </div>
                  {lv4Open
                    ? <ChevronUp size={14} style={{ color: LIB.inkLight }} />
                    : <ChevronDown size={14} style={{ color: LIB.inkLight }} />
                  }
                </div>
              </button>

              {lv4Open && (
                <div className="border-t px-4 py-3 max-h-44 overflow-y-auto" style={{ borderColor: LIB.shelfLine }}>
                  {progress.graduated_words?.length === 0 ? (
                    <p className="text-xs text-center py-2" style={{ color: LIB.inkLight }}>아직 졸업한 단어가 없어요</p>
                  ) : (
                    <div className="space-y-1.5">
                      {progress.graduated_words.map(w => (
                        <div key={w.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: LIB.parchment }}>
                          <span className="text-xs font-black" style={{ color: LIB.ink }}>{w.english}</span>
                          <span className="text-[10px]" style={{ color: LIB.inkLight }}>{w.major_meaning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Step 2: 단어장 선택 ── */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: LIB.inkMid }}>
            Step 2 · 단어장 선택
          </p>

          <div className="flex rounded-xl p-1 mb-3 gap-1" style={{ background: LIB.parchmentDark }}>
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

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {visibleBooks.length === 0 ? (
              <div className="text-center py-8 rounded-xl text-sm" style={{ color: LIB.inkLight, background: 'white', border: `1px solid ${LIB.shelfLine}` }}>
                {wbTab === 'user' ? '아직 나만의 단어장이 없어요' : '공식 단어장이 없어요'}
              </div>
            ) : visibleBooks.map((wb, idx) => {
              const bookCol    = BOOK_COLORS[idx % BOOK_COLORS.length]
              const selected   = selectedWb?.id === wb.id
              const lvCount    = wbLevelCounts?.[wb.id]?.[activeLevel] ?? null
              const wbCounts   = wbLevelCounts?.[wb.id]
              const wbInReview = wbCounts != null && wbCounts._total > 0 && wbCounts._graduated === wbCounts._total
              const isDisabled = !wbInReview && lvCount !== null && lvCount === 0
              return (
                <button
                  key={wb.id}
                  onClick={() => onSelect(wb)}
                  disabled={isDisabled}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-150"
                  style={{
                    background: isDisabled ? LIB.parchmentDark : (selected ? LIB.cream : 'white'),
                    border: `2px solid ${selected ? LIB.gold : (isDisabled ? 'transparent' : LIB.shelfLine)}`,
                    boxShadow: selected ? '0 2px 10px rgba(201,168,76,0.2)' : 'none',
                    opacity: isDisabled ? 0.45 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div
                    className="w-2.5 self-stretch rounded-sm shrink-0"
                    style={{ background: `linear-gradient(180deg, ${bookCol.spine} 0%, ${bookCol.cover} 100%)`, boxShadow: 'inset -1px 0 3px rgba(0,0,0,0.2)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: LIB.ink }}>{wb.title}</p>
                    {wb.major && <p className="text-[10px] mt-0.5" style={{ color: LIB.inkLight }}>{wb.major}</p>}
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: LIB.gold, color: LIB.ink }}>
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

// ── 책 낙하/쌓기 애니메이션 (Q02) ────────────────────────────────

// 폭발 방향 벡터 — 하단 기준으로 방사형 (index 0=하단 책부터 먼저 폭발)
const EXPLODE_VECTORS = [
  { tx: '-80vw', ty: '-15vh', ts: 2.5, tr: '-130deg' },
  { tx: '-55vw', ty: '-65vh', ts: 2,   tr:   '90deg' },
  { tx: '-15vw', ty: '-85vh', ts: 2,   tr:  '-70deg' },
  { tx:  '30vw', ty: '-75vh', ts: 2,   tr:  '110deg' },
  { tx:  '60vw', ty: '-35vh', ts: 2.5, tr:  '-95deg' },
  { tx: '-35vw', ty: '-90vh', ts: 2,   tr:   '60deg' },
]

function BookStackAnimation({ count, isToppling, total }) {
  if (count === 0) return null
  const vh = typeof window !== 'undefined' ? window.innerHeight : 750
  const bookH = Math.max(22, Math.min(65, Math.floor(vh * 0.52 / Math.max(total, 1))))
  const bookW = Math.round(bookH * 3.8)
  const comboLabel = count >= 5 ? '🔥 PERFECT' : count >= 3 ? '⚡ COMBO' : count >= 2 ? 'COMBO' : null

  return (
    <div className="fixed bottom-6 right-6 flex flex-col-reverse items-end gap-0.5 pointer-events-none z-20">

      {/* 폭발 플래시 (오답 시) */}
      {isToppling && (
        <div
          className="animate-explosion-flash absolute bottom-0 right-0 rounded-full"
          style={{ width: bookW * 0.6, height: bookW * 0.6, background: '#ff6b35', transformOrigin: 'center' }}
        />
      )}

      {/* 책 목록 */}
      {Array.from({ length: count }).map((_, i) => {
        const c = BOOK_COLORS[i % BOOK_COLORS.length]
        const v = EXPLODE_VECTORS[i % EXPLODE_VECTORS.length]
        return (
          <div
            key={i}
            className={isToppling ? 'animate-explode-out' : i === count - 1 ? 'animate-fall-in' : ''}
            style={{
              width: bookW,
              height: bookH,
              borderRadius: 3,
              background: `linear-gradient(to right, ${c.spine} 0%, ${c.spine} 7%, ${c.cover} 7%, ${c.cover} 93%, ${c.accent} 93%)`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              // 아래 책(i=0)이 먼저 폭발, 위 책이 약간 늦게
              animationDelay: isToppling ? `${i * 25}ms` : '0ms',
              '--tx': v.tx, '--ty': v.ty, '--ts': v.ts, '--tr': v.tr,
            }}
          />
        )
      })}

      {/* 콤보 배지 */}
      {!isToppling && comboLabel && (
        <div
          key={`combo-${count}`}
          className="animate-combo-pop mb-1 px-3 py-1 rounded-full text-xs font-black tracking-wider"
          style={{
            background: count >= 5 ? LIB.deepRed : count >= 3 ? LIB.wood : LIB.woodLight,
            color: LIB.parchment,
            boxShadow: `0 2px 8px rgba(0,0,0,0.4)`,
          }}
        >
          {comboLabel} ×{count}
        </div>
      )}
    </div>
  )
}

// ── 퀴즈 화면 ─────────────────────────────────────────────────────

function QuizView({ question, current, total, chosen, onChoose, activeLevel, hasBookAnim, stackedBooks, isToppling }) {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6" style={{ background: LIB.parchment }}>
      <div className="w-full max-w-lg">

        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold shrink-0" style={{ color: LIB.inkMid }}>{current + 1} / {total}</span>
          <div className="flex-1 flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className="flex-1 h-2 rounded-sm transition-all duration-300"
                style={{ background: i < current ? LIB.gold : i === current ? LIB.woodLight : LIB.parchmentDark }} />
            ))}
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: LIB.parchmentDark, color: LIB.inkMid }}>
            Lv {activeLevel}
          </span>
        </div>

        <div className="rounded-2xl p-8 mb-5 text-center relative overflow-hidden"
          style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}`, boxShadow: '0 4px 20px rgba(92,58,30,0.12)' }}>
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-px w-px opacity-15" style={{ background: LIB.shelfLine }} />
          <div className="absolute top-0 right-8 w-3 h-8 rounded-b-sm opacity-60" style={{ background: LIB.deepRed }} />
          <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: LIB.inkLight }}>
            이 뜻에 해당하는 영어 단어는?
          </p>
          <p className="text-2xl font-black leading-snug" style={{ color: LIB.ink }}>{question.question}</p>
        </div>

        {hasBookAnim && (
          <BookStackAnimation count={stackedBooks} isToppling={isToppling} total={total} />
        )}

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
              <button key={i} onClick={() => onChoose(choice)}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-sm font-semibold text-left transition-all duration-150 hover:scale-[1.01]"
                style={{ background: bg, borderColor, color: textColor }}
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: labelBg, color: labelColor }}>
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

function ResultView({ answers, total, saving, onRetry, quizResult, activeLevel, isUserWb }) {
  const correctCount  = answers.filter(a => a.correct).length
  const score         = Math.round((correctCount / total) * 100)
  const promotedCount = quizResult?.promoted_count ?? 0

  const grade = score >= 90 ? { label: '완벽해요!',  icon: <Trophy    size={48} strokeWidth={1.2} style={{ color: LIB.gold }} />,        color: LIB.gold }
    : score >= 70           ? { label: '잘했어요!',  icon: <BookOpen  size={48} strokeWidth={1.2} style={{ color: '#4ade80' }} />,          color: '#4ade80' }
    : score >= 50           ? { label: '조금 더!',   icon: <BookMarked size={48} strokeWidth={1.2} style={{ color: LIB.woodLight }} />,    color: LIB.woodLight }
    :                         { label: '다시 도전!', icon: <Dumbbell  size={48} strokeWidth={1.2} style={{ color: LIB.deepRed }} />,        color: LIB.deepRed }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6" style={{ background: LIB.parchment }}>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl overflow-hidden" style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}`, boxShadow: '0 8px 32px rgba(92,58,30,0.18)' }}>

          {/* 우드 헤더 */}
          <div className="px-8 py-6 text-center relative" style={{ background: `linear-gradient(135deg, ${LIB.wood} 0%, ${LIB.woodLight} 100%)` }}>
            <div className="flex justify-center mb-2">{grade.icon}</div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: LIB.shelfLine }}>
              Lv {activeLevel} 테스트 결과
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

            <div className="w-full h-2 rounded-full mb-5" style={{ background: LIB.parchmentDark }}>
              <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${score}%`, background: grade.color }} />
            </div>

            {/* 승급 피드백 (user 단어장 + 승급 있을 때) */}
            {isUserWb && promotedCount > 0 && (
              <div className="rounded-xl px-4 py-3 mb-4 flex items-center gap-2" style={{ background: `${LIB.gold}18`, border: `1px solid ${LIB.gold}` }}>
                <TrendingUp size={16} style={{ color: LIB.gold, flexShrink: 0 }} />
                <span className="text-sm font-bold" style={{ color: LIB.wood }}>
                  {activeLevel === 4
                    ? `졸업된 단어 ${promotedCount}개 ↑`
                    : `Lv ${activeLevel + 1}로 승급된 단어 ${promotedCount}개 ↑`}
                </span>
              </div>
            )}

            {/* 다음 레벨 예고 (공식 단어장만) */}
            {!isUserWb && (
              <div className="rounded-xl px-4 py-3 mb-4 text-left" style={{ background: LIB.parchment, border: `1px solid ${LIB.shelfLine}` }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: LIB.inkLight }}>다음 레벨 미리보기</p>
                <div className="space-y-1.5">
                  {LEVELS.filter(l => l.lv > 1).map(l => (
                    <div key={l.lv} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: LIB.parchmentDark, color: LIB.inkLight }}>{l.label}</span>
                      <span className="text-[10px]" style={{ color: LIB.inkLight }}>{l.desc}</span>
                      <Lock size={10} strokeWidth={2} className="ml-auto shrink-0" style={{ color: LIB.shelfLine }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 보상 */}
            <div className="rounded-xl px-4 py-3 mb-5 text-sm font-semibold" style={{ background: LIB.parchment, color: LIB.inkMid }}>
              {saving
                ? <span className="opacity-60">결과 저장 중...</span>
                : <span className="flex items-center justify-center gap-1.5">
                    <Bookmark size={14} fill="currentColor" style={{ color: LIB.gold }} /> 책갈피 보상 지급 완료!
                  </span>
              }
            </div>

            <button
              onClick={onRetry}
              className="w-full py-3.5 rounded-xl text-sm font-black tracking-wide transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${LIB.wood} 0%, ${LIB.woodLight} 100%)`, color: LIB.parchment, boxShadow: '0 4px 14px rgba(92,58,30,0.3)' }}
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
  const { user, profile }           = useAuth()
  const [step, setStep]             = useState('select')
  const [wordbooks, setWordbooks]   = useState([])
  const [selectedWb, setSelectedWb] = useState(null)
  const [activeLevel, setActiveLevel] = useState(1)
  const [questions, setQuestions]   = useState([])
  const [current, setCurrent]       = useState(0)
  const [answers, setAnswers]       = useState([])
  const [chosen, setChosen]         = useState(null)
  const [saving, setSaving]         = useState(false)
  const [quizResult, setQuizResult] = useState(null)
  const [noWordsModal, setNoWordsModal] = useState(false)
  const [wbLevelCounts, setWbLevelCounts] = useState({})
  const [stackedBooks, setStackedBooks] = useState(0)
  const [isToppling,  setIsToppling]   = useState(false)

  const hasBookAnim = profile?.owned_items?.includes(QUIZ_BOOK_ANIM_ID) ?? false

  const achievementWbId = selectedWb?.id ?? null
  const { progress, refetch } = useWordbookAchievement(user?.id, achievementWbId)
  const isReviewMode = progress?.total > 0 && progress?.graduated_count === progress?.total

  useEffect(() => { fetchWordbooks() }, [user])

  const fetchWordbooks = async () => {
    const [{ data: official }, { data: mine }] = await Promise.all([
      supabase.from('official_wordbooks').select('id, title, major').order('created_at'),
      supabase.from('user_wordbooks').select('id, title').eq('user_id', user.id),
    ])
    const wbs = [
      ...(official ?? []).map(w => ({ ...w, type: 'official' })),
      ...(mine    ?? []).map(w => ({ ...w, type: 'user' })),
    ]
    setWordbooks(wbs)
    fetchWbLevelCounts(wbs)
  }

  const fetchWbLevelCounts = async (wbs) => {
    const officialIds = wbs.filter(w => w.type === 'official').map(w => w.id)
    const userIds     = wbs.filter(w => w.type === 'user').map(w => w.id)
    const counts = {}

    if (userIds.length > 0) {
      const { data } = await supabase
        .from('user_words').select('wordbook_id, word_level').in('wordbook_id', userIds)
      for (const id of userIds) counts[id] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, _total: 0, _graduated: 0 }
      for (const row of data ?? []) {
        counts[row.wordbook_id][row.word_level]++
        counts[row.wordbook_id]._total++
        if (row.word_level === 5) counts[row.wordbook_id]._graduated++
      }
    }

    if (officialIds.length > 0) {
      const [{ data: words }, { data: prog }] = await Promise.all([
        supabase.from('official_words').select('id, wordbook_id').in('wordbook_id', officialIds),
        supabase.from('user_official_word_progress').select('word_id, word_level'),
      ])
      const wordToWb = {}, totalByWb = {}
      for (const w of words ?? []) {
        wordToWb[w.id] = w.wordbook_id
        totalByWb[w.wordbook_id] = (totalByWb[w.wordbook_id] ?? 0) + 1
      }
      const progByWb = {}
      for (const p of prog ?? []) {
        const wbId = wordToWb[p.word_id]
        if (!wbId) continue
        if (!progByWb[wbId]) progByWb[wbId] = {}
        progByWb[wbId][p.word_level] = (progByWb[wbId][p.word_level] ?? 0) + 1
      }
      for (const id of officialIds) {
        const total = totalByWb[id] ?? 0
        const p = progByWb[id] ?? {}
        const lv2 = p[2] ?? 0, lv3 = p[3] ?? 0, lv4 = p[4] ?? 0, lv5 = p[5] ?? 0
        counts[id] = { 1: total - lv2 - lv3 - lv4 - lv5, 2: lv2, 3: lv3, 4: lv4, 5: lv5, _total: total, _graduated: lv5 }
      }
    }

    setWbLevelCounts(counts)
  }

  const getLvCount = (lv) => {
    if (!progress) return null
    return [progress.lv1_count, progress.lv2_count, progress.lv3_count, progress.lv4_count][lv - 1] ?? 0
  }

  const startQuiz = async () => {
    if (!selectedWb) return

    // 레벨별 단어 수 사전 체크 (복습모드 제외, progress 로드 완료 후)
    if (!isReviewMode) {
      const count = getLvCount(activeLevel)
      if (count === 0) { setNoWordsModal(true); return }
    }

    let allWords
    if (selectedWb.type === 'official') {
      const { data } = await supabase.rpc('get_official_words_for_level', {
        p_user_id:     user.id,
        p_wordbook_id: selectedWb.id,
        p_level:       isReviewMode ? null : activeLevel,
      })
      allWords = data
    } else {
      let q = supabase.from('user_words').select('id, english, major_meaning').eq('wordbook_id', selectedWb.id)
      if (!isReviewMode) q = q.eq('word_level', activeLevel)
      const { data } = await q
      allWords = data
    }
    if (!allWords || allWords.length < 4) {
      alert('퀴즈를 위해 단어가 4개 이상 필요합니다.')
      return
    }

    setQuizResult(null)
    setQuestions(buildQuestions(allWords))
    setAnswers([])
    setCurrent(0)
    setChosen(null)
    setStackedBooks(0)
    setIsToppling(false)
    setStep('quiz')
  }

  const handleChoose = (choice) => {
    if (chosen !== null) return
    setChosen(choice)
    const isCorrect   = choice === questions[current].answer
    const nextAnswers = [...answers, { chosen: choice, correct: isCorrect }]

    if (hasBookAnim) {
      if (isCorrect) {
        setStackedBooks(n => n + 1)
      } else {
        setIsToppling(true)
        setTimeout(() => { setStackedBooks(0); setIsToppling(false) }, 700)
      }
    }

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
    const correctCount   = finalAnswers.filter(a => a.correct).length
    const score          = Math.round((correctCount / questions.length) * 100)
    const correctWordIds = finalAnswers
      .map((a, i) => a.correct ? questions[i].id : null)
      .filter(Boolean)

    const params = {
      p_user_id:       user.id,
      p_wordbook_id:   selectedWb.id,
      p_wordbook_type: selectedWb.type,
      p_score:         score,
      p_total:         questions.length,
      p_correct:       correctCount,
    }

    params.p_level            = activeLevel
    params.p_correct_word_ids = correctWordIds

    const { data } = await supabase.rpc('save_quiz_result', params)
    setQuizResult(data)
    await refetch()
    fetchWbLevelCounts(wordbooks)
    setSaving(false)
    setStep('result')
  }

  if (step === 'select') return (
    <>
      <SelectView
        wordbooks={wordbooks}
        selectedWb={selectedWb}
        onSelect={setSelectedWb}
        onStart={startQuiz}
        activeLevel={activeLevel}
        onLevelChange={setActiveLevel}
        progress={progress}
        isReviewMode={isReviewMode}
        wbLevelCounts={wbLevelCounts}
      />
      {noWordsModal && <NoWordsModal level={activeLevel} onClose={() => setNoWordsModal(false)} />}
    </>
  )
  if (step === 'quiz') return (
    <QuizView question={questions[current]} current={current} total={questions.length} chosen={chosen} onChoose={handleChoose} activeLevel={activeLevel} hasBookAnim={hasBookAnim} stackedBooks={stackedBooks} isToppling={isToppling} />
  )
  if (step === 'result') return (
    <ResultView
      answers={answers}
      total={questions.length}
      saving={saving}
      onRetry={() => { setStep('select'); setSelectedWb(null); setActiveLevel(1) }}
      quizResult={quizResult}
      activeLevel={activeLevel}
      isUserWb={selectedWb?.type === 'user'}
    />
  )
}
