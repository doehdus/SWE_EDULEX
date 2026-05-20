import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

const TODAY = () => new Date().toISOString().split('T')[0]

// 오늘 기준 52주 전 월요일 계산 (잔디 그리드 시작점)
function getGridStartDate() {
  const d = new Date()
  d.setDate(d.getDate() - 364)
  // 일요일(0) 시작으로 맞추기
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return d
}

export function useDashboard() {
  const { user } = useAuth()

  // 진행률
  const [progressList, setProgressList] = useState([])
  const [progressLoading, setProgressLoading] = useState(true)

  // 출석
  const [attendedDates, setAttendedDates] = useState([])
  const [streak, setStreak] = useState(0)
  const [checkedToday, setCheckedToday] = useState(false)
  const [attendanceLoading, setAttendanceLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [toast, setToast] = useState(null) // { message: string }

  // ── 연간 출석 기록 로드 ────────────────────────────────────────
  const fetchAnnualAttendance = useCallback(async () => {
    if (!user) return
    setAttendanceLoading(true)

    const startDate = getGridStartDate().toISOString().split('T')[0]
    const today = TODAY()

    // get_annual_attendance RPC 호출 (BE 제공 예정)
    const { data, error } = await supabase.rpc('get_annual_attendance', {
      p_user_id: user.id,
      p_start_date: startDate,
      p_end_date: today,
    })

    if (error) {
      // RPC가 아직 없을 경우 fallback: attendance 테이블 직접 조회
      const { data: fallback, error: fallbackError } = await supabase
        .from('attendance')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', today)
      if (fallbackError) {
        console.error(fallbackError)
        setAttendanceLoading(false)
        return
      }
      const dates = (fallback ?? []).map(r => r.date)
      setAttendedDates(dates)
      setCheckedToday(dates.includes(today))
      setAttendanceLoading(false)
      return
    }

    // RPC 응답: { date: string, attended: boolean }[]
    const dates = (data ?? []).filter(r => r.attended).map(r => r.date)
    setAttendedDates(dates)
    setCheckedToday(dates.includes(today))
    setAttendanceLoading(false)
  }, [user])

  // ── 연속 출석 일수 계산 ────────────────────────────────────────
  const fetchStreak = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('attendance')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(400)

    if (error) { console.error(error); return }
    if (!data || data.length === 0) { setStreak(0); return }

    const today = TODAY()
    let count = 0
    let cursor = new Date(today)

    for (const { date } of data) {
      const d = new Date(date)
      const diff = Math.round((cursor - d) / 86400000)
      if (diff > 1) break
      count++
      cursor = d
    }
    setStreak(count)
  }, [user])

  // ── 출석 체크 ─────────────────────────────────────────────────
  const handleCheckIn = useCallback(async () => {
    if (checkedToday || checkingIn || !user) return
    setCheckingIn(true)

    const { data, error } = await supabase.rpc('check_attendance', {
      p_user_id: user.id,
    })

    if (error) {
      console.error(error)
      setCheckingIn(false)
      return
    }

    const today = TODAY()
    setCheckedToday(true)
    setAttendedDates(prev => [...prev, today])
    setStreak(s => s + 1)

    // 책갈피 보상 메시지 (BE 응답에 bookmark_gained 포함 시 활용)
    const gained = data?.bookmark_gained ?? 100
    setToast({ message: `책갈피 ${gained}개 획득!` })
    setCheckingIn(false)
  }, [checkedToday, checkingIn, user])

  const dismissToast = useCallback(() => setToast(null), [])

  // ── 학습 진행률 ───────────────────────────────────────────────
  const fetchProgress = useCallback(async () => {
    if (!user) return
    setProgressLoading(true)

    const [{ data: officialWbs, error: e1 }, { data: myWbs, error: e2 }] = await Promise.all([
      supabase.from('official_wordbooks').select('id, title, major'),
      supabase.from('user_wordbooks').select('id, title').eq('user_id', user.id),
    ])

    if (e1) console.error(e1)
    if (e2) console.error(e2)

    const allWbs = [
      ...(officialWbs ?? []).map(w => ({ ...w, type: 'official' })),
      ...(myWbs ?? []).map(w => ({ ...w, type: 'user' })),
    ]

    const results = await Promise.all(
      allWbs.map(async (wb) => {
        const table = wb.type === 'official' ? 'official_words' : 'user_words'
        const { count: total, error: e3 } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true })
          .eq('wordbook_id', wb.id)

        if (e3) console.error(e3)

        const { count: completed, error: e4 } = await supabase
          .from('word_progress')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('wordbook_id', wb.id)
          .eq('is_completed', true)

        if (e4) console.error(e4)

        const percent = total > 0 ? Math.round(((completed ?? 0) / total) * 100) : 0
        return { ...wb, total: total ?? 0, completed: completed ?? 0, percent }
      })
    )

    setProgressList(results)
    setProgressLoading(false)
  }, [user])

  useEffect(() => {
    fetchAnnualAttendance()
    fetchStreak()
    fetchProgress()
  }, [fetchAnnualAttendance, fetchStreak, fetchProgress])

  return {
    // 진행률
    progressList,
    progressLoading,
    // 출석
    attendedDates,
    streak,
    checkedToday,
    attendanceLoading,
    checkingIn,
    toast,
    handleCheckIn,
    dismissToast,
    getGridStartDate,
  }
}
