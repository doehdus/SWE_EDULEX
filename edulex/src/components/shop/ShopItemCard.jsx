import { useMemo, useState } from 'react'
import { Bookmark } from 'lucide-react'
import CharacterCanvas from '../CharacterCanvas'
import { ITEMS, MANDATORY_SLOTS, CATEGORY_DIRECTION } from '../../constants/character'
import { LIB, COLOR } from '../../constants/theme'

// 미리보기용 equipped — 사용자의 현재 장착을 기반으로 해당 슬롯만 itemId 로 교체.
function buildPreviewEquipped(itemId, slot, userEquipped) {
  return { ...userEquipped, [slot]: itemId }
}

export default function ShopItemCard({
  itemId,
  category,
  price,
  owned,
  equipped,
  userEquipped,
  canAfford,
  onBuy,
  onEquip,
  onUnequip,
}) {
  const [hovered, setHovered] = useState(false)
  const [btnHover, setBtnHover] = useState(false)
  const [btnPress, setBtnPress] = useState(false)

  const previewEquipped = useMemo(
    () => buildPreviewEquipped(itemId, category, userEquipped),
    [itemId, category, userEquipped],
  )

  const cardDirection = CATEGORY_DIRECTION[category] ?? 2
  const label = ITEMS[itemId]?.label ?? itemId
  const isMandatorySlot = MANDATORY_SLOTS.has(category)

  // 액션 버튼 — 상태별 분기.
  const renderAction = () => {
    if (!owned) {
      if (canAfford) {
        return (
          <button
            onClick={() => onBuy(itemId)}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => { setBtnHover(false); setBtnPress(false) }}
            onMouseDown={() => setBtnPress(true)}
            onMouseUp={() => setBtnPress(false)}
            className="w-full py-2 rounded-xl text-sm font-bold"
            style={{
              background: btnPress ? LIB.wood : btnHover ? LIB.gold : LIB.goldLight,
              color: btnPress ? LIB.parchment : LIB.ink,
              transform: btnPress ? 'scale(0.96)' : btnHover ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.15s cubic-bezier(.34,1.56,.64,1), background 0.15s ease',
            }}
          >
            구매
          </button>
        )
      }
      return (
        <button
          disabled
          className="w-full py-2 rounded-xl text-sm font-bold cursor-not-allowed"
          style={{ background: '#d1d5db', color: '#6b7280' }}
        >
          책갈피 부족
        </button>
      )
    }

    // 보유 중
    if (equipped) {
      return (
        <div className="flex gap-2">
          <span
            className="flex-1 py-2 rounded-xl text-xs font-bold text-center"
            style={{ background: LIB.parchmentDark, color: LIB.wood }}
          >
            장착 중
          </span>
          {!isMandatorySlot && (
            <button
              onClick={() => onUnequip(category)}
              className="px-3 py-2 rounded-xl text-xs font-bold transition hover:opacity-80"
              style={{ background: LIB.inkLight, color: LIB.parchment }}
            >
              해제
            </button>
          )}
        </div>
      )
    }
    return (
      <button
        onClick={() => onEquip(category, itemId)}
        className="w-full py-2 rounded-xl text-sm font-bold transition hover:opacity-90"
        style={{ background: COLOR.teal, color: '#fff' }}
      >
        장착
      </button>
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: LIB.cream,
        border: `1px solid ${LIB.shelfLine}`,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 10px 28px rgba(92,58,30,0.20)'
          : '0 2px 8px rgba(92,58,30,0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* 미니 캐릭터 썸네일 */}
      <div className="flex justify-center">
        <CharacterCanvas equipped={previewEquipped} size={96} direction={cardDirection} frameIndex={0} />
      </div>

      {/* 라벨 + 가격 */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold truncate" style={{ color: LIB.ink }}>
          {label}
        </p>
        <p className="text-xs flex items-center gap-1" style={{ color: LIB.inkMid }}>
          <Bookmark size={11} fill="currentColor" style={{ color: LIB.gold }} />
          {price.toLocaleString()}
        </p>
      </div>

      {/* 액션 */}
      {renderAction()}
    </div>
  )
}
