import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

// 칭호 보유 / 활성 칭호 / 선택 — 단일 인터페이스.
export function useTitles() {
  const { user, profile, fetchProfile } = useAuth()
  const [owned, setOwned] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('user_titles')
      .select('title_key')
      .eq('user_id', user.id)
    if (!error && data) {
      setOwned(new Set(data.map((r) => r.title_key)))
    } else if (error) {
      console.error('[useTitles] fetch error:', error)
    }
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    refresh()
  }, [refresh])

  // 활성 칭호 변경 — users.active_title 직접 UPDATE (RLS 보호).
  // titleKey = null 이면 "선택 해제".
  const selectTitle = useCallback(
    async (titleKey) => {
      if (!user?.id) return { ok: false }
      // 미보유 칭호 차단.
      if (titleKey !== null && !owned.has(titleKey)) {
        return { ok: false, code: 'not_owned' }
      }
      const { error } = await supabase
        .from('users')
        .update({ active_title: titleKey })
        .eq('id', user.id)
      if (error) {
        console.error('[useTitles] selectTitle error:', error)
        return { ok: false, code: error.message }
      }
      if (fetchProfile) await fetchProfile(user.id)
      return { ok: true }
    },
    [user?.id, owned, fetchProfile],
  )

  return {
    owned,
    activeTitle: profile?.active_title ?? null,
    loading,
    selectTitle,
    refresh,
  }
}
