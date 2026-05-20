import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { useReward } from '../context/RewardContext'

const todayStr = () => new Date().toISOString().split('T')[0]

function getGridStartDate() {
  const d = new Date()
  d.setDate(d.getDate() - 364)
  d.setDate(d.getDate() - d.getDay()) // 일요일 시작
  return d
}

export function useMainPage() {
  const { user } = useAuth()
  const reward = useReward()
  const [wordbookCount, setWordbookCount] = useState(0)
  const [streak, setStreak]               = useState(0)
  const [checkedToday, setCheckedToday]   = useState(false)
  const [attendanceLoading, setAttendanceLoading] = useState(true)
  const [checkingIn, setCheckingIn]       = useState(false)
  const [rewardMsg, setRewardMsg]         = useState('')
  const [recentWordbook, setRecentWordbook] = useState(null)
  const [recentQuiz, setRecentQuiz]       = useState(null)
  const [attendedDates, setAttendedDates] = useState([])

  const fetchAnnualAttendance = useCallback(async () => {
    if (!user) return
    setAttendanceLoading(true)

    const startDate = getGridStartDate().toISOString().split('T')[0]
    const today = todayStr()

    const { data, error } = await supabase.rpc('get_annual_attendance', {
      p_user_id: user.id,
    })

    if (error) {
      // fallback: 직접 조회
      const { data: fallback } = await supabase
        .from('attendance')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', today)
      const dates = (fallback ?? []).map(r => r.date)
      setAttendedDates(dates)
      setCheckedToday(dates.includes(today))
    } else {
      const dates = (data ?? []).filter(r => r.attended).map(r => r.date)
      setAttendedDates(dates)
      setCheckedToday(dates.includes(today))
    }

    setAttendanceLoading(false)
  }, [user])

  const fetchStreak = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.rpc('get_streak_count', { p_user_id: user.id })
    if (data !== null && data !== undefined) {
      setStreak(data)
    }
  }, [user])

  const fetchWordbookCount = useCallback(() =>
    supabase
      .from('user_wordbooks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setWordbookCount(count ?? 0))
  , [user])

  const fetchRecent = useCallback(async () => {
    const { data: wb } = await supabase
      .from('user_wordbooks')
      .select('id, title')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setRecentWordbook(wb)

    const { data: qz } = await supabase
      .from('quiz_results')
      .select('wordbook_id, score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setRecentQuiz(qz)
  }, [user])

  useEffect(() => {
    if (!user) return
    fetchWordbookCount()
    fetchAnnualAttendance()
    fetchStreak()
    fetchRecent()
  }, [user, fetchWordbookCount, fetchAnnualAttendance, fetchStreak, fetchRecent])

  const handleAttendance = useCallback(async () => {
    if (checkedToday || checkingIn || !user) return
    setCheckingIn(true)
    const { data, error } = await supabase.rpc('check_attendance', { p_user_id: user.id })
    if (!error) {
      const today = todayStr()
      setCheckedToday(true)
      setAttendedDates(prev => [...prev, today])
      setStreak(s => s + 1)
      const gained = data?.gained_bookmark ?? 100
      setRewardMsg(`책갈피 ${gained}개 획득!`)
      setTimeout(() => setRewardMsg(''), 2500)
    }
    setCheckingIn(false)
  }, [checkedToday, checkingIn, user])

  return {
    wordbookCount, setWordbookCount,
    streak, checkedToday, attendanceLoading, checkingIn, rewardMsg,
    recentWordbook, recentQuiz,
    attendedDates,
    handleAttendance,
    getGridStartDate,
  }
}
