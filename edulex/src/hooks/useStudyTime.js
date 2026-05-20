import { useState, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export function useStudyTime(userId) {
  const [dailyData, setDailyData] = useState([])
  const [loading, setLoading] = useState(false)

  const startSession = useCallback(async (sessionType) => {
    if (!userId) return null
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({ user_id: userId, session_type: sessionType })
      .select('id')
      .single()
    if (error) return null
    return data.id
  }, [userId])

  const endSession = useCallback(async (sessionId) => {
    if (!sessionId) return
    await supabase
      .from('study_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId)
  }, [])

  const fetchDailyStudyTime = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase.rpc('get_daily_study_time', {
      p_user_id: userId,
      p_days: 7,
    })
    if (!error) setDailyData(data ?? [])
    setLoading(false)
  }, [userId])

  return { dailyData, loading, startSession, endSession, fetchDailyStudyTime }
}
