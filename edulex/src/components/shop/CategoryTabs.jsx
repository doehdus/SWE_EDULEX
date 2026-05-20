import { LIB } from '../../constants/theme'

const CATEGORIES = [
  { key: 'hair',   label: '머리' },
  { key: 'outfit', label: '의상' },
  { key: 'hat',    label: '모자' },
  { key: 'bag',    label: '가방' },
  { key: 'wings',  label: '날개' },
]

export default function CategoryTabs({ activeCategory, onChange }) {
  return (
    <div
      className="flex gap-1 p-1.5 rounded-xl overflow-x-auto"
      style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}
    >
      {CATEGORIES.map(({ key, label }) => {
        const active = activeCategory === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex-1 min-w-[64px] px-4 py-2 rounded-lg text-sm font-semibold transition"
            style={{
              background: active ? LIB.gold : 'transparent',
              color: active ? LIB.ink : LIB.inkMid,
              transition: 'background 0.18s ease, color 0.18s ease',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
