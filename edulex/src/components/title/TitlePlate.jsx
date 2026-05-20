import { TITLES, LOCKED_CATEGORIES } from '../../constants/titles'

// 캐릭터 머리 위 명패 — LPC 픽셀 아트 캐릭터와 어울리는 픽셀 스타일.
// 디자인 원칙:
//   - 그라데이션 없음 (단색 + 단순 톤 분리)
//   - 외곽선 2px 단색 (블러 없음)
//   - 드롭 섀도 2px offset 0 blur (NES 풍 하드 섀도)
//   - 코너 반경 2px (거의 사각)
//   - 모노스페이스 폰트
//   - 파티클은 픽셀 정사각형 (4×4)
const PIXEL_TIER = {
  bronze: {
    bg: '#a67137',
    border: '#3a1f08',
    shadow: '#2c1a0e',
    text: '#fff5e0',
    glow: null,
    animation: null,
    particle: false,
  },
  silver: {
    bg: '#c8c8c8',
    border: '#4a4a4a',
    shadow: '#2a2a2a',
    text: '#1a1a1a',
    glow: null,
    animation: null,
    particle: false,
  },
  gold: {
    bg: '#e8c845',
    border: '#5a3a08',
    shadow: '#3a2810',
    text: '#2c1a0e',
    glow: '0 0 6px rgba(232,200,69,0.65)',
    animation: 'titleGlow 4s ease-in-out infinite',
    particle: false,
  },
  platinum: {
    bg: '#d6e2f5',
    border: '#3a4a7a',
    shadow: '#2a3a5a',
    text: '#15294a',
    glow: '0 0 6px rgba(170,200,255,0.75)',
    animation: 'titleFloat 1.5s ease-in-out infinite',
    particle: true,
  },
}

export default function TitlePlate({ titleKey, charSize = 80 }) {
  const meta = titleKey ? TITLES[titleKey] : null
  if (!meta) return null
  if (LOCKED_CATEGORIES.has(meta.category)) return null

  const tier = PIXEL_TIER[meta.tier] ?? PIXEL_TIER.bronze

  // 폰트 사이즈: charSize 의 ~15%, 10~14px.
  const fontSize = Math.min(14, Math.max(10, Math.floor(charSize * 0.15)))
  const padX = Math.max(8, Math.floor(fontSize * 0.9))
  const padY = Math.max(3, Math.floor(fontSize * 0.35))
  // LPC 스프라이트는 프레임 상단 ~12% 가 머리카락이 시작되는 빈 공간.
  // 명패 하단이 머리카락 위에 거의 닿도록 — plate bottom ≈ charSize * 13% 위치.
  const plateH = fontSize + padY * 2 + 4 // 보더 2×2 포함 근사
  const liftY = Math.max(2, plateH - Math.floor(charSize * 0.13))

  // 픽셀 드롭 섀도 (no blur).
  const baseShadow = `2px 2px 0 ${tier.shadow}`
  const composedShadow = tier.glow ? `${baseShadow}, ${tier.glow}` : baseShadow

  return (
    <div
      style={{
        position: 'absolute',
        left: charSize / 2,
        top: -liftY,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div
        style={{
          background: tier.bg,
          border: `2px solid ${tier.border}`,
          color: tier.text,
          padding: `${padY}px ${padX}px`,
          borderRadius: 2,
          fontFamily: '"Courier New", "Consolas", monospace',
          fontSize,
          fontWeight: 800,
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
          lineHeight: 1.05,
          boxShadow: composedShadow,
          animation: tier.animation ?? 'none',
          textShadow: '1px 1px 0 rgba(0,0,0,0.18)',
          position: 'relative',
          imageRendering: 'pixelated',
        }}
      >
        {/* 상단 하이라이트 1px 라인 — 픽셀 게임 UI 의 입체감 */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 1,
            background: 'rgba(255,255,255,0.4)',
            pointerEvents: 'none',
          }}
        />
        {meta.name}
        {/* Platinum 4×4 픽셀 파티클 */}
        {tier.particle && (
          <>
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: 4,
                height: 4,
                background: '#fff',
                boxShadow: '0 0 0 1px #2a3a5a',
                animation: 'titleSparkle 2.2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: -3,
                left: -3,
                width: 4,
                height: 4,
                background: '#fff',
                boxShadow: '0 0 0 1px #2a3a5a',
                animation: 'titleSparkle 2.6s ease-in-out 0.5s infinite',
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
