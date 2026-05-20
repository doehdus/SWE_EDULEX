import { Bookmark } from 'lucide-react'
import { ITEMS } from '../../constants/character'
import { LIB } from '../../constants/theme'

export default function PurchaseConfirmModal({
  itemId,
  price,
  currentBookmark,
  onConfirm,
  onCancel,
}) {
  const label = ITEMS[itemId]?.label ?? itemId
  const after = (currentBookmark ?? 0) - price

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}
      >
        <h3 className="text-lg font-bold mb-1" style={{ color: LIB.ink }}>
          {label}
        </h3>
        <p className="text-sm mb-4" style={{ color: LIB.inkMid }}>
          이 아이템을 구매하시겠습니까?
        </p>

        {/* 책갈피 변화 시각화 */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
          style={{ background: LIB.parchment, border: `1px solid ${LIB.shelfLine}` }}
        >
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: LIB.inkLight }}>
            책갈피
          </span>
          <span className="flex items-center gap-2 text-sm font-bold" style={{ color: LIB.ink }}>
            <Bookmark size={13} fill="currentColor" style={{ color: LIB.gold }} />
            {(currentBookmark ?? 0).toLocaleString()}
            <span style={{ color: LIB.inkLight }}>→</span>
            <span style={{ color: after < 0 ? '#ef4444' : LIB.gold }}>
              {after.toLocaleString()}
            </span>
          </span>
        </div>

        <p className="text-xs mb-5" style={{ color: LIB.inkLight }}>
          구매한 아이템은 영구 귀속됩니다.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl border transition hover:opacity-70"
            style={{ color: LIB.inkLight, borderColor: LIB.shelfLine, background: 'white' }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold rounded-xl transition hover:opacity-90"
            style={{ background: LIB.gold, color: LIB.ink }}
          >
            구매
          </button>
        </div>
      </div>
    </div>
  )
}
