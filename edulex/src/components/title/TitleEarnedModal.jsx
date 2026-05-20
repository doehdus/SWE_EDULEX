import { useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { TITLES, TIER_STYLE } from '../../constants/titles'
import { LIB } from '../../constants/theme'
import TitleBadge from './TitleBadge'

export default function TitleEarnedModal({ titleKey, onClose }) {
  const meta = TITLES[titleKey]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!meta) {
    return null
  }
  const tier = TIER_STYLE[meta.tier]

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[55] p-4">
      <div
        className="rounded-2xl px-8 py-7 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
        style={{
          background: LIB.cream,
          border: `2px solid ${LIB.gold}`,
          animation: 'titleEarnedIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Platinum 풀스크린 반짝임 (0.5s 짧게) */}
        {tier.particle && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.7) 0%, transparent 30%),' +
                'radial-gradient(circle at 70% 40%, rgba(255,255,255,0.5) 0%, transparent 25%),' +
                'radial-gradient(circle at 50% 80%, rgba(255,255,255,0.6) 0%, transparent 30%)',
              animation: 'titleSparkle 0.8s ease-out',
            }}
          />
        )}

        <div className="relative">
          <div className="flex items-center justify-center gap-2 mb-3" style={{ color: LIB.gold }}>
            <Sparkles size={18} strokeWidth={2.6} />
            <span className="text-xs font-extrabold uppercase tracking-widest">
              새로운 칭호 획득!
            </span>
            <Sparkles size={18} strokeWidth={2.6} />
          </div>

          <div className="flex justify-center my-5">
            <TitleBadge titleKey={titleKey} owned size="lg" />
          </div>

          <p className="text-sm font-semibold" style={{ color: LIB.ink }}>
            {meta.name}
          </p>
          <p className="text-xs mt-1" style={{ color: LIB.inkMid }}>
            {meta.description}
          </p>

          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 rounded-xl text-sm font-bold transition hover:opacity-85"
            style={{ background: LIB.wood, color: LIB.parchment }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
