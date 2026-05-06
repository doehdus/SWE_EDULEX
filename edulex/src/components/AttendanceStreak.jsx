import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

export default function AttendanceStreak() {
  const { user } = useAuth()
  const [checkedToday, setCheckedToday] = useState(false)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(false)
  const [rewardMsg, setRewardMsg] = useState('')

  useEffect(() => {
    if (!user) return
    checkTodayAttendance()
    calculateStreak()
  }, [user])

  const today = () => new Date().toISOString().split('T')[0]

  const checkTodayAttendance = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today())
      .maybeSingle()
    setCheckedToday(!!data)
  }

  const calculateStreak = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30)

    if (!data || data.length === 0) { setStreak(0); return }

    let count = 0
    let cursor = new Date(today())
    for (const { date } of data) {
      const d = new Date(date)
      const diff = (cursor - d) / 86400000
      if (diff > 1) break
      count++
      cursor = d
    }
    setStreak(count)
  }

  const handleAttendance = async () => {
    if (checkedToday || loading) return
    setLoading(true)

    // DB 함수로 출석 + 책갈피 트랜잭션 처리 (SBI-H02)
    const { error } = await supabase.rpc('check_attendance', { p_user_id: user.id })

    if (!error) {
      setCheckedToday(true)
      setStreak(s => s + 1)
      setRewardMsg('+10 책갈피 획득!')
      setTimeout(() => setRewardMsg(''), 2500)
    }
    setLoading(false)
  }

  // 최근 7일 스트릭 시각화
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800">출석 체크</h3>
          <p className="text-xs text-gray-400">연속 {streak}일 출석 중</p>
        </div>
        <button
          onClick={handleAttendance}
          disabled={checkedToday || loading}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition
            ${checkedToday
              ? 'bg-green-100 text-green-600 cursor-default'
              : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
            }`}
        >
          {loading ? '처리 중...' : checkedToday ? '✅ 출석 완료' : '출석하기'}
        </button>
      </div>

      {/* 7일 스트릭 시각화 */}
      <div className="flex gap-1.5">
        {last7Days.map(date => (
          <div
            key={date}
            title={date}
            className={`flex-1 h-2 rounded-full ${date <= today() ? 'bg-[#7c3aed]' : 'bg-gray-100'}`}
          />
        ))}
      </div>

      {rewardMsg && (
        <p className="text-center text-yellow-600 text-sm font-semibold mt-3 animate-bounce">
          ⭐ {rewardMsg}
        </p>
      )}
    </div>
  )
}
