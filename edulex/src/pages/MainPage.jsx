import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Bookmark, BookOpen, Book, ChevronRight } from 'lucide-react'
import CharacterPreview from '../components/CharacterPreview'
import PdfUploadBar from '../components/PdfUploadBar'
import { useMainPage } from '../hooks/useMainPage'
import { LIB } from '../constants/theme'

// ── 요일 이니셜 (Duolingo 스타일) ────────────────────────────────
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function DayCircle({ date, todayStr, attendedDates }) {
  const d = new Date(date)
  const label = DAY_LABELS[d.getDay()]
  const isToday = date === todayStr
  const isPast = date < todayStr
  const attended = attendedDates.has(date)

  // 상태별 스타일
  if (attended) {
    // 출석 완료 — 골드 채움 + 체크
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-base font-black shadow-md"
          style={{
            background: `linear-gradient(135deg, ${LIB.gold} 0%, #e8c040 100%)`,
            color: LIB.ink,
            boxShadow: '0 2px 8px rgba(201,168,76,0.5)',
          }}
        >
          ✓
        </div>
        <span className="text-[10px] font-bold" style={{ color: LIB.goldLight }}>{label}</span>
      </div>
    )
  }

  if (isToday) {
    // 오늘 (미출석) — 골드 테두리 + 펄스
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black animate-pulse"
          style={{
            background: 'rgba(201,168,76,0.15)',
            border: `2.5px solid ${LIB.gold}`,
            color: LIB.goldLight,
          }}
        >
          {label}
        </div>
        <span className="text-[10px] font-bold" style={{ color: LIB.goldLight }}>{label}</span>
      </div>
    )
  }

  if (isPast) {
    // 과거 미출석 — 흐린 원 (스트릭 끊김)
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.25)' }}
        >
          {label}
        </div>
        <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
      </div>
    )
  }

  // 미래 — 매우 흐림
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.15)' }}
      >
        {label}
      </div>
      <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.15)' }}>{label}</span>
    </div>
  )
}

function StreakBar({ last7Days, today, streak, checkedToday, loading, rewardMsg, onAttendance, attendedDates }) {
  const todayStr = today()
  const [btnHover, setBtnHover] = useState(false)
  const [btnPress, setBtnPress] = useState(false)
  return (
    <div
      className="rounded-2xl px-7 py-6 flex items-center gap-8 relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${LIB.wood} 0%, ${LIB.woodLight} 100%)`,
        boxShadow: '0 4px 20px rgba(92,58,30,0.40)',
      }}
    >
      {/* 배경 질감 */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)' }}
      />
      {/* 좌상단 빛 번짐 */}
      <div className="absolute top-0 left-0 w-40 h-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.10) 0%, transparent 70%)' }}
      />

      {/* 좌측: 불꽃 카운터 */}
      <div className="shrink-0 flex flex-col items-center" style={{ filter: 'drop-shadow(0 2px 6px rgba(201,168,76,0.4))' }}>
        <Flame size={38} strokeWidth={1.5} style={{ color: LIB.gold }} className="mb-0.5" />
        <div className="text-3xl font-black leading-none" style={{ color: LIB.gold }}>{streak}</div>
        <div className="text-[10px] font-bold mt-0.5" style={{ color: LIB.goldLight }}>일 연속</div>
      </div>

      {/* 구분선 */}
      <div className="w-px self-stretch opacity-20 shrink-0" style={{ background: LIB.shelfLine }} />

      {/* 중앙: 7일 요일 원형 */}
      <div className="flex-1 flex items-center justify-around">
        {last7Days.map((date) => (
          <DayCircle
            key={date}
            date={date}
            todayStr={todayStr}
            attendedDates={attendedDates}
          />
        ))}
      </div>

      {/* 우측: 출석 버튼 + 보상 */}
      <div className="shrink-0 flex flex-col items-center gap-2">
        <button
          onClick={onAttendance}
          disabled={checkedToday || loading}
          onMouseEnter={() => !checkedToday && setBtnHover(true)}
          onMouseLeave={() => { setBtnHover(false); setBtnPress(false) }}
          onMouseDown={() => !checkedToday && setBtnPress(true)}
          onMouseUp={() => setBtnPress(false)}
          className="px-5 py-2.5 rounded-xl text-sm font-black whitespace-nowrap"
          style={checkedToday
            ? { background: 'rgba(255,255,255,0.12)', color: LIB.goldLight, cursor: 'default', transition: 'none' }
            : {
                background: btnPress
                  ? '#b8962e'
                  : btnHover
                  ? '#e0bc5a'
                  : LIB.gold,
                color: LIB.ink,
                boxShadow: btnHover ? '0 6px 18px rgba(201,168,76,0.65)' : '0 3px 10px rgba(201,168,76,0.5)',
                transform: btnPress ? 'scale(0.96)' : btnHover ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.15s cubic-bezier(.34,1.56,.64,1), box-shadow 0.15s ease, background 0.15s ease',
              }
          }
        >
          {loading ? '...' : checkedToday
            ? <span className="flex items-center gap-1.5"><Bookmark size={13} fill="currentColor" /> 완료</span>
            : '출석 도장'
          }
        </button>
        {rewardMsg && (
          <p className="text-[11px] font-bold animate-bounce whitespace-nowrap flex items-center gap-1" style={{ color: LIB.goldLight }}>
            <Bookmark size={11} fill="currentColor" /> {rewardMsg}
          </p>
        )}
      </div>
    </div>
  )
}

