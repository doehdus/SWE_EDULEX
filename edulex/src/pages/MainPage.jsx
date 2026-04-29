import CharacterPreview from '../components/CharacterPreview'
import PdfUploadBar from '../components/PdfUploadBar'
import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function MainPage() {
  const { user } = useAuth()
  const [wordbookCount, setWordbookCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [checkedToday, setCheckedToday] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rewardMsg, setRewardMsg] = useState('')
  const [recentWordbook, setRecentWordbook] = useState(null)
  const [recentQuiz, setRecentQuiz] = useState(null)

  const today = () => new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!user) return
    supabase
      .from('user_wordbooks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setWordbookCount(count ?? 0))
    checkTodayAttendance()
    calculateStreak()
    fetchRecent()
  }, [user])

  const checkTodayAttendance = async () => {
    const { data } = await supabase
      .from('attendance').select('id')
      .eq('user_id', user.id).eq('date', today()).maybeSingle()
    setCheckedToday(!!data)
  }

  const calculateStreak = async () => {
    const { data } = await supabase
      .from('attendance').select('date')
      .eq('user_id', user.id).order('date', { ascending: false }).limit(30)
    if (!data || data.length === 0) { setStreak(0); return }
    let count = 0
    let cursor = new Date(today())
    for (const { date } of data) {
      const d = new Date(date)
      if ((cursor - d) / 86400000 > 1) break
      count++; cursor = d
    }
    setStreak(count)
  }

  const fetchRecent = async () => {
    const { data: wb } = await supabase
      .from('user_wordbooks').select('id, title')
      .eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).maybeSingle()
    setRecentWordbook(wb)
    const { data: qz } = await supabase
      .from('quiz_results').select('wordbook_id, score')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    setRecentQuiz(qz)
  }

  const handleAttendance = async () => {
    if (checkedToday || loading) return
    setLoading(true)
    const { error } = await supabase.rpc('check_attendance', { p_user_id: user.id })
    if (!error) {
      setCheckedToday(true); setStreak(s => s + 1)
      setRewardMsg('+10 별가루 획득!')
      setTimeout(() => setRewardMsg(''), 2500)
    }
    setLoading(false)
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  return (
    <div className="h-[calc(100vh-72px)] p-5 grid grid-cols-[1fr_2fr] gap-5">

      {/* 좌측: 캐릭터 카드 — 세로 꽉 채움 */}
      <CharacterPreview />

      {/* 우측: 3행 레이아웃 */}
      <div className="grid grid-rows-[auto_1fr_auto] gap-5 min-h-0">

        {/* 1행: 스트릭 + 출석체크 */}
        <div className="bg-white rounded-2xl shadow-sm px-7 py-5 flex items-center justify-between">
          <div>
            <p className="text-xl font-extrabold text-[#1a3a5c]">🔥 스트릭</p>
            <div className="flex gap-2 mt-3">
              {last7Days.map(date => (
                <div
                  key={date}
                  title={date}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${date <= today() ? 'bg-[#0d9488] text-white' : 'bg-gray-100 text-gray-300'}`}
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
            <p className="text-4xl font-extrabold text-[#0d9488]">{streak}<span className="text-base font-bold text-gray-400 ml-1">일</span></p>
            <button
              onClick={handleAttendance}
              disabled={checkedToday || loading}
              className={`mt-3 px-6 py-2.5 rounded-xl text-sm font-bold transition
                ${checkedToday ? 'bg-green-100 text-green-600 cursor-default' : 'bg-[#1a3a5c] text-white hover:bg-[#0d9488]'}`}
            >
              {loading ? '처리 중...' : checkedToday ? '✅ 출석완료' : '출석 체크'}
            </button>
          </div>
        </div>

        {/* 2행: 최근사용 단어장 + 최근사용 테스트 */}
        <div className="grid grid-cols-2 gap-5 min-h-0">
          <Link
            to="/wordbook/my"
            className="bg-white rounded-2xl shadow-sm p-7 flex flex-col justify-between hover:shadow-md transition group"
          >
            <div>
              <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-3">최근사용 단어장</p>
              {recentWordbook ? (
                <p className="text-2xl font-extrabold text-[#1a3a5c] group-hover:text-[#0d9488] transition leading-snug">
                  {recentWordbook.title}
                </p>
              ) : (
                <p className="text-lg text-gray-300 font-bold">아직 없어요</p>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-4">이어서 학습하기 →</p>
          </Link>

          <Link
            to="/quiz"
            className="bg-white rounded-2xl shadow-sm p-7 flex flex-col justify-between hover:shadow-md transition group"
          >
            <div>
              <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-3">최근사용 테스트</p>
              {recentQuiz ? (
                <p className="text-2xl font-extrabold text-[#1a3a5c] group-hover:text-[#0d9488] transition">
                  최근 점수: {recentQuiz.score}점
                </p>
              ) : (
                <p className="text-lg text-gray-300 font-bold">아직 없어요</p>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-4">다시 도전하기 →</p>
          </Link>
        </div>

        {/* 3행: PDF 업로드 */}
        <div className="bg-white rounded-2xl shadow-sm px-7 py-5">
          <p className="text-lg font-extrabold text-[#1a3a5c] mb-1">📄 PDF 업로드</p>
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
