import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useMajor } from '../context/MajorContext'

export default function OfficialWordbookPage() {
  const { selectedMajors } = useMajor()
  const [wordbooks, setWordbooks] = useState([])
  const [selectedWb, setSelectedWb] = useState(null)
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedWord, setSelectedWord] = useState(null)

  useEffect(() => {
    fetchWordbooks()
  }, [selectedMajors])

  const fetchWordbooks = async () => {
    let query = supabase.from('official_wordbooks').select('*').order('created_at', { ascending: false })
    if (selectedMajors.length > 0) query = query.in('major', selectedMajors)
    const { data } = await query
    setWordbooks(data ?? [])
    setSelectedWb(null)
    setWords([])
    setSelectedWord(null)
  }

  const selectWordbook = async (wb) => {
    setSelectedWb(wb)
    setSelectedWord(null)
    setLoading(true)
    const { data } = await supabase
      .from('official_words')
      .select('*')
      .eq('wordbook_id', wb.id)
    setWords(data ?? [])
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">공식 단어장</h1>
      <p className="text-sm text-gray-400 mb-6">
        선택된 전공: {selectedMajors.length > 0 ? selectedMajors.join(', ') : '전공을 선택해주세요'}
      </p>

      <div className="flex gap-6">
        {/* 단어장 목록 */}
        <aside className="w-52 shrink-0 space-y-2">
          {wordbooks.length === 0 ? (
            <p className="text-sm text-gray-400">단어장을 불러오는 중...</p>
          ) : (
            wordbooks.map(wb => (
              <button
                key={wb.id}
                onClick={() => selectWordbook(wb)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition border
                  ${selectedWb?.id === wb.id
                    ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#7c3aed]'
                  }`}
              >
                <p className="font-medium">{wb.title}</p>
                <p className={`text-xs mt-0.5 ${selectedWb?.id === wb.id ? 'text-purple-200' : 'text-gray-400'}`}>
                  {wb.major}
                </p>
              </button>
            ))
          )}
        </aside>

        {/* 단어 목록 + 상세 카드 */}
        <div className="flex-1 min-w-0 flex gap-4">
          {/* 단어 1열 목록 */}
          <div className="w-56 shrink-0">
            {!selectedWb ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
                <p className="text-sm">왼쪽에서 단어장을 선택하세요</p>
              </div>
            ) : loading ? (
              <div className="text-center text-gray-400 py-10">불러오는 중...</div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-800 text-sm">{selectedWb.title}</h2>
                  <span className="text-xs text-gray-400">{words.length}개</span>
                </div>
                {words.map((word, idx) => (
                  <button
                    key={word.id}
                    onClick={() => setSelectedWord(word)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition border
                      ${selectedWord?.id === word.id
                        ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                        : 'bg-white text-gray-700 border-gray-100 hover:border-[#7c3aed] hover:text-[#7c3aed]'
                      }`}
                  >
                    <span className="text-xs opacity-50 mr-2">{idx + 1}</span>
                    <span className="font-medium">{word.english}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상세 카드 */}
          <div className="flex-1 min-w-0">
            {selectedWord ? (
              <div className="bg-linear-to-br from-[#7c3aed] to-[#4c1d95] rounded-3xl p-8 shadow-xl text-white h-full min-h-72 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-purple-300 mb-1 uppercase tracking-widest">
                    {selectedWb?.major}
                  </p>
                  <h2 className="text-4xl font-extrabold mb-6 leading-tight">{selectedWord.english}</h2>

                  <div className="space-y-4">
                    {selectedWord.general_meaning && (
                      <div className="bg-white/10 rounded-2xl px-5 py-4">
                        <p className="text-xs font-bold text-purple-300 mb-1 uppercase tracking-wider">일반 뜻</p>
                        <p className="text-white text-base leading-relaxed">{selectedWord.general_meaning}</p>
                        {selectedWord.general_example && (
                          <p className="text-purple-200 text-sm mt-2 italic opacity-80">{selectedWord.general_example}</p>
                        )}
                      </div>
                    )}

                    <div className="bg-white/20 rounded-2xl px-5 py-4 border border-white/20">
                      <p className="text-xs font-bold text-yellow-300 mb-1 uppercase tracking-wider">전공 뜻</p>
                      <p className="text-white text-base font-semibold leading-relaxed">{selectedWord.major_meaning}</p>
                      {selectedWord.major_example && (
                        <p className="text-purple-200 text-sm mt-2 italic opacity-80">{selectedWord.major_example}</p>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-purple-300 mt-6 opacity-60 text-right">
                  단어를 클릭해 다른 단어를 확인하세요
                </p>
              </div>
            ) : selectedWb && !loading ? (
              <div className="bg-white rounded-3xl p-10 text-center text-gray-300 border border-dashed border-gray-200 h-full min-h-72 flex flex-col items-center justify-center">
                <div className="text-5xl mb-4">👆</div>
                <p className="text-sm">단어를 선택하면 여기에 뜻이 표시됩니다</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
