import { useEffect, useRef, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import PdfUploadBar from '../components/PdfUploadBar'
import { ConfirmModal } from '../components/ui/Modal'
import { LoadingState, EmptyState } from '../components/ui/StateViews'
import { BOOK_COLORS } from '../constants/theme'

// ── 사이드바: 단어장 목록 ─────────────────────────────────────────

function WordbookSidebar({ wordbooks, selectedWb, onSelect, onDelete }) {
  return (
    <aside className="w-56 shrink-0 sticky top-6">
      <p className="text-xs font-bold uppercase tracking-widest mb-4 px-1" style={{ color: '#8b6e4e' }}>
        단어장
      </p>
      <div className="space-y-2 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
        {wordbooks.map((wb, idx) => {
          const color = BOOK_COLORS[idx % BOOK_COLORS.length]
          const isSelected = selectedWb?.id === wb.id
          return (
            <button
              key={wb.id}
              onClick={() => onSelect(wb, idx)}
              style={{
                borderLeftColor: color.spine,
                background: isSelected ? color.spine : '#fff',
                boxShadow: isSelected ? `4px 4px 0 ${color.spine}88` : '2px 2px 0 #d4b896',
              }}
              className="w-full text-left px-4 py-3 rounded-r-xl text-sm transition-all duration-200 border-l-4 relative overflow-hidden group"
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 11px, #00000022 11px, #00000022 12px)' }}
              />
              <div className="flex items-start justify-between relative">
                <div className="min-w-0">
                  <p className={`font-bold text-sm truncate ${isSelected ? 'text-white' : ''}`} style={!isSelected ? { color: '#2d1b00' } : {}}>
                    {wb.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : ''}`} style={!isSelected ? { color: '#8b6e4e' } : {}}>
                    AI 생성
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(wb) }}
                  className={`text-xs ml-1 shrink-0 opacity-0 group-hover:opacity-100 transition ${isSelected ? 'text-white/60 hover:text-white' : 'text-gray-300 hover:text-red-400'}`}
                >
                  삭제
                </button>
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

// ── 목차 (책 왼쪽 페이지) ─────────────────────────────────────────

function TableOfContents({ words, selectedWord, selectedWb, color, onSelectWord }) {
  return (
    <div
      className="w-52 shrink-0 rounded-l-lg overflow-hidden"
      style={{ background: '#faf6f0', boxShadow: 'inset -4px 0 8px #00000015, 2px 0 0 #d4b896', minHeight: '560px' }}
    >
      <div className="h-2 w-full" style={{ background: color.spine }} />
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: color.spine }}>목차</p>
        <p className="text-base font-extrabold mb-4 leading-tight" style={{ color: '#2d1b00' }}>{selectedWb.title}</p>
        <div className="border-t border-dashed border-[#d4b896] mb-4" />
        <div className="space-y-0.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 18rem)' }}>
          {words.map((word, idx) => (
            <button
              key={word.id}
              onClick={() => onSelectWord(word, idx)}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150"
              style={{ background: selectedWord?.id === word.id ? color.spine + '18' : 'transparent' }}
            >
              <span className="text-[10px] w-5 text-right shrink-0 font-mono" style={{ color: color.spine + '99' }}>
                {idx + 1}
              </span>
              <span className="flex-1 border-b border-dotted border-[#d4b896] mx-1" />
              <span
                className="text-xs font-semibold truncate max-w-22.5 text-right"
                style={{ color: selectedWord?.id === word.id ? color.spine : '#2d1b00' }}
              >
                {word.english}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 단어 상세 (책 오른쪽 페이지) ─────────────────────────────────

function WordPage({ word, idx, total, color, pageFlip, onPrev, onNext }) {
  return (
    <div
      className="flex-1 min-w-0 rounded-r-lg overflow-hidden relative"
      style={{ background: '#fffdf7', boxShadow: '4px 4px 16px #00000020', minHeight: '560px' }}
    >
      <div className="h-2 w-full" style={{ background: color.spine }} />
      <div
        className="absolute inset-0 top-2 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, #e8ddd0 31px, #e8ddd0 32px)',
          backgroundPositionY: '48px',
        }}
      />

      <div className="relative p-8 transition-opacity duration-180" style={{ opacity: pageFlip ? 0 : 1 }}>
        {word ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: color.spine }}>
                나만의 단어장
              </span>
              <span className="text-xs font-mono" style={{ color: '#b09070' }}>
                p. {idx + 1} / {total}
              </span>
            </div>

            <div className="mb-2">
              <h2 className="text-5xl font-black leading-none tracking-tight" style={{ color: '#2d1b00' }}>
                {word.english}
              </h2>
              <div className="h-1 w-16 rounded-full mt-3" style={{ background: color.spine }} />
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-2" style={{ color: color.spine + 'aa' }}>
                  일반적 의미
                </p>
                <p className="text-lg font-medium leading-relaxed" style={{ color: '#2d1b00' }}>{word.general_meaning}</p>
                <p className="text-sm mt-2 italic border-l-2 pl-3" style={{ color: '#8b6e4e', borderColor: color.accent }}>
                  {word.general_example}
                </p>
              </div>

              <div className="border-t border-dashed border-[#d4b896] pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-2" style={{ color: color.spine }}>
                  전공 의미
                </p>
                <p className="text-lg font-bold leading-relaxed" style={{ color: '#2d1b00' }}>{word.major_meaning}</p>
                {word.major_example && (
                  <p className="text-sm mt-2 italic border-l-2 pl-3" style={{ color: '#8b6e4e', borderColor: color.spine }}>
                    {word.major_example}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-12 pt-4 border-t border-[#e8ddd0]">
              <button
                onClick={onPrev}
                disabled={!idx}
                className="flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-20"
                style={{ color: color.spine }}
              >
                <span className="text-lg">←</span> 이전 단어
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, total) }, (_, i) => {
                  const realIdx = Math.max(0, idx - 2) + i
                  return (
                    <div
                      key={realIdx}
                      className="rounded-full transition-all"
                      style={{
                        width: realIdx === idx ? 20 : 6,
                        height: 6,
                        background: realIdx === idx ? color.spine : color.accent,
                      }}
                    />
                  )
                })}
              </div>

              <button
                onClick={onNext}
                disabled={idx >= total - 1}
                className="flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-20"
                style={{ color: color.spine }}
              >
                다음 단어 <span className="text-lg">→</span>
              </button>
            </div>
          </>
        ) : (
          <EmptyState icon="📖" message="왼쪽 목차에서 단어를 선택하세요" />
        )}
      </div>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────

export default function MyWordbookPage() {
  const { user } = useAuth()
  const [wordbooks, setWordbooks]             = useState([])
  const [selectedWb, setSelectedWb]           = useState(null)
  const [selectedWbColor, setSelectedWbColor] = useState(BOOK_COLORS[0])
  const [words, setWords]                     = useState([])
  const [selectedWord, setSelectedWord]       = useState(null)
  const [selectedIdx, setSelectedIdx]         = useState(null)
  const [pageFlip, setPageFlip]               = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [loading, setLoading]                 = useState(false)
  const pageRef = useRef(null)

  useEffect(() => { fetchWordbooks() }, [user])

  const fetchWordbooks = async () => {
    const { data } = await supabase
      .from('user_wordbooks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setWordbooks(data ?? [])
  }

  const selectWordbook = async (wb, colorIdx) => {
    setSelectedWb(wb)
    setSelectedWbColor(BOOK_COLORS[colorIdx % BOOK_COLORS.length])
    setSelectedWord(null)
    setSelectedIdx(null)
    setLoading(true)
    const { data } = await supabase.from('user_words').select('*').eq('wordbook_id', wb.id)
    setWords(data ?? [])
    setLoading(false)
  }

  const deleteWordbook = async (wb) => {
    await supabase.from('user_wordbooks').delete().eq('id', wb.id)
    setShowDeleteModal(null)
    if (selectedWb?.id === wb.id) { setSelectedWb(null); setWords([]) }
    fetchWordbooks()
  }

  const handleSelectWord = (word, idx) => {
    setPageFlip(true)
    setTimeout(() => { setSelectedWord(word); setSelectedIdx(idx); setPageFlip(false) }, 180)
  }

  const goNext = () => selectedIdx < words.length - 1 && handleSelectWord(words[selectedIdx + 1], selectedIdx + 1)
  const goPrev = () => selectedIdx > 0               && handleSelectWord(words[selectedIdx - 1], selectedIdx - 1)

  return (
    <div className="min-h-screen p-6" style={{ background: '#f5f0e8' }}>

      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#2d1b00' }}>나만의 단어장</h1>
        <p className="text-sm mt-1" style={{ color: '#8b6e4e' }}>PDF를 업로드하면 AI가 전공 단어를 자동 추출합니다 (최대 2개)</p>
      </div>

      <div className="max-w-6xl mx-auto mb-6">
        <PdfUploadBar wordbookCount={wordbooks.length} onComplete={fetchWordbooks} />
      </div>

      <div className="max-w-6xl mx-auto flex gap-8 items-start">

        {wordbooks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-96">
            <EmptyState icon="📂" message="아직 생성된 단어장이 없습니다." sub="PDF를 업로드하여 단어장을 만들어보세요." />
          </div>
        ) : (
          <>
            <WordbookSidebar
              wordbooks={wordbooks}
              selectedWb={selectedWb}
              onSelect={selectWordbook}
              onDelete={setShowDeleteModal}
            />

            {!selectedWb ? (
              <div className="flex-1 flex items-center justify-center min-h-96">
                <EmptyState icon="📚" message="왼쪽에서 단어장을 선택하세요" />
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
          </>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="단어장 삭제"
          description={<>"{showDeleteModal.title}" 단어장과 모든 단어가 삭제됩니다. 계속하시겠습니까?</>}
          onConfirm={() => deleteWordbook(showDeleteModal)}
          onCancel={() => setShowDeleteModal(null)}
        />
      )}
    </div>
  )
}
