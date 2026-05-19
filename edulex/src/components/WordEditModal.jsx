import { useState, useEffect } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { LIB } from '../constants/theme'

export default function WordEditModal({ word, wordbookId, onClose, onComplete }) {
  const isEdit = !!word
  const [formData, setFormData] = useState({
    english: '',
    general_meaning: '',
    major_meaning: '',
    general_example: '',
    major_example: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (word) {
      setFormData({
        english: word.english || '',
        general_meaning: word.general_meaning || '',
        major_meaning: word.major_meaning || '',
        general_example: word.general_example || '',
        major_example: word.major_example || ''
      })
    }
  }, [word])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { english, general_meaning, major_meaning, general_example, major_example } = formData
    
    if (!english.trim() || !general_meaning.trim() || !major_meaning.trim() || !general_example.trim() || !major_example.trim()) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        const { error } = await supabase
          .from('user_words')
          .update({
            english: english.trim(),
            general_meaning: general_meaning.trim(),
            major_meaning: major_meaning.trim(),
            general_example: general_example.trim(),
            major_example: major_example.trim()
          })
          .eq('id', word.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_words')
          .insert({
            wordbook_id: wordbookId,
            english: english.trim(),
            general_meaning: general_meaning.trim(),
            major_meaning: major_meaning.trim(),
            general_example: general_example.trim(),
            major_example: major_example.trim(),
            word_level: 1
          })
        if (error) throw error
      }
      onComplete()
    } catch (err) {
      console.error(err)
      alert('단어 저장 중 오류가 발생했습니다.')
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
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}
      >
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: '#e8ddd0', background: '#faf6f0' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#2d1b00' }}>
              {isEdit ? '단어 수정' : '새 단어 추가'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <X size={20} style={{ color: '#8b6e4e' }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#2d1b00' }}>영단어</label>
            <input
              autoFocus
              value={formData.english}
              onChange={e => setFormData({ ...formData, english: e.target.value })}
              placeholder="예: Pattern"
              className="w-full px-4 py-2.5 rounded-xl border outline-none focus:border-[#8b6e4e] transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#2d1b00' }}>일반 뜻</label>
              <input
                value={formData.general_meaning}
                onChange={e => setFormData({ ...formData, general_meaning: e.target.value })}
                placeholder="예: 양식, 형태"
                className="w-full px-4 py-2.5 rounded-xl border outline-none focus:border-[#8b6e4e] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#2d1b00' }}>일반 예문</label>
              <input
                value={formData.general_example}
                onChange={e => setFormData({ ...formData, general_example: e.target.value })}
                placeholder="The pattern is very complex."
                className="w-full px-4 py-2.5 rounded-xl border outline-none focus:border-[#8b6e4e] transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#2d1b00' }}>전공 뜻</label>
              <input
                value={formData.major_meaning}
                onChange={e => setFormData({ ...formData, major_meaning: e.target.value })}
                placeholder="예: (디자인) 패턴"
                className="w-full px-4 py-2.5 rounded-xl border outline-none focus:border-[#8b6e4e] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#2d1b00' }}>전공 예문</label>
              <input
                value={formData.major_example}
                onChange={e => setFormData({ ...formData, major_example: e.target.value })}
                placeholder="We used the Singleton pattern."
                className="w-full px-4 py-2.5 rounded-xl border outline-none focus:border-[#8b6e4e] transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t" style={{ borderColor: '#e8ddd0', background: '#faf6f0' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            style={{ background: LIB.wood }}
          >
            {submitting ? '저장 중...' : (
              <><CheckCircle2 size={18} /> 저장하기</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
