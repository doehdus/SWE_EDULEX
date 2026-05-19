import { useState, useEffect, useCallback } from 'react'
import { Trash2, Send } from 'lucide-react'
import { LIB } from '../constants/theme'
import UserAvatar from './ui/UserAvatar'

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function CommentSection({ postId, userId, fetchComments, createComment, deleteComment }) {
  const [comments, setComments] = useState([])
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    const { data } = await fetchComments(postId)
    setComments(data)
  }, [fetchComments, postId])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return
    setSubmitting(true)
    const { error } = await createComment({ postId, content: input.trim() })
    if (!error) {
      setInput('')
      await load()
    }
    setSubmitting(false)
  }

  async function handleDelete(commentId) {
    const { error } = await deleteComment(commentId)
    if (!error) setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <div>
      <p className="text-sm font-bold mb-3" style={{ color: LIB.wood }}>
        댓글 {comments.length}개
      </p>

      {/* 댓글 목록 */}
      <div className="flex flex-col gap-3 mb-4">
        {comments.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: LIB.inkLight }}>
            첫 번째 댓글을 작성해보세요.
          </p>
        )}
        {comments.map(c => {
          const author = c.users ?? {}
          return (
            <div key={c.id} className="rounded-xl px-4 py-3" style={{ background: LIB.parchment, border: `1px solid ${LIB.parchmentDark}` }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <UserAvatar iconIndex={author.icon_index} size={20} />
                  <span className="text-sm font-semibold" style={{ color: LIB.woodLight }}>{author.nickname ?? '알 수 없음'}</span>
                  {author.active_title && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: LIB.goldLight, color: LIB.wood }}>
                      {author.active_title}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: LIB.inkLight }}>{formatDate(c.created_at)}</span>
                  {c.user_id === userId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="transition hover:opacity-60"
                      style={{ color: LIB.deepRed }}
                    >
                      <Trash2 size={13} strokeWidth={1.8} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm" style={{ color: LIB.ink }}>{c.content}</p>
            </div>
          )
        })}
      </div>

      {/* 댓글 입력 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: LIB.cream,
            border: `1px solid ${LIB.shelfLine}`,
            color: LIB.ink,
          }}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={submitting || !input.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition"
          style={{
            background: submitting || !input.trim() ? LIB.parchmentDark : LIB.wood,
            color: LIB.parchment,
            opacity: submitting || !input.trim() ? 0.6 : 1,
          }}
        >
          <Send size={15} strokeWidth={2} />
        </button>
      </form>
    </div>
  )
}
