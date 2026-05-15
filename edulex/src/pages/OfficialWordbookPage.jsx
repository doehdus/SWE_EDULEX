
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useMajor } from '../context/MajorContext'
import { BOOK_COLORS } from '../constants/theme'

export default function OfficialWordbookPage() {
  const { selectedMajors } = useMajor()
  const [wordbooks, setWordbooks] = useState([])
  const [selectedWb, setSelectedWb] = useState(null)
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedWord, setSelectedWord] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // selectedMajors 변경 시 단어장 목록 자동 갱신
  useEffect(() => { fetchWordbooks() }, [selectedMajors])

  const fetchWordbooks = async () => {
    let query = supabase.from('official_wordbooks').select('*').order('created_at', { ascending: false })
    if (selectedMajors.length > 0) query = query.in('major', selectedMajors)
    const { data } = await query
    setWordbooks(data ?? [])
    setSelectedWb(null); setWords([]); setSelectedWord(null); setModalOpen(false)
  }

  const selectWordbook = async (wb, colorIdx) => {
    setSelectedWb(wb)
    setSelectedWbColor(BOOK_COLORS[colorIdx % BOOK_COLORS.length])
    setSelectedWord(null); setSelectedIdx(null); setModalOpen(false)
    setLoading(true)
    const { data } = await supabase.from('official_words').select('*').eq('wordbook_id', wb.id)
    setWords(data ?? [])
    setLoading(false)
  }

  // 단어 카드 모달 (키보드 ← → ESC 지원)
  const openWord = useCallback((word, idx, dir = 'next') => {
    setSelectedWord(word); setSelectedIdx(idx); setModalOpen(true)
  }, [modalOpen])

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 72px)', background: 'linear-gradient(160deg, #f7f3ec 0%, #ede5d8 100%)' }}>
      {/* 전공 태그 헤더 */}
      <div className="shrink-0 max-w-6xl w-full mx-auto px-6 pt-5 pb-4">
        <h1 className="text-2xl font-black tracking-tight" style={{ color: '#2d1b00' }}>공식 단어장</h1>
        <p className="text-sm mt-1" style={{ color: '#8b6e4e' }}>
          {selectedMajors.length > 0
            ? selectedMajors.map(m => <span key={m} className="inline-block mr-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#e8ddd0', color: '#6b4226' }}>{m}</span>)
            : '전공을 선택해주세요'}
        </p>
      </div>
      {/* 사이드바 + 단어 목록 */}
      <div className="flex-1 min-h-0 max-w-6xl w-full mx-auto px-6 pb-5 flex gap-6">
        <WordbookSidebar wordbooks={wordbooks} selectedWb={selectedWb} onSelect={selectWordbook} />
        {!selectedWb ? <EmptyState message="왼쪽에서 단어장을 선택하세요" />
          : loading ? <LoadingState />
          : <WordList words={words} selectedWord={selectedWord} selectedWb={selectedWb} color={selectedWbColor} onSelectWord={openWord} />}
      </div>
    </div>
  )
}
