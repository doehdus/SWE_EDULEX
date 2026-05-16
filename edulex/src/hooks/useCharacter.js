import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import {
  DEFAULT_EQUIPPED,
  ITEM_SLOT,
  MANDATORY_SLOTS,
} from '../constants/character'

export function useCharacter() {
  const { user, fetchProfile } = useAuth()
  const [owned, setOwned] = useState(new Set())
  const [equipped, setEquipped] = useState(DEFAULT_EQUIPPED)
  const [loading, setLoading] = useState(true)

  const fetchCharacter = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('owned_items, equipped_items')
      .eq('id', user.id)
      .single()
    if (error) {
      console.error(error)
      setLoading(false)
      return
    }
    if (data?.owned_items) setOwned(new Set(data.owned_items))
    if (data?.equipped_items) setEquipped(data.equipped_items)
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchCharacter()
  }, [fetchCharacter])

  const equipItem = useCallback(
    // skipOwnedCheck: 직전 구매 직후 자동 장착 시 사용. owned state 가 React 비동기
    // 업데이트로 인해 새 아이템을 아직 반영하지 못한 closure 단계에서 검증을 우회.
    async (slot, itemId, { skipOwnedCheck = false } = {}) => {
      if (!user?.id) return

      // 필수 슬롯은 해제(null) 차단.
      if (itemId === null && MANDATORY_SLOTS.has(slot)) {
        console.warn('필수 슬롯은 해제 불가')
        return
      }
      // 보유 여부 + 슬롯 일치 검증.
      if (itemId !== null) {
        if (!skipOwnedCheck && !owned.has(itemId)) {
          console.warn(`[useCharacter] 미보유 아이템: ${itemId}`)
          return
        }
        if (ITEM_SLOT[itemId] !== slot) {
          console.warn(
            `[useCharacter] 슬롯 불일치: ${itemId} → ${ITEM_SLOT[itemId]} (요청 슬롯: ${slot})`,
          )
          return
        }
      }

      const newEquipped = { ...equipped, [slot]: itemId }
      const { error } = await supabase
        .from('users')
        .update({ equipped_items: newEquipped })
        .eq('id', user.id)
      if (error) {
        console.error(error)
        return
      }
      setEquipped(newEquipped)
    },
    [user?.id, owned, equipped],
  )

  // SH-06 — purchase_item RPC 호출. 성공 시 owned 갱신 + AuthContext bookmark 동기화.
  const buyItem = useCallback(
    async (itemId) => {
      if (!user?.id) return { ok: false, code: 'unauthorized' }

      const { data, error } = await supabase.rpc('purchase_item', {
        p_user_id: user.id,
        p_item_id: itemId,
      })
      if (error) {
        console.error('[useCharacter] buyItem error:', error)
        return { ok: false, code: error.message }
      }

      if (data?.owned_items) setOwned(new Set(data.owned_items))
      if (fetchProfile) await fetchProfile(user.id)

      return {
        ok: true,
        newBookmark: data?.new_bookmark,
        ownedItems: data?.owned_items,
      }
    },
    [user?.id, fetchProfile],
  )

  return {
    owned,
    equipped,
    loading,
    fetchCharacter,
    equipItem,
    buyItem,
  }
}
