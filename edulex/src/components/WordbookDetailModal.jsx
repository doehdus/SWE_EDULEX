import { useEffect, useState } from 'react'
import { X, Download, Hash } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { LoadingState } from './ui/StateViews'
import { BOOK_COLORS, LIB } from '../constants/theme'

export default function WordbookDetailModal({ wb, idx, onClose, onImport, isImporting }) {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const color = BOOK_COLORS[idx % BOOK_COLORS.length]

  useEffect(() => {
    async function fetchWords() {
      const { data, error } = await supabase
        .from('user_words')
        .select('*')
        .eq('wordbook_id', wb.id)
        .order('created_at', { ascending: true })
      
      if (!error && data) {
        setWords(data)
      }
      setLoading(false)
    }
    fetchWords()
  }, [wb.id])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(30,15,5,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.35)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 컬러 바 */}
        <div className="h-2 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${color.spine}, ${color.cover})` }} />

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-black/5 hover:bg-black/10"
        >
          <X size={16} style={{ color: '#2d1b00' }} />
        </button>

        {/* 상단 정보 */}
        <div className="px-8 pt-8 pb-6 border-b shrink-0" style={{ borderColor: '#e8ddd0', background: '#faf6f0' }}>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 inline-block"
            style={{ background: color.accent, color: color.spine }}>
            커뮤니티 공유 단어장
          </span>
          <h2 className="text-3xl font-black mb-2" style={{ color: '#2d1b00' }}>{wb.title}</h2>
          <div className="flex items-center gap-4 text-sm font-semibold" style={{ color: '#8b6e4e' }}>
            <span>작성자: {wb.author_nickname}</span>
            <span>•</span>
            <span>총 {words.length} 단어</span>
            <span>•</span>
            <span>공유 {wb.share_count}회</span>
          </div>
        </div>

        {/* 단어 리스트 */}
        <div className="flex-1 overflow-y-auto p-8" style={{ background: '#fdfbf9' }}>
          {loading ? (
            <div className="py-20 flex justify-center"><LoadingState /></div>
          ) : words.length === 0 ? (
            <p className="text-center py-20 text-gray-400">단어가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {words.map((word, i) => (
                <div key={word.id} className="p-5 rounded-2xl border" style={{ borderColor: '#e8ddd0', background: '#fff' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono font-bold mt-1" style={{ color: color.spine + '80' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-end gap-2 mb-3">
                        <h3 className="text-xl font-bold" style={{ color: '#2d1b00' }}>{word.english}</h3>
                        <Hash size={14} style={{ color: color.spine + '50', marginBottom: 4 }} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl" style={{ background: color.accent + '22' }}>
                          <p className="text-[10px] font-bold mb-1" style={{ color: color.spine }}>일반 의미</p>
                          <p className="text-sm font-semibold mb-2">{word.general_meaning || '-'}</p>
                          <p className="text-xs italic" style={{ color: '#8b6e4e' }}>{word.general_example || '-'}</p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: color.spine + '15' }}>
                          <p className="text-[10px] font-bold mb-1" style={{ color: color.spine }}>전공 의미</p>
                          <p className="text-sm font-semibold mb-2">{word.major_meaning}</p>
                          <p className="text-xs italic" style={{ color: '#8b6e4e' }}>{word.major_example}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 가져오기 버튼 */}
        <div className="p-6 border-t shrink-0 flex justify-end items-center gap-4" style={{ borderColor: '#e8ddd0', background: '#fff' }}>
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
            닫기
          </button>
          <button
            onClick={() => onImport(wb)}
            disabled={isImporting}
            className="px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:transform-none"
            style={{ background: LIB.wood, boxShadow: `0 4px 14px ${LIB.wood}40` }}
          >
            {isImporting ? '가져오는 중...' : (
              <><Download size={16} strokeWidth={2.5} /> 내 단어장으로 가져오기</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
