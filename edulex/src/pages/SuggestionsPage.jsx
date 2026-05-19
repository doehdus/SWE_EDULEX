import { useState, useEffect } from 'react'
import { PenSquare, Loader2, ChevronLeft, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSuggestions } from '../hooks/useSuggestions'
import { LIB } from '../constants/theme'

const STATUS_STYLE = {
  pending:  { label: '검토 중', bg: '#e5e7eb', color: '#374151' },
  approved: { label: '승인',    bg: '#d1fae5', color: '#065f46' },
  rejected: { label: '반려',    bg: '#fee2e2', color: '#991b1b' },
}

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function SuggestionItem({ item }) {
  const style = STATUS_STYLE[item.status] ?? STATUS_STYLE.pending
  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{ background: LIB.cream, border: `1px solid ${LIB.parchmentDark}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs" style={{ color: LIB.inkLight }}>{formatDate(item.created_at)}</span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: style.bg, color: style.color }}
        >
          {style.label}
        </span>
      </div>
      <p className="text-sm line-clamp-2 whitespace-pre-wrap" style={{ color: LIB.ink }}>
        {item.content}
      </p>
    </div>
  )
}

function SuggestionForm({ onSubmit, onCancel }) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    await onSubmit(content.trim())
    setSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onCancel}
        className="flex items-center gap-1 text-sm mb-5 transition hover:opacity-70"
        style={{ color: LIB.inkMid }}
      >
        <ChevronLeft size={16} strokeWidth={2} /> 목록으로
      </button>

      <h2 className="text-xl font-extrabold mb-6" style={{ color: LIB.wood }}>건의사항 작성</h2>
      <p className="text-xs mb-4" style={{ color: LIB.inkLight }}>
        작성 후 수정·삭제가 불가합니다. 신중하게 작성해주세요.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="건의사항 내용을 입력하세요..."
          rows={8}
          maxLength={1000}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
          style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}`, color: LIB.ink }}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: LIB.inkLight }}>{content.length} / 1000</span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-70"
              style={{ background: LIB.parchmentDark, color: LIB.inkMid }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{
                background: submitting || !content.trim() ? LIB.parchmentDark : LIB.wood,
                color: LIB.parchment,
                opacity: submitting || !content.trim() ? 0.6 : 1,
              }}
            >
              <Send size={14} strokeWidth={2} />
              {submitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default function SuggestionsPage() {
  const { user } = useAuth()
  const { suggestions, loading, fetchSuggestions, createSuggestion } = useSuggestions(user)
  const [step, setStep] = useState('list')

  useEffect(() => {
    if (step === 'list') fetchSuggestions()
  }, [step, fetchSuggestions])

  async function handleCreate(content) {
    const { error } = await createSuggestion(content)
    if (!error) setStep('list')
  }

  if (step === 'create') {
    return (
      <div className="px-6 py-8">
        <SuggestionForm onSubmit={handleCreate} onCancel={() => setStep('list')} />
      </div>
    )
  }

  return (
    <div className="px-6 py-8" style={{ background: LIB.parchment, minHeight: 'calc(100vh - 72px)' }}>
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: LIB.wood }}>건의사항</h1>
            <p className="text-xs mt-1" style={{ color: LIB.inkLight }}>
              서비스 개선 건의사항을 남겨주세요. 관리자가 검토 후 처리합니다.
            </p>
          </div>
          <button
            onClick={() => setStep('create')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
            style={{ background: LIB.wood, color: LIB.parchment }}
          >
            <PenSquare size={15} strokeWidth={2} />
            작성
          </button>
        </div>

        {/* 목록 */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: LIB.woodLight }} />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: LIB.inkLight }}>아직 작성한 건의사항이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {suggestions.map(s => <SuggestionItem key={s.id} item={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}
