import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

const todayStr = () => new Date().toISOString().split('T')[0]

export function useMainPage() {
  const { user } = useAuth()
  const [wordbookCount, setWordbookCount] = useState(0)
  const [streak, setStreak]               = useState(0)
  const [checkedToday, setCheckedToday]   = useState(false)
  const [loading, setLoading]             = useState(false)
  const [rewardMsg, setRewardMsg]         = useState('')
  const [recentWordbook, setRecentWordbook] = useState(null)
  const [recentQuiz, setRecentQuiz]       = useState(null)

  useEffect(() => {
    if (!user) return
    fetchWordbookCount()
    checkTodayAttendance()
    calculateStreak()
    fetchRecent()
  }, [user])

  const fetchWordbookCount = () =>
    supabase
      .from('user_wordbooks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setWordbookCount(count ?? 0))

  const checkTodayAttendance = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', todayStr())
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

    let count  = 0
    let cursor = new Date(todayStr())
    for (const { date } of data) {
      const d = new Date(date)
      if ((cursor - d) / 86400000 > 1) break
      count++
      cursor = d
    }
    setStreak(count)
  }

  const fetchRecent = async () => {
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
  }

  const handleAttendance = async () => {
    if (checkedToday || loading) return
    setLoading(true)
    const { error } = await supabase.rpc('check_attendance', { p_user_id: user.id })
    if (!error) {
      setCheckedToday(true)
      setStreak(s => s + 1)
      setRewardMsg('+10 별가루 획득!')
      setTimeout(() => setRewardMsg(''), 2500)
    }
    setLoading(false)
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  return {
    wordbookCount, setWordbookCount,
    streak, checkedToday, loading, rewardMsg,
    recentWordbook, recentQuiz,
    last7Days, today: todayStr,
    handleAttendance,
  }
}
