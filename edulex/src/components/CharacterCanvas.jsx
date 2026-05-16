import { useEffect, useRef } from 'react'
import { ITEMS } from '../constants/character'
import { LIB } from '../constants/theme'
import { getImage } from '../utils/characterImages'

const FRAME_W = 64
const FRAME_H = 64
// UP / LEFT / DOWN(기본) / RIGHT 의 walk 행 y 오프셋.
const WALK_Y = [512, 576, 640, 704]

// 활성 레이어 목록 — 공통 3종 + 5개 슬롯 중 장착된 것만.
function getActiveLayers(equipped) {
  const layers = [
    ...ITEMS._body.layers,
    ...ITEMS._head.layers,
    ...ITEMS._face.layers,
  ]
  ;['hair', 'outfit', 'hat', 'bag', 'wings'].forEach((slot) => {
    const id = equipped?.[slot]
    if (id && ITEMS[id]) layers.push(...ITEMS[id].layers)
  })
  // 동률 z 는 di 보조키로 안정 정렬 (예: plate→shoulders).
  return layers.sort((a, b) => (a.z - b.z) || ((a.di || 0) - (b.di || 0)))
}

export default function CharacterCanvas({
  equipped,
  frameIndex = 0,
  direction = 2,
  size = 256,
  variant = 'framed',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const layers = getActiveLayers(equipped)
    const srcX = frameIndex * FRAME_W
    const srcY = WALK_Y[direction] ?? WALK_Y[2]

    layers.forEach((layer) => {
      const img = getImage(layer.src)
      if (!img) {
        console.warn(`[CharacterCanvas] image not loaded: ${layer.src}`)
        return
      }
      ctx.drawImage(img, srcX, srcY, FRAME_W, FRAME_H, 0, 0, size, size)
    })
  }, [equipped, frameIndex, direction, size])

  // 'bare' — 외곽 프레임 없이 canvas 만 (CharacterStage 가 자체 프레임 책임).
  if (variant === 'bare') {
    return (
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ imageRendering: 'pixelated', display: 'block' }}
      />
    )
  }

  return (
    <div
      className="rounded-2xl flex items-center justify-center"
      style={{
        background: LIB.cream,
        border: `1px solid ${LIB.shelfLine}`,
        padding: 8,
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}
