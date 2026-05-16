import { useEffect, useState } from 'react'
import { Bookmark, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import CharacterCanvas from '../CharacterCanvas'
import { ITEMS } from '../../constants/character'
import { LIB } from '../../constants/theme'

const SLOT_LABELS = {
  hair: '머리',
  outfit: '의상',
  hat: '모자',
  bag: '가방',
  wings: '날개',
}

// 9프레임 walk 사이클 (Phase 1 검증 페이지와 동일 — 120ms)
const FRAME_COUNT = 9
const FRAME_INTERVAL = 120

// direction: 0=UP, 1=LEFT, 2=DOWN, 3=RIGHT
const DPAD = [
  { dir: 0, Icon: ChevronUp,    style: { gridColumn: 2, gridRow: 1 } },
  { dir: 1, Icon: ChevronLeft,  style: { gridColumn: 1, gridRow: 2 } },
  { dir: 2, Icon: ChevronDown,  style: { gridColumn: 2, gridRow: 3 } },
  { dir: 3, Icon: ChevronRight, style: { gridColumn: 3, gridRow: 2 } },
]

export default function CharacterPanel({ equipped, bookmark }) {
  const [frame, setFrame] = useState(0)
  const [direction, setDirection] = useState(2)

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % FRAME_COUNT)
    }, FRAME_INTERVAL)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: LIB.cream,
        border: `1px solid ${LIB.shelfLine}`,
        boxShadow: '0 2px 8px rgba(92,58,30,0.08)',
      }}
    >
      {/* 캐릭터 */}
      <div className="flex justify-center">
        <CharacterCanvas
          equipped={equipped}
          frameIndex={frame}
          direction={direction}
          size={256}
        />
      </div>

      {/* D-pad — 방향 전환 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 36px)',
          gridTemplateRows: 'repeat(3, 36px)',
          gap: 4,
          justifyContent: 'center',
        }}
      >
        {DPAD.map(({ dir, Icon, style }) => (
          <button
            key={dir}
            onClick={() => setDirection(dir)}
            style={{
              ...style,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              border: `1px solid ${LIB.shelfLine}`,
              background: direction === dir ? LIB.gold : LIB.parchment,
              color: direction === dir ? LIB.ink : LIB.inkMid,
              cursor: 'pointer',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
            aria-label={['위', '왼쪽', '아래', '오른쪽'][dir]}
          >
            <Icon size={18} strokeWidth={2.5} />
          </button>
        ))}
      </div>

      {/* 보유 책갈피 */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: LIB.parchment, border: `1px solid ${LIB.shelfLine}` }}
      >
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: LIB.inkLight }}>
          보유 책갈피
        </span>
        <span className="text-base font-extrabold flex items-center gap-1" style={{ color: LIB.gold }}>
          <Bookmark size={14} fill="currentColor" />
          {bookmark ?? '—'}
        </span>
      </div>

      {/* 장착 슬롯 요약 */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: LIB.wood }}>
          장착 중
        </p>
        <div className="flex flex-col gap-1.5">
          {Object.entries(SLOT_LABELS).map(([slot, label]) => {
            const id = equipped?.[slot]
            const itemLabel = id ? (ITEMS[id]?.label ?? id) : '(없음)'
            return (
              <div
                key={slot}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                style={{ background: LIB.parchment }}
              >
                <span className="font-semibold" style={{ color: LIB.inkMid }}>{label}</span>
                <span style={{ color: id ? LIB.ink : LIB.inkLight }}>{itemLabel}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
