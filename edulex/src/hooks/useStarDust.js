import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

export function useStarDust() {
  const { user } = useAuth()
  const [starDust, setStarDust] = useState(null)

  useEffect(() => {
    if (!user) return

    // 초기값 로드
    supabase
      .from('users')
      .select('star_dust')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setStarDust(data?.star_dust ?? 0))

    // Supabase Realtime 구독 — star_dust 변경 실시간 반영 (SBI-H05)
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
          setStarDust(payload.new.star_dust)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  return starDust
}