function BookCard({ to, label, title, subtitle, bookColor }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  return (
    <Link
      to={to}
      className="flex gap-4 rounded-2xl p-5 group relative overflow-hidden select-none"
      style={{
        background: LIB.cream,
        border: `1px solid ${LIB.shelfLine}`,
        boxShadow: pressed
          ? '0 2px 6px rgba(92,58,30,0.10)'
          : hovered
          ? '0 10px 30px rgba(92,58,30,0.22)'
          : '0 2px 8px rgba(92,58,30,0.08)',
        transform: pressed
          ? 'translateY(0px) rotate(0deg)'
          : hovered
          ? 'translateY(-5px) rotate(-0.4deg)'
          : 'translateY(0px) rotate(0deg)',
        transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {/* 책등 (spine) */}
      <div
        className="w-4 shrink-0 rounded-l-sm self-stretch"
        style={{
          background: `linear-gradient(180deg, ${bookColor} 0%, rgba(0,0,0,0.4) 100%)`,
          boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3)',
          width: hovered ? 20 : 16,
          transition: 'width 0.22s ease',
        }}
      />
      {/* 책 내용 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: LIB.inkLight }}>
            {label}
          </p>
          {title
            ? <p className="text-base font-extrabold leading-snug truncate" style={{ color: LIB.ink }}>{title}</p>
            : <p className="text-sm font-bold" style={{ color: LIB.shelfLine }}>아직 없어요</p>
          }
        </div>
        <p
          className="text-xs mt-3 font-semibold flex items-center"
          style={{
            color: LIB.inkLight,
            gap: hovered ? 8 : 4,
            transition: 'gap 0.2s ease',
          }}
        >
          {subtitle} <ChevronRight size={12} />
        </p>
      </div>
      {/* 책갈피 장식 */}
      <div
        className="absolute top-0 right-5 w-3 rounded-b-sm"
        style={{
          background: LIB.deepRed,
          height: hovered ? 32 : 24,
          opacity: hovered ? 1 : 0.7,
          transition: 'height 0.22s ease, opacity 0.2s ease',
        }}
      />
      {/* hover 시 빛 번짐 */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: hovered
            ? 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.18) 0%, transparent 70%)'
            : 'transparent',
          transition: 'background 0.3s ease',
        }}
      />
    </Link>
  )
}

function RecentCards({ recentWordbook, recentQuiz }) {
  return (
    <div className="grid grid-cols-2 gap-4 min-h-0">
      <BookCard
        to="/wordbook/my"
        label="최근 단어장"
        title={recentWordbook?.title}
        subtitle="이어서 학습하기"
        bookColor={LIB.deepRed}
      />
      <BookCard
        to="/quiz"
        label="최근 테스트"
        title={recentQuiz ? `최근 점수: ${recentQuiz.score}점` : null}
        subtitle="다시 도전하기"
        bookColor={LIB.wood}
      />
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────

export default function MainPage() {
  const {
    wordbookCount, setWordbookCount,
    streak, checkedToday, loading, rewardMsg,
    recentWordbook, recentQuiz,
    last7Days, today,
    attendedDates,
    handleAttendance,
  } = useMainPage()

  return (
    <div
      className="h-[calc(100vh-72px)] p-5 grid grid-cols-[1fr_2fr] gap-5"
      style={{ background: LIB.parchment }}
    >
      {/* 좌측: 캐릭터 (책 표지형) */}
      <CharacterPreview />

      {/* 우측: 3행 레이아웃 */}
      <div className="grid grid-rows-[auto_1fr_auto] gap-4 min-h-0">

        {/* 1행: 스트릭 (서가형) */}
        <StreakBar
          last7Days={last7Days}
          today={today}
          streak={streak}
          checkedToday={checkedToday}
          loading={loading}
          rewardMsg={rewardMsg}
          onAttendance={handleAttendance}
          attendedDates={attendedDates}
        />

        {/* 2행: 최근 단어장 + 최근 테스트 (책 카드형) */}
        <RecentCards recentWordbook={recentWordbook} recentQuiz={recentQuiz} />

        {/* 3행: PDF 업로드 */}
        <div
          className="rounded-2xl px-6 py-4"
          style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-extrabold flex items-center gap-1.5" style={{ color: LIB.wood }}><BookOpen size={16} strokeWidth={2} /> 새 책 추가</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: LIB.parchmentDark, color: LIB.inkMid }}>
              PDF → 단어장
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: LIB.inkLight }}>
            전공 PDF를 업로드하면 AI가 핵심 단어를 자동 추출해 서가에 꽂아드립니다.
          </p>
          <PdfUploadBar
            wordbookCount={wordbookCount}
            onComplete={() => setWordbookCount(c => c + 1)}
          />
        </div>

      </div>
    </div>
  )
}
