import { Link } from 'react-router-dom'
import CharacterPreview from '../components/CharacterPreview'
import PdfUploadBar from '../components/PdfUploadBar'
import { useMainPage } from '../hooks/useMainPage'
import { COLOR } from '../constants/theme'

// ── 서브 컴포넌트 ─────────────────────────────────────────────────

function StreakBar({ last7Days, today, streak, checkedToday, loading, rewardMsg, onAttendance }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm px-7 py-5 flex items-center justify-between">
      <div>
        <p className="text-xl font-extrabold" style={{ color: COLOR.navy }}>🔥 스트릭</p>
        <div className="flex gap-2 mt-3">
          {last7Days.map(date => (
            <div
              key={date}
              title={date}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${date <= today() ? 'text-white' : 'bg-gray-100 text-gray-300'}`}
              style={date <= today() ? { backgroundColor: COLOR.teal } : {}}
            >
              {date === today() ? '★' : '•'}
            </div>
          ))}
        </div>
        {rewardMsg && (
          <p className="text-yellow-600 text-sm font-semibold mt-2 animate-bounce">⭐ {rewardMsg}</p>
        )}
      </div>

      <div className="text-right">
        <p className="text-4xl font-extrabold" style={{ color: COLOR.teal }}>
          {streak}<span className="text-base font-bold text-gray-400 ml-1">일</span>
        </p>
        <button
          onClick={onAttendance}
          disabled={checkedToday || loading}
          className={`mt-3 px-6 py-2.5 rounded-xl text-sm font-bold transition
            ${checkedToday
              ? 'bg-green-100 text-green-600 cursor-default'
              : 'text-white hover:opacity-90'}`}
          style={!checkedToday ? { backgroundColor: COLOR.navy } : {}}
        >
          {loading ? '처리 중...' : checkedToday ? '✅ 출석완료' : '출석 체크'}
        </button>
      </div>
    </div>
  )
}

function RecentCards({ recentWordbook, recentQuiz }) {
  return (
    <div className="grid grid-cols-2 gap-5 min-h-0">
      <Link
        to="/wordbook/my"
        className="bg-white rounded-2xl shadow-sm p-7 flex flex-col justify-between hover:shadow-md transition group"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: COLOR.teal }}>
            최근사용 단어장
          </p>
          {recentWordbook
            ? <p className="text-2xl font-extrabold leading-snug group-hover:opacity-70 transition" style={{ color: COLOR.navy }}>{recentWordbook.title}</p>
            : <p className="text-lg text-gray-300 font-bold">아직 없어요</p>
          }
        </div>
        <p className="text-sm text-gray-400 mt-4">이어서 학습하기 →</p>
      </Link>

      <Link
        to="/quiz"
        className="bg-white rounded-2xl shadow-sm p-7 flex flex-col justify-between hover:shadow-md transition group"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: COLOR.teal }}>
            최근사용 테스트
          </p>
          {recentQuiz
            ? <p className="text-2xl font-extrabold group-hover:opacity-70 transition" style={{ color: COLOR.navy }}>최근 점수: {recentQuiz.score}점</p>
            : <p className="text-lg text-gray-300 font-bold">아직 없어요</p>
          }
        </div>
        <p className="text-sm text-gray-400 mt-4">다시 도전하기 →</p>
      </Link>
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
    handleAttendance,
  } = useMainPage()

  return (
    <div className="h-[calc(100vh-72px)] p-5 grid grid-cols-[1fr_2fr] gap-5">

      {/* 좌측: 캐릭터 카드 */}
      <CharacterPreview />

      {/* 우측: 3행 레이아웃 */}
      <div className="grid grid-rows-[auto_1fr_auto] gap-5 min-h-0">

        {/* 1행: 스트릭 + 출석체크 */}
        <StreakBar
          last7Days={last7Days}
          today={today}
          streak={streak}
          checkedToday={checkedToday}
          loading={loading}
          rewardMsg={rewardMsg}
          onAttendance={handleAttendance}
        />

        {/* 2행: 최근 단어장 + 최근 테스트 */}
        <RecentCards recentWordbook={recentWordbook} recentQuiz={recentQuiz} />

        {/* 3행: PDF 업로드 */}
        <div className="bg-white rounded-2xl shadow-sm px-7 py-5">
          <p className="text-lg font-extrabold mb-1" style={{ color: COLOR.navy }}>📄 PDF 업로드</p>
          <p className="text-xs text-gray-400 mb-3">전공 PDF를 업로드하면 AI가 핵심 단어를 자동 추출합니다.</p>
          <PdfUploadBar
            wordbookCount={wordbookCount}
            onComplete={() => setWordbookCount(c => c + 1)}
          />
        </div>

      </div>
    </div>
  )
}
