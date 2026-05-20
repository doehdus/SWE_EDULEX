import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import BookmarkToast from '../components/ui/BookmarkToast'
import TitleEarnedModal from '../components/title/TitleEarnedModal'
import { useAuth } from './AuthContext'

const RewardContext = createContext(null)

// 보상 큐 — 책갈피 토스트(자동 dismiss) → 칭호 모달(클릭 dismiss) 순차 처리.
// RPC 응답(jsonb) 의 gained_bookmark / earned_titles 를 한 번에 push 하면
// 토스트가 먼저 떠오르고, 끝나면 모달이 뜬다.
export function RewardProvider({ children }) {
  const { fetchProfile, user } = useAuth()
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)

  // 다음 아이템 dequeue.
  useEffect(() => {
    if (current === null && queue.length > 0) {
      setCurrent(queue[0])
      setQueue((q) => q.slice(1))
    }
  }, [current, queue])

  const dismiss = useCallback(() => setCurrent(null), [])

  const pushBookmark = useCallback((amount) => {
    if (!amount || amount <= 0) return
    setQueue((q) => [...q, { type: 'bookmark', amount }])
  }, [])

  const pushTitle = useCallback((titleKey) => {
    if (!titleKey) return
    setQueue((q) => [...q, { type: 'title', titleKey }])
  }, [])

  // RPC 응답 통합 처리 — { gained_bookmark, earned_titles, ... }
  const pushFromRpcResponse = useCallback(
    (data) => {
      if (!data) return
      const items = []
      if (typeof data.gained_bookmark === 'number' && data.gained_bookmark > 0) {
        items.push({ type: 'bookmark', amount: data.gained_bookmark })
      }
      if (Array.isArray(data.earned_titles)) {
        for (const key of data.earned_titles) {
          if (key) items.push({ type: 'title', titleKey: key })
        }
      }
      if (items.length === 0) return
      setQueue((q) => [...q, ...items])

      // 신규 칭호가 있으면 프로필 새로고침 — TitleSelectModal 의 owned set 갱신.
      if (items.some((i) => i.type === 'title') && fetchProfile && user?.id) {
        fetchProfile(user.id)
      }
    },
    [fetchProfile, user?.id],
  )

  return (
    <RewardContext.Provider value={{ pushBookmark, pushTitle, pushFromRpcResponse }}>
      {children}
      {current?.type === 'bookmark' && (
        <BookmarkToast amount={current.amount} onDone={dismiss} />
      )}
      {current?.type === 'title' && (
        <TitleEarnedModal titleKey={current.titleKey} onClose={dismiss} />
      )}
    </RewardContext.Provider>
  )
}

export function useReward() {
  const ctx = useContext(RewardContext)
  if (!ctx) {
    // RewardProvider 외부에서 호출되면 no-op 으로 안전하게 동작.
    return {
      pushBookmark: () => {},
      pushTitle: () => {},
      pushFromRpcResponse: () => {},
    }
  }
  return ctx
}
