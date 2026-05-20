import { useEffect, useMemo, useState } from 'react'
import { X, Lock } from 'lucide-react'
import { useTitles } from '../../hooks/useTitles'
import {
  TITLE_CATEGORIES,
  TITLES,
  TITLES_BY_CATEGORY,
  LOCKED_CATEGORIES,
  ACTIVE_TITLES_COUNT,
} from '../../constants/titles'
import { LIB } from '../../constants/theme'
import TitleBadge from './TitleBadge'

const CATEGORY_KEYS = ['all', ...Object.keys(TITLE_CATEGORIES)]
const CATEGORY_LABEL = { all: '전체', ...TITLE_CATEGORIES }

export default function TitleSelectModal({ onClose }) {
  const { owned, activeTitle, loading, selectTitle } = useTitles()
  const [category, setCategory] = useState('all')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)

  // 표시 칭호 키 — 카테고리 필터 적용.
  const visibleKeys = useMemo(() => {
    if (category === 'all') return Object.keys(TITLES)
    return TITLES_BY_CATEGORY[category] ?? []
  }, [category])

  // 카테고리별 보유 개수 (잠금 카테고리 제외 진행도).
  const ownedActiveCount = useMemo(() => {
    let c = 0
    for (const key of owned) {
      const meta = TITLES[key]
      if (meta && !LOCKED_CATEGORIES.has(meta.category)) c++
    }
    return c
  }, [owned])

  // ESC 닫기.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleClick = async (key) => {
    if (busy) return
    const meta = TITLES[key]
    if (!meta) return

    // 잠금 카테고리.
    if (LOCKED_CATEGORIES.has(meta.category)) {
      setFeedback('단어장 숙련도 기능 완성 후 활성화 예정입니다.')
      setTimeout(() => setFeedback(''), 2500)
      return
    }

    // 미보유 — 토스트로 조건 안내.
    if (!owned.has(key)) {
      setFeedback(`아직 획득하지 않은 칭호입니다 — ${meta.description}`)
      setTimeout(() => setFeedback(''), 3000)
      return
    }

    // 보유 칭호: 이미 활성이면 해제, 아니면 선택.
    setBusy(true)
    const target = activeTitle === key ? null : key
    const res = await selectTitle(target)
    setBusy(false)
    if (res.ok) {
      setFeedback(target === null ? '칭호를 해제했습니다.' : '칭호를 적용했습니다.')
      setTimeout(() => setFeedback(''), 1800)
    }
  }

  const handleClear = async () => {
    if (busy || activeTitle === null) return
    setBusy(true)
    await selectTitle(null)
    setBusy(false)
    setFeedback('칭호를 해제했습니다.')
    setTimeout(() => setFeedback(''), 1800)
  }

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: LIB.cream,
          border: `1px solid ${LIB.shelfLine}`,
          maxHeight: '85vh',
        }}
      >
        {/* 헤더 */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b"
          style={{ borderColor: LIB.shelfLine, background: LIB.parchment }}
        >
          <div>
            <h3 className="text-lg font-extrabold" style={{ color: LIB.ink }}>
              칭호
            </h3>
            <p className="text-xs mt-0.5" style={{ color: LIB.inkMid }}>
              보유 {ownedActiveCount} / {ACTIVE_TITLES_COUNT} · 캐릭터 머리 위에 표시할 칭호를 선택하세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 transition"
            aria-label="닫기"
          >
            <X size={20} style={{ color: LIB.ink }} />
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div
          className="px-4 py-2 flex gap-1 overflow-x-auto border-b"
          style={{ borderColor: LIB.shelfLine }}
        >
          {CATEGORY_KEYS.map((k) => {
            const isActive = category === k
            const locked = LOCKED_CATEGORIES.has(k)
            return (
              <button
                key={k}
                onClick={() => setCategory(k)}
                className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1"
                style={
                  isActive
                    ? { background: LIB.gold, color: LIB.ink }
                    : { background: 'transparent', color: LIB.inkMid }
                }
              >
                {CATEGORY_LABEL[k]}
                {locked && <Lock size={10} strokeWidth={2.5} />}
              </button>
            )
          })}
        </div>

        {/* 칭호 그리드 */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-sm text-center py-12" style={{ color: LIB.inkMid }}>
              불러오는 중...
            </p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {visibleKeys.map((key) => (
                <TitleBadge
                  key={key}
                  titleKey={key}
                  owned={owned.has(key)}
                  active={activeTitle === key}
                  size="sm"
                  onClick={() => handleClick(key)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 푸터 — 해제 버튼 + 피드백 */}
        <div
          className="px-6 py-3 border-t flex items-center justify-between gap-3"
          style={{ borderColor: LIB.shelfLine, background: LIB.parchment }}
        >
          <span
            className="text-xs flex-1 min-h-[16px]"
            style={{ color: feedback ? LIB.deepRed : LIB.inkMid }}
          >
            {feedback}
          </span>
          <button
            onClick={handleClear}
            disabled={activeTitle === null || busy}
            className="px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
            style={{
              border: `1px solid ${LIB.shelfLine}`,
              color: LIB.inkMid,
              background: LIB.cream,
            }}
          >
            칭호 해제
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold transition hover:opacity-80"
            style={{ background: LIB.wood, color: LIB.parchment }}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  )
}
