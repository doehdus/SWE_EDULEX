import { useState } from 'react'
import { LIB, MAJORS } from '../constants/theme'

export default function PostForm({ onSubmit, onCancel, initialValues, isEdit = false }) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [content, setContent] = useState(initialValues?.content ?? '')
  const [major, setMajor] = useState(initialValues?.major ?? MAJORS[0])
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    await onSubmit({ title: title.trim(), content: content.trim(), major })
    setSubmitting(false)
  }

  const disabled = submitting || !title.trim() || !content.trim()

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-extrabold mb-6" style={{ color: LIB.wood }}>
        {isEdit ? '게시글 수정' : '게시글 작성'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold mb-1.5 block" style={{ color: LIB.inkMid }}>전공</label>
          <select
            value={major}
            onChange={e => setMajor(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}`, color: LIB.ink }}
          >
            {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold mb-1.5 block" style={{ color: LIB.inkMid }}>제목</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}`, color: LIB.ink }}
          />
        </div>

        <div>
          <label className="text-xs font-bold mb-1.5 block" style={{ color: LIB.inkMid }}>내용</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={8}
            maxLength={3000}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
            style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}`, color: LIB.ink }}
          />
        </div>

        <div className="flex gap-3 justify-end">
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
            disabled={disabled}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            style={{
              background: disabled ? LIB.parchmentDark : LIB.wood,
              color: LIB.parchment,
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {submitting ? (isEdit ? '수정 중...' : '등록 중...') : (isEdit ? '수정' : '등록')}
          </button>
        </div>
      </form>
    </div>
  )
}
