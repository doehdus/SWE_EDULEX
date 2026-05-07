import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

export function useBookmark() {
  const { user } = useAuth()
  const [bookmark, setBookmark] = useState(null)

  useEffect(() => {
    if (!user) return

    // 초기값 로드
    supabase
      .from('users')
      .select('bookmark')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setBookmark(data?.bookmark ?? 0))

    // Supabase Realtime 구독 — 책갈피 변경 실시간 반영 (SBI-H05)
    const channel = supabase
      .channel(`star-dust-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setBookmark(payload.new.bookmark)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  return bookmark
}
