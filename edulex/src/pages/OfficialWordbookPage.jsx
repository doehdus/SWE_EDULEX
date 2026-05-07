import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, GraduationCap, Hash, X } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useMajor } from '../context/MajorContext'
import { BOOK_COLORS } from '../constants/theme'
import { LoadingState, EmptyState } from '../components/ui/StateViews'

// ── 사이드바 아이템 ───────────────────────────────────────────────

function SidebarItem({ wb, idx, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const color = BOOK_COLORS[idx % BOOK_COLORS.length]
  return (
    <button
      onClick={() => onSelect(wb, idx)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderLeftColor: color.spine,
        borderLeftWidth: isSelected ? 6 : hovered ? 5 : 4,
        background: isSelected
          ? `linear-gradient(135deg, ${color.spine}, ${color.cover})`
          : hovered
          ? `linear-gradient(135deg, ${color.accent}55, #fff 60%)`
          : '#fff',
        boxShadow: isSelected ? `0 6px 20px ${color.spine}55` : hovered ? `0 4px 14px ${color.spine}22` : '0 2px 8px #00000010',
        transform: isSelected ? 'translateX(4px)' : hovered ? 'translateX(2px) translateY(-1px)' : 'translateX(0)',
        transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
      }}
      className="w-full text-left px-4 py-3.5 rounded-r-2xl rounded-l-sm text-sm border-l-4 relative overflow-hidden select-none"
    >
      <p className="font-bold text-sm truncate leading-snug" style={{ color: isSelected ? '#fff' : '#2d1b00' }}>
        {wb.title}
      </p>
      <div className="flex items-center gap-1.5 mt-1">
        <div
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: isSelected ? 'rgba(255,255,255,0.2)' : color.accent, color: isSelected ? '#fff' : color.spine }}
        >
          {wb.major}
        </div>
      </div>
    </button>
  )
}

// ── 사이드바 ──────────────────────────────────────────────────────

function WordbookSidebar({ wordbooks, selectedWb, onSelect }) {
  return (
    <aside className="w-60 shrink-0 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 px-1 shrink-0">
        <GraduationCap size={14} strokeWidth={2} style={{ color: '#8b6e4e' }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b6e4e' }}>공식 단어장</p>
        <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#e8ddd0', color: '#8b6e4e' }}>
          {wordbooks.length}
        </span>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {wordbooks.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm" style={{ color: '#b09070' }}>단어장이 없습니다</p>
            <p className="text-xs mt-1" style={{ color: '#c4a882' }}>전공을 선택해주세요</p>
          </div>
        ) : (
          wordbooks.map((wb, idx) => (
            <SidebarItem key={wb.id} wb={wb} idx={idx} isSelected={selectedWb?.id === wb.id} onSelect={onSelect} />
          ))
        )}
      </div>
    </aside>
  )
}

// ── 단어 목록 ────────────────────────────────────────────────────

