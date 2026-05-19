import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export function useWordbookAchievement(userId, wordbookId) {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!userId || !wordbookId) { setProgress(null); return }
    setLoading(true)
    const { data } = await supabase.rpc('get_wordbook_progress', {
      p_user_id:     userId,
      p_wordbook_id: wordbookId,
    })
    setProgress(data)
    setLoading(false)
  }, [userId, wordbookId])

  useEffect(() => { refetch() }, [refetch])

  return { progress, loading, refetch }
}
