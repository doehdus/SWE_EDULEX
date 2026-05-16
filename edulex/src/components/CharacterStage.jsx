import { useEffect, useRef, useState } from 'react'
import CharacterCanvas from './CharacterCanvas'
import { BACKGROUNDS } from '../constants/character'
import { LIB } from '../constants/theme'

// 키 → 방향 매핑 (0=UP, 1=LEFT, 2=DOWN, 3=RIGHT).
const KEY_DIR = {
  ArrowUp:    0,
  ArrowLeft:  1,
  ArrowDown:  2,
  ArrowRight: 3,
}
const KEYS = Object.keys(KEY_DIR)

const SPEED = 1.5          // px / frame (≈ 90 px/sec @ 60fps)
const WALK_FRAME_MS = 120  // walk 사이클 (CharacterPanel 과 동일)
const WALK_FRAMES = 9
const IDLE_BREATH_MS = 700 // idle 호흡 0↔1 핑퐁

export default function CharacterStage({
  equipped,
  size: sizeProp,
  charSize: charSizeProp,
  charScale = 0.33,
  fill = false,
  backgroundId = 'default',
}) {
  const containerRef = useRef(null)
  const heldKeys = useRef(new Set())
  const posRef = useRef({ x: 0, y: 0 })
  const lastFrameTime = useRef(0)
  const walkAccum = useRef(0)

  const [measured, setMeasured] = useState({ w: sizeProp ?? 240, h: sizeProp ?? 240 })
  const [, forceRender] = useState(0)
  const [direction, setDirection] = useState(2)
  const [frame, setFrame] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const stageW = fill ? measured.w : (sizeProp ?? 240)
  const stageH = fill ? measured.h : (sizeProp ?? 240)
  // 캐릭터 크기: charSize 직접 지정이 우선, 아니면 짧은 변 기준 scale.
  const charSize = charSizeProp ?? Math.max(48, Math.floor(Math.min(stageW, stageH) * charScale))

  // fill 모드: 컨테이너 실측 → measured 상태 동기화.
  useEffect(() => {
    if (!fill) return
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      const w = Math.floor(r.width)
      const h = Math.floor(r.height)
      if (w > 0 && h > 0) {
        setMeasured((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [fill])

  // 스테이지/캐릭터 크기 변경 시 위치 중앙 정렬 + 경계 클램프.
  useEffect(() => {
    const maxX = Math.max(0, stageW - charSize)
    const maxY = Math.max(0, stageH - charSize)
    if (posRef.current.x === 0 && posRef.current.y === 0) {
      posRef.current.x = maxX / 2
      posRef.current.y = maxY / 2
    } else {
      posRef.current.x = Math.min(Math.max(0, posRef.current.x), maxX)
      posRef.current.y = Math.min(Math.max(0, posRef.current.y), maxY)
    }
    forceRender((n) => (n + 1) & 0xffff)
  }, [stageW, stageH, charSize])

  // RAF 루프 — 이동 + walk 프레임 진행.
  useEffect(() => {
    let rafId
    const tick = (now) => {
      const dt = lastFrameTime.current ? now - lastFrameTime.current : 16
      lastFrameTime.current = now

      const keys = [...heldKeys.current]
      const activeKey = keys[keys.length - 1]
      const moving = !!activeKey

      if (moving) {
        const dir = KEY_DIR[activeKey]
        setDirection((prev) => (prev === dir ? prev : dir))

        const stepsPerMs = SPEED / 16
        const step = stepsPerMs * dt
        const maxX = Math.max(0, stageW - charSize)
        const maxY = Math.max(0, stageH - charSize)
        const p = posRef.current
        if (dir === 0) p.y = Math.max(0, p.y - step)
        else if (dir === 2) p.y = Math.min(maxY, p.y + step)
        else if (dir === 1) p.x = Math.max(0, p.x - step)
        else if (dir === 3) p.x = Math.min(maxX, p.x + step)

        walkAccum.current += dt
        if (walkAccum.current >= WALK_FRAME_MS) {
          walkAccum.current = 0
          setFrame((f) => (f + 1) % WALK_FRAMES)
        }
        forceRender((n) => (n + 1) & 0xffff)
      } else {
        walkAccum.current = 0
      }

      setIsMoving((prev) => (prev === moving ? prev : moving))
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [stageW, stageH, charSize])

  // Idle 호흡 — 정지 상태에서 frame 0↔1 핑퐁.
  useEffect(() => {
    if (isMoving) return
    const id = setInterval(() => {
      setFrame((f) => (f === 0 ? 1 : 0))
    }, IDLE_BREATH_MS)
    return () => clearInterval(id)
  }, [isMoving])

  // 포커스 게이트 — focused 일 때만 화살표 키 캡처.
  useEffect(() => {
    if (!isFocused) return
    const handleDown = (e) => {
      if (!KEYS.includes(e.key)) return
      e.preventDefault()
      heldKeys.current.add(e.key)
    }
    const handleUp = (e) => {
      if (!KEYS.includes(e.key)) return
      e.preventDefault()
      heldKeys.current.delete(e.key)
    }
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
      heldKeys.current.clear()
    }
  }, [isFocused])

  const bgImage = BACKGROUNDS[backgroundId]

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        width: fill ? '100%' : stageW,
        height: fill ? '100%' : stageH,
        position: 'relative',
        overflow: 'hidden',
        background: bgImage ? 'transparent' : LIB.parchment,
        borderRadius: 16,
        border: `2px solid ${isFocused ? LIB.gold : LIB.shelfLine}`,
        boxShadow: isFocused ? `0 0 12px rgba(201,168,76,0.45)` : 'none',
        outline: 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      aria-label="캐릭터 이동 영역 — 클릭 후 화살표 키로 이동"
    >
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            imageRendering: 'pixelated',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          transform: `translate(${posRef.current.x}px, ${posRef.current.y}px)`,
          willChange: 'transform',
        }}
      >
        <CharacterCanvas
          equipped={equipped}
          size={charSize}
          direction={direction}
          frameIndex={frame}
          variant="bare"
        />
      </div>
    </div>
  )
}