function WordList({ words, selectedWord, selectedWb, color, onSelectWord }) {
  const [query, setQuery] = useState('')
  const filtered = words.filter(w =>
    w.english.toLowerCase().includes(query.toLowerCase()) ||
    (w.general_meaning ?? '').includes(query)
  )

  return (
    <div
      className="flex-1 min-w-0 flex flex-col h-full rounded-2xl overflow-hidden"
      style={{ background: '#faf6f0', boxShadow: '0 4px 20px #00000012' }}
    >
      <div className="h-1.5 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${color.spine}, ${color.cover})` }} />

      <div className="p-5 flex flex-col min-h-0 flex-1">
        {/* 헤더 */}
        <div className="mb-4 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: color.spine }}>단어 목록</p>
          <p className="text-sm font-extrabold leading-tight line-clamp-1" style={{ color: '#2d1b00' }}>{selectedWb.title}</p>
          <p className="text-[10px] mt-1 font-medium" style={{ color: '#b09070' }}>총 {words.length}개 · 클릭하면 상세 보기</p>
        </div>

        {/* 검색 */}
        <div className="relative mb-3 shrink-0">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#b09070' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="단어 검색..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs outline-none border transition-all"
            style={{ background: '#fff', borderColor: query ? color.spine + '80' : '#e8ddd0', color: '#2d1b00' }}
          />
        </div>

        <div className="border-t border-dashed border-[#d4b896] mb-2 shrink-0" />

        {/* 단어 그리드 */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((word) => {
              const realIdx = words.findIndex(w => w.id === word.id)
              const isActive = selectedWord?.id === word.id
              return (
                <WordCard
                  key={word.id}
                  word={word}
                  idx={realIdx}
                  color={color}
                  isActive={isActive}
                  onClick={() => onSelectWord(word, realIdx)}
                />
              )
            })}
            {filtered.length === 0 && (
              <p className="col-span-2 text-xs text-center py-6" style={{ color: '#b09070' }}>검색 결과 없음</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function WordCard({ word, idx, color, isActive, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="text-left rounded-xl px-3 py-2.5 transition-all select-none"
      style={{
        background: isActive ? `linear-gradient(135deg, ${color.spine}, ${color.cover})` : hov ? color.accent + '40' : '#fff',
        border: `1.5px solid ${isActive ? color.spine : hov ? color.accent : '#e8ddd0'}`,
        boxShadow: isActive ? `0 4px 14px ${color.spine}44` : hov ? `0 2px 8px ${color.spine}18` : '0 1px 4px #00000008',
        transform: hov && !isActive ? 'translateY(-1px)' : 'none',
        transition: 'all 0.18s cubic-bezier(.34,1.56,.64,1)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[9px] font-mono font-bold" style={{ color: isActive ? 'rgba(255,255,255,0.6)' : color.spine + '80' }}>
          {idx + 1}
        </span>
      </div>
      <p className="text-sm font-bold truncate" style={{ color: isActive ? '#fff' : '#2d1b00' }}>
        {word.english}
      </p>
      {word.general_meaning && (
        <p className="text-[10px] mt-0.5 truncate font-medium" style={{ color: isActive ? 'rgba(255,255,255,0.75)' : '#b09070' }}>
          {word.general_meaning}
        </p>
      )}
    </button>
  )
}

// ── 단어 상세 모달 ────────────────────────────────────────────────

function WordModal({ word, idx, total, color, flipDir, pageFlip, onPrev, onNext, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

  if (!word) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(30,15,5,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: '#fffdf7',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          maxHeight: '85vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 상단 색상 바 */}
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${color.spine}, ${color.cover})` }} />

        {/* 배경 줄 */}
        <div
          className="absolute inset-0 top-2 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, #f0e8dc 31px, #f0e8dc 32px)',
            backgroundPositionY: '48px',
            opacity: 0.6,
          }}
        />

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all select-none"
          style={{ background: 'rgba(0,0,0,0.06)', color: '#8b6e4e' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.12)'; e.currentTarget.style.color = '#2d1b00' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = '#8b6e4e' }}
        >
          <X size={15} strokeWidth={2.5} />
        </button>

        {/* 콘텐츠 */}
        <div
          className="relative px-8 pt-6 pb-7"
          style={{
            opacity: pageFlip ? 0 : 1,
            transform: pageFlip
              ? `translateX(${flipDir === 'next' ? '-16px' : '16px'}) scale(0.97)`
              : 'translateX(0) scale(1)',
            transition: 'opacity 0.17s ease, transform 0.17s ease',
          }}
        >
          {/* 뱃지 + 번호 */}
          <div className="flex items-center justify-between mb-5">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ background: color.accent, color: color.spine }}
            >
              {word.major ?? '공식 단어장'}
            </span>
            <span className="text-xs font-mono font-semibold" style={{ color: '#b09070' }}>
              {idx + 1} / {total}
            </span>
          </div>

          {/* 영단어 */}
          <div className="mb-6">
            <div className="flex items-end gap-2 flex-wrap">
              <h2 className="font-black leading-none tracking-tight select-text" style={{ color: '#2d1b00', fontSize: 'clamp(2rem, 6vw, 3rem)' }}>
                {word.english}
              </h2>
              <Hash size={14} style={{ color: color.spine + '50', marginBottom: 5 }} />
            </div>
            <div
              className="h-1 rounded-full mt-3"
              style={{
                background: `linear-gradient(90deg, ${color.spine}, ${color.accent})`,
                width: `${Math.min(20 + word.english.length * 6, 140)}px`,
                transition: 'width 0.35s ease',
              }}
            />
          </div>

          {/* 의미 */}
          <div className="space-y-3">
            {word.general_meaning && (
              <div className="rounded-2xl p-4" style={{ background: color.accent + '22', border: `1px solid ${color.accent}` }}>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] mb-1.5" style={{ color: color.spine + 'aa' }}>일반적 의미</p>
                <p className="text-sm font-semibold leading-relaxed select-text" style={{ color: '#2d1b00' }}>{word.general_meaning}</p>
                {word.general_example && (
                  <p className="text-xs mt-2 italic leading-relaxed pl-3 border-l-2 select-text" style={{ color: '#8b6e4e', borderColor: color.accent }}>
                    "{word.general_example}"
                  </p>
                )}
              </div>
            )}
            <div className="rounded-2xl p-4" style={{ background: color.spine + '08', border: `1px solid ${color.spine}28` }}>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] mb-1.5" style={{ color: color.spine }}>전공 의미</p>
              <p className="text-sm font-bold leading-relaxed select-text" style={{ color: '#2d1b00' }}>{word.major_meaning}</p>
              {word.major_example && (
                <p className="text-xs mt-2 italic leading-relaxed pl-3 border-l-2 select-text" style={{ color: '#8b6e4e', borderColor: color.spine }}>
                  "{word.major_example}"
                </p>
              )}
            </div>
          </div>

          {/* 네비게이션 */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e8ddd0]">
            <ModalNavBtn onClick={onPrev} disabled={idx === 0} color={color}>
              <ChevronLeft size={14} strokeWidth={2.5} /> 이전
            </ModalNavBtn>

            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(7, total) }, (_, i) => {
                const ri = Math.max(0, Math.min(idx - 3, total - 7)) + i
                return (
                  <div key={ri} className="rounded-full" style={{
                    width: ri === idx ? 20 : 5, height: 5,
                    background: ri === idx ? color.spine : color.accent,
                    opacity: ri === idx ? 1 : 0.45,
                    transition: 'all 0.22s cubic-bezier(.34,1.56,.64,1)',
                  }} />
                )
              })}
            </div>

            <ModalNavBtn onClick={onNext} disabled={idx >= total - 1} color={color}>
              다음 <ChevronRight size={14} strokeWidth={2.5} />
            </ModalNavBtn>
          </div>

          <p className="text-center text-[9px] mt-2 select-none" style={{ color: '#b09070', opacity: 0.5 }}>
            ← → 이동 · ESC 닫기
          </p>
        </div>
      </div>
    </div>
  )
}

function ModalNavBtn({ onClick, disabled, color, children }) {
  const [hov, setHov] = useState(false)
  const [press, setPress] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPress(false) }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold select-none disabled:opacity-20 disabled:cursor-not-allowed"
      style={{
        color: color.spine,
        background: hov ? color.accent + '60' : color.accent + '30',
        transform: press ? 'scale(0.93)' : hov ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.14s cubic-bezier(.34,1.56,.64,1), background 0.14s ease',
      }}
    >
      {children}
    </button>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────

export default function OfficialWordbookPage() {
  const { selectedMajors } = useMajor()
  const [wordbooks, setWordbooks]             = useState([])
  const [selectedWb, setSelectedWb]           = useState(null)
  const [selectedWbColor, setSelectedWbColor] = useState(BOOK_COLORS[0])
  const [words, setWords]                     = useState([])
  const [loading, setLoading]                 = useState(false)
  const [selectedWord, setSelectedWord]       = useState(null)
  const [selectedIdx, setSelectedIdx]         = useState(null)
  const [modalOpen, setModalOpen]             = useState(false)
  const [pageFlip, setPageFlip]               = useState(false)
  const [flipDir, setFlipDir]                 = useState('next')

  useEffect(() => { fetchWordbooks() }, [selectedMajors])

  const fetchWordbooks = async () => {
    let query = supabase.from('official_wordbooks').select('*').order('created_at', { ascending: false })
    if (selectedMajors.length > 0) query = query.in('major', selectedMajors)
    const { data } = await query
    setWordbooks(data ?? [])
    setSelectedWb(null)
    setWords([])
    setSelectedWord(null)
    setModalOpen(false)
  }

  const selectWordbook = async (wb, colorIdx) => {
    setSelectedWb(wb)
    setSelectedWbColor(BOOK_COLORS[colorIdx % BOOK_COLORS.length])
    setSelectedWord(null)
    setSelectedIdx(null)
    setModalOpen(false)
    setLoading(true)
    const { data } = await supabase.from('official_words').select('*').eq('wordbook_id', wb.id)
    setWords(data ?? [])
    setLoading(false)
  }

  const openWord = useCallback((word, idx, dir = 'next') => {
    if (modalOpen) {
      setFlipDir(dir)
      setPageFlip(true)
      setTimeout(() => { setSelectedWord(word); setSelectedIdx(idx); setPageFlip(false) }, 170)
    } else {
      setSelectedWord(word)
      setSelectedIdx(idx)
      setModalOpen(true)
    }
  }, [modalOpen])

  const goNext = useCallback(() => {
    if (selectedIdx < words.length - 1) openWord(words[selectedIdx + 1], selectedIdx + 1, 'next')
  }, [selectedIdx, words, openWord])

  const goPrev = useCallback(() => {
    if (selectedIdx > 0) openWord(words[selectedIdx - 1], selectedIdx - 1, 'prev')
  }, [selectedIdx, words, openWord])

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 72px)', background: 'linear-gradient(160deg, #f7f3ec 0%, #ede5d8 100%)' }}
    >
      {/* 헤더 */}
      <div className="shrink-0 max-w-6xl w-full mx-auto px-6 pt-5 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#2d1b00' }}>공식 단어장</h1>
            <p className="text-sm mt-1" style={{ color: '#8b6e4e' }}>
              {selectedMajors.length > 0
                ? selectedMajors.map(m => (
                    <span key={m} className="inline-block mr-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#e8ddd0', color: '#6b4226' }}>
                      {m}
                    </span>
                  ))
                : '전공을 선택해주세요'}
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl text-center" style={{ background: '#fff', boxShadow: '0 2px 12px #00000010' }}>
            <p className="text-xl font-black" style={{ color: '#2d1b00' }}>{wordbooks.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8b6e4e' }}>단어장</p>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 min-h-0 max-w-6xl w-full mx-auto px-6 pb-5 flex gap-6">
        <WordbookSidebar wordbooks={wordbooks} selectedWb={selectedWb} onSelect={selectWordbook} />

        {!selectedWb ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState message="왼쪽에서 단어장을 선택하세요" />
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingState />
          </div>
        ) : (
          <WordList
            words={words}
            selectedWord={selectedWord}
            selectedWb={selectedWb}
            color={selectedWbColor}
            onSelectWord={openWord}
          />
        )}
      </div>

      {/* 모달 */}
      {modalOpen && (
        <WordModal
          word={selectedWord}
          idx={selectedIdx}
          total={words.length}
          color={selectedWbColor}
          pageFlip={pageFlip}
          flipDir={flipDir}
          onPrev={goPrev}
          onNext={goNext}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
