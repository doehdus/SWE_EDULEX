import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import PdfUploadBar from '../components/PdfUploadBar'

function WordCard({ word }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition border border-gray-100 select-none"
    >
      <div className="text-xl font-bold text-[#7c3aed] mb-2">{word.english}</div>
      {flipped ? (
        <div className="space-y-2 text-sm">
          {word.general_meaning && (
            <p className="text-gray-400">
              <span className="text-xs font-semibold text-gray-300 mr-1">일반</span>
              {word.general_meaning}
            </p>
          )}
          <p className="text-gray-700">
            <span className="text-xs font-semibold text-[#7c3aed] mr-1">전공</span>
            {word.major_meaning}
          </p>
        </div>
      ) : (
        <p className="text-xs text-gray-300">클릭하여 뜻 확인</p>
      )}
    </div>
  )
}

export default function MyWordbookPage() {
  const { user } = useAuth()
  const [wordbooks, setWordbooks] = useState([])
  const [selectedWb, setSelectedWb] = useState(null)
  const [words, setWords] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [loading, setLoading] = useState(false)

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
    const { data } = await supabase
      .from('user_words')
      .select('*')
      .eq('wordbook_id', wb.id)
    setWords(data ?? [])
    setLoading(false)
  }

  const deleteWordbook = async (wb) => {
    // cascade 삭제 — user_words도 함께 삭제됨
    await supabase.from('user_wordbooks').delete().eq('id', wb.id)
    setShowDeleteModal(null)
    if (selectedWb?.id === wb.id) { setSelectedWb(null); setWords([]) }
    fetchWordbooks()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">나만의 단어장</h1>
      <p className="text-sm text-gray-400 mb-6">PDF를 업로드하면 AI가 전공 단어를 자동 추출합니다 (최대 2개)</p>

      {/* 상단 PDF 업로드 바 (SBI-H04 연동) */}
      <div className="mb-6">
        <PdfUploadBar
          wordbookCount={wordbooks.length}
          onComplete={() => fetchWordbooks()}
        />
      </div>

      {/* 단어장 카드 목록 (최대 2개) */}
      {wordbooks.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
          <p className="text-4xl mb-3">📂</p>
          <p className="text-sm">아직 생성된 단어장이 없습니다.<br />PDF를 업로드하여 단어장을 만들어보세요.</p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* 단어장 카드 2개 배치 */}
          <aside className="w-56 shrink-0 space-y-3">
            {wordbooks.map(wb => (
              <div
                key={wb.id}
                className={`bg-white rounded-2xl p-4 border cursor-pointer hover:border-[#7c3aed] transition group
                  ${selectedWb?.id === wb.id ? 'border-[#7c3aed] shadow-md' : 'border-gray-200'}`}
                onClick={() => selectWordbook(wb)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">{wb.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">AI 생성</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setShowDeleteModal(wb) }}
                    className="text-gray-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </aside>

          {/* 단어 카드 (읽기 전용) */}
          <div className="flex-1">
            {!selectedWb ? (
              <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
                <p className="text-sm">단어장을 선택하세요</p>
              </div>
            ) : loading ? (
              <div className="text-center text-gray-400 py-10">불러오는 중...</div>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">단어장 삭제</h3>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-gray-800">"{showDeleteModal.title}"</span> 단어장과
              모든 단어가 삭제됩니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => deleteWordbook(showDeleteModal)}
                className="flex-1 py-2.5 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
