import { useState, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export function useRanking(user) {
  const [topUsers, setTopUsers] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchRanking = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [topResult, myBookmarkResult] = await Promise.all([
      supabase
        .from('users')
        .select('id, nickname, bookmark, active_title')
        .order('bookmark', { ascending: false })
        .limit(10),
      supabase
        .from('users')
        .select('bookmark')
        .eq('id', user.id)
        .single(),
    ])

    if (!topResult.error) setTopUsers(topResult.data ?? [])

    if (!myBookmarkResult.error && myBookmarkResult.data) {
      const myBookmark = myBookmarkResult.data.bookmark ?? 0
      const { count, error } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gt('bookmark', myBookmark)
      if (!error) setMyRank((count ?? 0) + 1)
    }

    setLoading(false)
  }, [user])

  const isInTop10 = topUsers.some(u => u.id === user?.id)

  return { topUsers, myRank, loading, isInTop10, fetchRanking }
}
