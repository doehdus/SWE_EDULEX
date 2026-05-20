import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import CharacterPreview from '../components/CharacterPreview'
import PdfUploadBar from '../components/PdfUploadBar'
import AttendanceStreak from '../components/AttendanceStreak'
import { Toast } from '../components/ui/Toast'
import { useMainPage } from '../hooks/useMainPage'
import { LIB } from '../constants/theme'

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

export default function MainPage() {
  const {
    wordbookCount, setWordbookCount,
    streak, checkedToday, attendanceLoading, checkingIn, rewardMsg,
    recentWordbook, recentQuiz,
    attendedDates,
    handleAttendance,
    getGridStartDate,
  } = useMainPage()

  return (
    <div
      className="h-[calc(100vh-72px)] p-5 grid grid-cols-[1fr_2fr] gap-5"
      style={{ background: LIB.parchment }}
    >
      {/* 좌측: 캐릭터 */}
      <CharacterPreview />

      {/* 우측: 3행 레이아웃 */}
      <div className="grid grid-rows-[auto_1fr_auto] gap-4 min-h-0 overflow-y-auto">

        {/* 1행: 출석 잔디 */}
        <AttendanceStreak
          attendedDates={attendedDates}
          streak={streak}
          checkedToday={checkedToday}
          loading={attendanceLoading}
          checkingIn={checkingIn}
          getGridStartDate={getGridStartDate}
          onCheckIn={handleAttendance}
        />

        {/* 2행: 최근 단어장 + 최근 테스트 */}
        <RecentCards recentWordbook={recentWordbook} recentQuiz={recentQuiz} />

        {/* 3행: PDF 업로드 */}
        <div
          className="rounded-2xl px-6 py-4"
          style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-extrabold flex items-center gap-1.5" style={{ color: LIB.wood }}>
              <BookOpen size={16} strokeWidth={2} /> 새 책 추가
            </span>
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

      {/* 책갈피 획득 토스트 */}
      {rewardMsg && (
        <Toast message={rewardMsg} onClose={() => {}} />
      )}
    </div>
  )
}
