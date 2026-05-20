import { useState } from 'react'
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { LIB } from '../constants/theme'

export default function CreateWordbookModal({ onClose, onComplete }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [words, setWords] = useState([
    { english: '', general_meaning: '', major_meaning: '', general_example: '', major_example: '' }
  ])
  const [submitting, setSubmitting] = useState(false)

  const handleAddWord = () => {
    setWords([...words, { english: '', general_meaning: '', major_meaning: '', general_example: '', major_example: '' }])
  }

  const handleRemoveWord = (index) => {
    setWords(words.filter((_, i) => i !== index))
  }

  const handleChange = (index, field, value) => {
    const newWords = [...words]
    newWords[index][field] = value
    setWords(newWords)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('단어장 제목을 입력해주세요.')
      return
    }

    const validWords = words.filter(w => w.english.trim() && w.general_meaning.trim() && w.major_meaning.trim() && w.general_example.trim() && w.major_example.trim())
    
    if (validWords.length === 0) {
      alert('모든 필드(영단어, 일반 뜻, 전공 뜻, 일반 예문, 전공 예문)가 입력된 단어가 최소 1개 이상 필요합니다.')
      return
    }

    setSubmitting(true)
    try {
      // 1. 단어장 생성 (커뮤니티 공개 상태로 생성)
      const { data: wbData, error: wbError } = await supabase
        .from('user_wordbooks')
        .insert({
          user_id: user.id,
          title: title.trim(),
          is_public: true,
          is_shared: false
        })
        .select()
        .single()

      if (wbError) {
        throw wbError
      }

      const wordbookId = wbData.id

      // 2. 단어들 생성
      const wordInserts = validWords.map(w => ({
        wordbook_id: wordbookId,
        english: w.english.trim(),
        general_meaning: w.general_meaning.trim(),
        major_meaning: w.major_meaning.trim(),
        general_example: w.general_example.trim(),
        major_example: w.major_example.trim(),
        word_level: 1
      }))

      const { error: wordsError } = await supabase
        .from('user_words')
        .insert(wordInserts)

      if (wordsError) throw wordsError

      alert('성공적으로 단어장이 커뮤니티에 등록되었습니다!')
      onComplete()
    } catch (error) {
      console.error('단어장 작성 실패:', error)
      alert(error.message || '단어장 등록 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(30,15,5,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.35)', maxHeight: '90vh' }}
      >
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: '#e8ddd0', background: '#faf6f0' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#2d1b00' }}>새 단어장 공유하기</h2>
            <p className="text-xs mt-1" style={{ color: '#8b6e4e' }}>내가 직접 만든 단어장을 커뮤니티에 게시합니다.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <X size={20} style={{ color: '#8b6e4e' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#2d1b00' }}>단어장 제목</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="예: 실무에서 자주 쓰는 디자인 패턴 용어"
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
              style={{ borderColor: '#e8ddd0', background: '#fdfbf9' }}
              onFocus={e => e.target.style.borderColor = LIB.wood}
              onBlur={e => e.target.style.borderColor = '#e8ddd0'}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold" style={{ color: '#2d1b00' }}>단어 목록</label>
              <span className="text-xs" style={{ color: '#8b6e4e' }}>최소 1개 이상 입력 (4개 항목 필수)</span>
            </div>
            
            <div className="space-y-4">
              {words.map((word, idx) => (
                <div key={idx} className="p-4 rounded-2xl border" style={{ borderColor: '#e8ddd0', background: '#fff' }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600">#{idx + 1}</span>
                    {words.length > 1 && (
                      <button onClick={() => handleRemoveWord(idx)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 mb-3">
                    <input
                      placeholder="영단어"
                      value={word.english}
                      onChange={e => handleChange(idx, 'english', e.target.value)}
                      className="px-3 py-2 rounded-lg text-sm border outline-none focus:border-[#8b6e4e]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      placeholder="일반 뜻"
                      value={word.general_meaning}
                      onChange={e => handleChange(idx, 'general_meaning', e.target.value)}
                      className="px-3 py-2 rounded-lg text-sm border outline-none focus:border-[#8b6e4e]"
                    />
                    <input
                      placeholder="일반 예문"
                      value={word.general_example}
                      onChange={e => handleChange(idx, 'general_example', e.target.value)}
                      className="px-3 py-2 rounded-lg text-sm border outline-none focus:border-[#8b6e4e]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="전공 뜻"
                      value={word.major_meaning}
                      onChange={e => handleChange(idx, 'major_meaning', e.target.value)}
                      className="px-3 py-2 rounded-lg text-sm border outline-none focus:border-[#8b6e4e]"
                    />
                    <input
                      placeholder="전공 예문"
                      value={word.major_example}
                      onChange={e => handleChange(idx, 'major_example', e.target.value)}
                      className="px-3 py-2 rounded-lg text-sm border outline-none focus:border-[#8b6e4e]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddWord}
              className="w-full mt-4 py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-bold transition-all hover:bg-gray-50"
              style={{ borderColor: '#e8ddd0', color: '#8b6e4e' }}
            >
              <Plus size={16} /> 단어 추가하기
            </button>
          </div>
        </div>

        <div className="p-5 border-t" style={{ borderColor: '#e8ddd0', background: '#faf6f0' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            style={{ background: LIB.wood }}
          >
            {submitting ? '등록 중...' : (
              <><CheckCircle2 size={18} /> 커뮤니티에 공유하기</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
