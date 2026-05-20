import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { LIB } from '../../constants/theme'

/**
 * Toast — 화면 하단 중앙에 잠깐 나타났다 사라지는 알림
 * Props:
 *   message  string   표시할 텍스트
 *   onClose  () => void  애니메이션 종료 후 호출
 */
export function Toast({ message, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 마운트 직후 fade-in
    const showTimer = requestAnimationFrame(() => setVisible(true))
    // 2.5초 후 fade-out → 0.3초 뒤 언마운트
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 2500)

    return () => {
      cancelAnimationFrame(showTimer)
      clearTimeout(hideTimer)
    }
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '16px'})`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 22px',
        borderRadius: '16px',
        background: LIB.wood,
        boxShadow: '0 8px 32px rgba(44,26,14,0.35)',
        pointerEvents: 'none',
        minWidth: '200px',
        maxWidth: '320px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `linear-gradient(135deg, ${LIB.gold}, ${LIB.goldLight})`,
          flexShrink: 0,
        }}
      >
        <Bookmark size={16} color={LIB.wood} strokeWidth={2.5} />
      </div>
      <span
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: LIB.goldLight,
          lineHeight: 1.3,
        }}
      >
        {message}
      </span>
    </div>
  )
}
