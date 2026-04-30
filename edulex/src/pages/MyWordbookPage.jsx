import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import PdfUploadBar from '../components/PdfUploadBar'
import { ConfirmModal } from '../components/ui/Modal'
import { LoadingState, EmptyState } from '../components/ui/StateViews'
import { COLOR } from '../constants/theme'

// ── 단어 카드 (클릭하면 뒤집힘) ──────────────────────────────────

function WordCard({ word }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition border border-gray-100 select-none"
    >
      <div className="text-xl font-bold mb-2" style={{ color: COLOR.purple }}>{word.english}</div>
      {flipped ? (
        <div className="space-y-2 text-sm">
          {word.general_meaning && (
            <p className="text-gray-400">
              <span className="text-xs font-semibold text-gray-300 mr-1">일반</span>
              {word.general_meaning}
            </p>
          )}
          <p className="text-gray-700">
            <span className="text-xs font-semibold mr-1" style={{ color: COLOR.purple }}>전공</span>
            {word.major_meaning}
          </p>
        </div>
      ) : (
        <p className="text-xs text-gray-300">클릭하여 뜻 확인</p>
      )}
    </div>
  )
}

// ── 단어장 선택 사이드바 ──────────────────────────────────────────

function WordbookSidebar({ wordbooks, selectedWb, onSelect, onDelete }) {
  return (
    <aside className="w-56 shrink-0 space-y-3">
      {wordbooks.map(wb => (
        <div
          key={wb.id}
          onClick={() => onSelect(wb)}
          className={`bg-white rounded-2xl p-4 border cursor-pointer hover:border-[#7c3aed] transition group
            ${selectedWb?.id === wb.id ? 'border-[#7c3aed] shadow-md' : 'border-gray-200'}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800 truncate max-w-35">{wb.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">AI 생성</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(wb) }}
              className="text-gray-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </aside>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────

export default function MyWordbookPage() {
  const { user } = useAuth()
  const [wordbooks, setWordbooks]         = useState([])
  const [selectedWb, setSelectedWb]       = useState(null)
  const [words, setWords]                 = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [loading, setLoading]             = useState(false)

  useEffect(() => { fetchWordbooks() }, [user])

  const fetchWordbooks = async () => {
    const { data } = await supabase
      .from('user_wordbooks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setWordbooks(data ?? [])
  }

  const selectWordbook = async (wb) => {
    setSelectedWb(wb)
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1a1a2e' }}>나만의 단어장</h1>
      <p className="text-sm text-gray-400 mb-6">PDF를 업로드하면 AI가 전공 단어를 자동 추출합니다 (최대 2개)</p>

      {/* PDF 업로드 바 */}
      <div className="mb-6">
        <PdfUploadBar wordbookCount={wordbooks.length} onComplete={fetchWordbooks} />
      </div>

      {/* 단어장 목록 */}
      {wordbooks.length === 0 ? (
        <div className="bg-white rounded-2xl p-4">
          <EmptyState icon="📂" message="아직 생성된 단어장이 없습니다." sub="PDF를 업로드하여 단어장을 만들어보세요." />
        </div>
      ) : (
        <div className="flex gap-6">
          {/* 단어장 카드 목록 */}
          <WordbookSidebar
            wordbooks={wordbooks}
            selectedWb={selectedWb}
            onSelect={selectWordbook}
            onDelete={setShowDeleteModal}
          />

          {/* 단어 카드 영역 */}
          <div className="flex-1">
            {!selectedWb ? (
              <div className="bg-white rounded-2xl p-4">
                <EmptyState message="단어장을 선택하세요" />
              </div>
            ) : loading ? (
              <LoadingState />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800">{selectedWb.title}</h2>
                  <span className="text-xs text-gray-400">{words.length}개 단어</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {words.map(word => <WordCard key={word.id} word={word} />)}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
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
