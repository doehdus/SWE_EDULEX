import { useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { LIB } from '../../constants/theme'

const DURATION = 1500

export default function BookmarkToast({ amount, onDone }) {
  useEffect(() => {
    const id = setTimeout(() => onDone?.(), DURATION)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <div
      className="fixed left-1/2 z-[60] pointer-events-none"
      style={{
        top: '18%',
        transform: 'translateX(-50%)',
        animation: 'bookmarkRise 1.5s ease-out forwards',
      }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl"
        style={{
          background: `linear-gradient(180deg, ${LIB.goldLight} 0%, ${LIB.gold} 100%)`,
          border: `2px solid ${LIB.gold}`,
          color: LIB.ink,
        }}
      >
        <Bookmark size={20} fill={LIB.ink} strokeWidth={2.4} />
        <span className="text-lg font-extrabold">+{amount}</span>
      </div>
    </div>
  )
}
