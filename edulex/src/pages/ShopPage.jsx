import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { useCharacter } from '../hooks/useCharacter'
import { useBookmark } from '../hooks/useBookmark'
import { ITEMS, ITEM_SLOT } from '../constants/character'
import { LIB } from '../constants/theme'
import { preloadAllCharacterImages } from '../utils/characterImages'
import { LoadingState } from '../components/ui/StateViews'
import CharacterPanel from '../components/shop/CharacterPanel'
import CategoryTabs from '../components/shop/CategoryTabs'
import ShopItemGrid from '../components/shop/ShopItemGrid'
import PurchaseConfirmModal from '../components/shop/PurchaseConfirmModal'

const ERROR_MESSAGES = {
  insufficient_bookmark: '책갈피가 부족합니다.',
  already_owned: '이미 보유 중인 아이템입니다.',
  invalid_item: '구매할 수 없는 아이템입니다.',
  unauthorized: '인증 오류가 발생했습니다.',
}

const TOAST_DURATION = 3000

export default function ShopPage() {
  const { owned, equipped, loading, equipItem, buyItem } = useCharacter()
  const bookmark = useBookmark()

  const [imagesReady, setImagesReady] = useState(false)
  const [activeCategory, setActiveCategory] = useState('hair')
  const [pendingPurchase, setPendingPurchase] = useState(null)
  const [toast, setToast] = useState({ message: '', visible: false })

  // 스프라이트 프리로드.
  useEffect(() => {
    preloadAllCharacterImages(ITEMS).then(() => setImagesReady(true))
  }, [])

  // 토스트 자동 닫힘.
  useEffect(() => {
    if (!toast.visible) return
    const id = setTimeout(() => setToast({ message: '', visible: false }), TOAST_DURATION)
    return () => clearTimeout(id)
  }, [toast.visible, toast.message])

  const showToast = (message) => setToast({ message, visible: true })

  const handleBuy = (itemId) => {
    setPendingPurchase(itemId)
  }

  const handleConfirmPurchase = async () => {
    const itemId = pendingPurchase
    setPendingPurchase(null)
    if (!itemId) return

    const result = await buyItem(itemId)
    if (result.ok) {
      showToast('구매 완료')
      // UX 개선: 구매 직후 자동 장착.
      // owned state 가 비동기로 갱신되므로 검증 우회 — buyItem 성공이 보유 보증.
      const slot = ITEM_SLOT[itemId]
      if (slot) await equipItem(slot, itemId, { skipOwnedCheck: true })
    } else {
      showToast(ERROR_MESSAGES[result.code] ?? `오류: ${result.code}`)
    }
  }

  const handleEquip = (slot, itemId) => equipItem(slot, itemId)
  const handleUnequip = (slot) => equipItem(slot, null)

  if (loading || !imagesReady) {
    return (
      <div className="min-h-screen" style={{ background: LIB.parchment }}>
        <LoadingState message="상점을 불러오는 중..." />
      </div>
    )
  }

  const pendingPrice = pendingPurchase ? ITEMS[pendingPurchase]?.price ?? 0 : 0

  return (
    <div className="min-h-screen" style={{ background: LIB.parchment }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: LIB.ink }}>
            상점
          </h1>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}
          >
            <Bookmark size={16} fill="currentColor" style={{ color: LIB.gold }} />
            <span className="font-bold text-sm" style={{ color: LIB.gold }}>
              {(bookmark ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 2-컬럼 (lg 이상) / 세로 스택 (모바일) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 좌측: 캐릭터 패널 */}
          <div className="lg:w-[360px] flex-shrink-0">
            <CharacterPanel equipped={equipped} bookmark={bookmark} />
          </div>

          {/* 우측: 카테고리 + 그리드 */}
          <div className="flex-1 flex flex-col gap-4">
            <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />
            <ShopItemGrid
              category={activeCategory}
              owned={owned}
              equipped={equipped}
              userEquipped={equipped}
              bookmark={bookmark}
              onBuy={handleBuy}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
            />
          </div>
        </div>

        {/* 푸터 — LPC 에셋 크레딧 */}
        <p className="mt-10 text-[11px] text-center" style={{ color: LIB.inkLight }}>
          캐릭터 스프라이트: LPC contributors (CC-BY-SA 3.0 외) — 자세한 출처는{' '}
          <a
            href="/CREDITS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-70"
            style={{ color: LIB.wood }}
          >
            CREDITS.md
          </a>{' '}
          참조
        </p>
      </div>

      {/* 구매 확인 모달 */}
      {pendingPurchase && (
        <PurchaseConfirmModal
          itemId={pendingPurchase}
          price={pendingPrice}
          currentBookmark={bookmark}
          onConfirm={handleConfirmPurchase}
          onCancel={() => setPendingPurchase(null)}
        />
      )}

      {/* 토스트 */}
      {toast.visible && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-xl z-50 text-sm font-semibold"
          style={{
            background: LIB.wood,
            color: LIB.parchment,
            border: `1px solid ${LIB.gold}`,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
