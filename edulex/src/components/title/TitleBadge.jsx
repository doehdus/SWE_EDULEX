import * as Icons from 'lucide-react'
import { TITLES, TIER_STYLE, LOCKED_CATEGORIES } from '../../constants/titles'
import { LIB } from '../../constants/theme'

// 단일 칭호 카드 — 모달 그리드 / 미리보기 등에서 재사용.
// size: 'sm' (40h, 모달 그리드), 'md' (56h), 'lg' (80h, 획득 모달)
const SIZE_MAP = {
  sm: { padX: 10, padY: 6,  font: 11, iconSize: 12 },
  md: { padX: 14, padY: 8,  font: 13, iconSize: 14 },
  lg: { padX: 24, padY: 14, font: 18, iconSize: 22 },
}

export default function TitleBadge({
  titleKey,
  owned = false,
  active = false,
  size = 'sm',
  onClick,
  showCondition = false,
}) {
  const meta = TITLES[titleKey]
  if (!meta) return null

  const tier = TIER_STYLE[meta.tier]
  const sz = SIZE_MAP[size] ?? SIZE_MAP.sm
  const locked = meta.locked || LOCKED_CATEGORIES.has(meta.category)
  const clickable = !!onClick && !locked
  const IconCmp = Icons[meta.icon] ?? Icons.Award

  // 비활성(미보유) — grayscale + opacity.
  const dimmed = !owned && !active

  const baseStyle = {
    background: tier.background,
    border: active ? `2px solid ${LIB.gold}` : tier.border,
    color: tier.color,
    padding: `${sz.padY}px ${sz.padX}px`,
    fontSize: sz.font,
    boxShadow: owned ? tier.glow : 'none',
    animation: owned ? tier.animation : 'none',
    opacity: dimmed ? 0.42 : 1,
    filter: dimmed ? 'grayscale(0.6)' : 'none',
    cursor: clickable ? 'pointer' : (locked ? 'not-allowed' : 'default'),
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s',
  }

  return (
    <div
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : -1}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={`relative inline-flex items-center gap-2 rounded-full font-bold select-none ${
        clickable ? 'hover:scale-[1.03] active:scale-[0.98]' : ''
      }`}
      style={baseStyle}
      title={meta.description}
    >
      {/* Platinum 파티클 */}
      {tier.particle && owned && size !== 'sm' && (
        <>
          <span
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{
              background: '#fff',
              boxShadow: '0 0 6px #fff',
              animation: 'titleSparkle 2.2s ease-in-out infinite',
            }}
          />
          <span
            className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full"
            style={{
              background: '#fff',
              boxShadow: '0 0 5px #fff',
              animation: 'titleSparkle 2.6s ease-in-out 0.5s infinite',
            }}
          />
        </>
      )}

      <IconCmp size={sz.iconSize} strokeWidth={2.4} />
      <span className="whitespace-nowrap">{meta.name}</span>

      {/* 잠금 카테고리 */}
      {locked && (
        <Icons.Lock size={sz.iconSize - 2} strokeWidth={2.5} style={{ opacity: 0.6 }} />
      )}

      {/* 활성 표시 (체크) */}
      {active && !locked && (
        <Icons.Check size={sz.iconSize} strokeWidth={2.8} style={{ color: LIB.deepRed }} />
      )}

      {/* 조건 텍스트 (lg 사이즈 / 획득 모달에서만) */}
      {showCondition && (
        <span
          className="ml-2 text-xs font-medium"
          style={{ color: LIB.inkMid, fontSize: sz.font - 3 }}
        >
          {meta.description}
        </span>
      )}
    </div>
  )
}
