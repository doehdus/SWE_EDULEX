import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, BookOpen, Search, GraduationCap, Hash } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useMajor } from '../context/MajorContext'
import { BOOK_COLORS } from '../constants/theme'
import { LoadingState, EmptyState } from '../components/ui/StateViews'

// ── 사이드바: 단어장 목록 ─────────────────────────────────────────

function WordbookSidebar({ wordbooks, selectedWb, onSelect }) {
  return (
    <aside className="w-60 shrink-0 sticky top-6">
      <div className="flex items-center gap-2 mb-4 px-1">
        <GraduationCap size={14} strokeWidth={2} style={{ color: '#8b6e4e' }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b6e4e' }}>
          공식 단어장
        </p>
        <span
          className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: '#e8ddd0', color: '#8b6e4e' }}
        >
          {wordbooks.length}
        </span>
      </div>

      <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
        {wordbooks.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm" style={{ color: '#b09070' }}>단어장이 없습니다</p>
            <p className="text-xs mt-1" style={{ color: '#c4a882' }}>전공을 선택해주세요</p>
          </div>
        ) : (
          wordbooks.map((wb, idx) => {
            const color = BOOK_COLORS[idx % BOOK_COLORS.length]
            const isSelected = selectedWb?.id === wb.id
            return (
              <button
                key={wb.id}
                onClick={() => onSelect(wb, idx)}
                style={{
                  borderLeftColor: color.spine,
                  background: isSelected
                    ? `linear-gradient(135deg, ${color.spine}, ${color.cover})`
                    : '#fff',
                  boxShadow: isSelected
                    ? `0 4px 16px ${color.spine}44`
                    : '0 2px 8px #00000010',
                  transform: isSelected ? 'translateX(2px)' : 'translateX(0)',
                }}
                className="w-full text-left px-4 py-3.5 rounded-r-2xl rounded-l-sm text-sm transition-all duration-200 border-l-4 relative overflow-hidden"
              >
                <p
                  className="font-bold text-sm truncate leading-snug"
                  style={{ color: isSelected ? '#fff' : '#2d1b00' }}
                >
                  {wb.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.2)' : color.accent,
                      color: isSelected ? '#fff' : color.spine,
                    }}
                  >
                    {wb.major}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}

// ── 목차 (책 왼쪽 페이지) ─────────────────────────────────────────

function TableOfContents({ words, selectedWord, selectedWb, color, onSelectWord }) {
  const [query, setQuery] = useState('')
  const filtered = words.filter(w =>
    w.english.toLowerCase().includes(query.toLowerCase()) ||
    (w.general_meaning ?? '').includes(query)
  )

  return (
    <div
      className="w-56 shrink-0 rounded-l-2xl overflow-hidden flex flex-col"
      style={{
        background: '#faf6f0',
        boxShadow: 'inset -3px 0 12px #00000012, 2px 0 0 #d4b896',
        minHeight: '580px',
      }}
    >
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color.spine}, ${color.cover})` }} />

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: color.spine }}>목차</p>
          <p className="text-sm font-extrabold leading-tight line-clamp-2" style={{ color: '#2d1b00' }}>{selectedWb.title}</p>
          <p className="text-[10px] mt-1 font-medium" style={{ color: '#b09070' }}>
            총 {words.length}개 단어
          </p>
        </div>

        {/* 검색 */}
        <div className="relative mb-3">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#b09070' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="단어 검색..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs outline-none border transition-all"
            style={{
              background: '#fff',
              borderColor: query ? color.spine + '80' : '#e8ddd0',
              color: '#2d1b00',
            }}
          />
        </div>

        <div className="border-t border-dashed border-[#d4b896] mb-3" />

        <div className="space-y-0.5 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 22rem)' }}>
          {filtered.map((word) => {
            const realIdx = words.findIndex(w => w.id === word.id)
            const isActive = selectedWord?.id === word.id
            return (
              <button
                key={word.id}
                onClick={() => onSelectWord(word, realIdx)}
                className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-150"
                style={{
                  background: isActive ? color.spine + '15' : 'transparent',
                  borderLeft: isActive ? `2px solid ${color.spine}` : '2px solid transparent',
                }}
              >
                <span className="text-[10px] w-4 text-right shrink-0 font-mono" style={{ color: color.spine + '80' }}>
                  {realIdx + 1}
                </span>
                <span
                  className="flex-1 text-xs font-semibold truncate text-left"
                  style={{ color: isActive ? color.spine : '#2d1b00' }}
                >
                  {word.english}
                </span>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: '#b09070' }}>검색 결과 없음</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 단어 상세 (책 오른쪽 페이지) ─────────────────────────────────

function WordPage({ word, idx, total, color, pageFlip, onPrev, onNext }) {
  return (
    <div
      className="flex-1 min-w-0 rounded-r-2xl overflow-hidden relative flex flex-col"
      style={{
        background: '#fffdf7',
        boxShadow: '6px 6px 24px #00000018',
        minHeight: '580px',
      }}
    >
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color.spine}, ${color.cover})` }} />

      {/* 배경 줄 */}
      <div
        className="absolute inset-0 top-1.5 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, #f0e8dc 31px, #f0e8dc 32px)',
          backgroundPositionY: '52px',
        }}
      />

      <div
        className="relative flex-1 flex flex-col transition-all duration-200"
        style={{ opacity: pageFlip ? 0 : 1, transform: pageFlip ? 'translateY(4px)' : 'translateY(0)' }}
      >
        {word ? (
          <div className="p-8 flex flex-col h-full">

            {/* 상단 헤더 */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div
                  className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                  style={{ background: color.accent, color: color.spine }}
                >
                  {word.major ?? '공식 단어장'}
                </div>
              </div>
              <span className="text-xs font-mono font-semibold" style={{ color: '#b09070' }}>
                {idx + 1} / {total}
              </span>
            </div>

            {/* 영단어 */}
            <div className="mb-8">
              <div className="flex items-end gap-3 flex-wrap">
                <h2
                  className="text-5xl font-black leading-none tracking-tight"
                  style={{ color: '#2d1b00' }}
                >
                  {word.english}
                </h2>
                <Hash size={16} style={{ color: color.spine + '60', marginBottom: 6 }} />
              </div>
              <div className="h-1 w-20 rounded-full mt-4" style={{ background: `linear-gradient(90deg, ${color.spine}, ${color.accent})` }} />
            </div>

            {/* 의미 영역 */}
            <div className="space-y-6 flex-1">

              {/* 일반 의미 */}
              {word.general_meaning && (
                <div
                  className="rounded-2xl p-5"
                  style={{ background: color.accent + '25', border: `1px solid ${color.accent}` }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color.spine + '80' }} />
                    <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: color.spine + 'aa' }}>
                      일반적 의미
                    </p>
                  </div>
                  <p className="text-base font-semibold leading-relaxed" style={{ color: '#2d1b00' }}>
                    {word.general_meaning}
                  </p>
                  {word.general_example && (
                    <p
                      className="text-sm mt-3 italic leading-relaxed pl-3 border-l-2"
                      style={{ color: '#8b6e4e', borderColor: color.accent }}
                    >
                      "{word.general_example}"
                    </p>
                  )}
                </div>
              )}

              {/* 전공 의미 */}
              <div
                className="rounded-2xl p-5"
                style={{ background: color.spine + '08', border: `1px solid ${color.spine}30` }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color.spine }} />
                  <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: color.spine }}>
                    전공 의미
                  </p>
                </div>
                <p className="text-base font-bold leading-relaxed" style={{ color: '#2d1b00' }}>
                  {word.major_meaning}
                </p>
                {word.major_example && (
                  <p
                    className="text-sm mt-3 italic leading-relaxed pl-3 border-l-2"
                    style={{ color: '#8b6e4e', borderColor: color.spine }}
                  >
                    "{word.major_example}"
                  </p>
                )}
              </div>
            </div>

            {/* 하단 네비게이션 */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#e8ddd0]">
              <button
                onClick={onPrev}
                disabled={!idx}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105"
                style={{ color: color.spine, background: color.accent + '30' }}
              >
                <ChevronLeft size={15} strokeWidth={2.5} /> 이전
              </button>

              <div className="flex gap-1.5 items-center">
                {Array.from({ length: Math.min(7, total) }, (_, i) => {
                  const realIdx = Math.max(0, Math.min(idx - 3, total - 7)) + i
                  const isActive = realIdx === idx
                  return (
                    <div
                      key={realIdx}
                      className="rounded-full transition-all duration-200"
                      style={{
                        width: isActive ? 24 : 6,
                        height: 6,
                        background: isActive ? color.spine : color.accent,
                        opacity: isActive ? 1 : 0.5,
                      }}
                    />
                  )
                })}
              </div>

              <button
                onClick={onNext}
                disabled={idx >= total - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105"
                style={{ color: color.spine, background: color.accent + '30' }}
              >
                다음 <ChevronRight size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState message="왼쪽 목차에서 단어를 선택하세요" />
          </div>
        )}
      </div>
    </div>
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
  const [pageFlip, setPageFlip]               = useState(false)
  const pageRef = useRef(null)

  useEffect(() => { fetchWordbooks() }, [selectedMajors])

  const fetchWordbooks = async () => {
    let query = supabase.from('official_wordbooks').select('*').order('created_at', { ascending: false })
    if (selectedMajors.length > 0) query = query.in('major', selectedMajors)
    const { data } = await query
    setWordbooks(data ?? [])
    setSelectedWb(null)
    setWords([])
    setSelectedWord(null)
  }

  const selectWordbook = async (wb, colorIdx) => {
    setSelectedWb(wb)
    setSelectedWbColor(BOOK_COLORS[colorIdx % BOOK_COLORS.length])
    setSelectedWord(null)
    setSelectedIdx(null)
    setLoading(true)
    const { data } = await supabase.from('official_words').select('*').eq('wordbook_id', wb.id)
    setWords(data ?? [])
    setLoading(false)
  }

  const handleSelectWord = (word, idx) => {
    setPageFlip(true)
    setTimeout(() => { setSelectedWord(word); setSelectedIdx(idx); setPageFlip(false) }, 180)
  }

  const goNext = () => selectedIdx < words.length - 1 && handleSelectWord(words[selectedIdx + 1], selectedIdx + 1)
  const goPrev = () => selectedIdx > 0               && handleSelectWord(words[selectedIdx - 1], selectedIdx - 1)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f7f3ec 0%, #ede5d8 100%)' }}>

      {/* 헤더 */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: '#2d1b00' }}>공식 단어장</h1>
            <p className="text-sm mt-1.5" style={{ color: '#8b6e4e' }}>
              {selectedMajors.length > 0
                ? selectedMajors.map(m => (
                    <span
                      key={m}
                      className="inline-block mr-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: '#e8ddd0', color: '#6b4226' }}
                    >
                      {m}
                    </span>
                  ))
                : '전공을 선택해주세요'}
            </p>
          </div>

          {/* 단어장 수 뱃지 */}
          <div className="px-4 py-2.5 rounded-2xl text-center" style={{ background: '#fff', boxShadow: '0 2px 12px #00000010' }}>
            <p className="text-xl font-black" style={{ color: '#2d1b00' }}>{wordbooks.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8b6e4e' }}>단어장</p>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-6xl mx-auto px-6 pb-10 flex gap-8 items-start">

        <WordbookSidebar wordbooks={wordbooks} selectedWb={selectedWb} onSelect={selectWordbook} />

        {!selectedWb ? (
          <div className="flex-1 flex items-center justify-center min-h-96">
            <EmptyState message="왼쪽에서 단어장을 선택하세요" />
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center min-h-96">
            <LoadingState />
          </div>
        ) : (
          <div className="flex-1 min-w-0 flex gap-0 items-start" ref={pageRef}>
            <TableOfContents
              words={words}
              selectedWord={selectedWord}
              selectedWb={selectedWb}
              color={selectedWbColor}
              onSelectWord={handleSelectWord}
            />
            <WordPage
              word={selectedWord}
              idx={selectedIdx}
              total={words.length}
              color={selectedWbColor}
              pageFlip={pageFlip}
              onPrev={goPrev}
              onNext={goNext}
            />
          </div>
        )}
      </div>
    </div>
  )
}
