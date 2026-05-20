import { useState } from 'react'
import { ChevronLeft, Trash2, Pencil } from 'lucide-react'
import { LIB } from '../constants/theme'
import CommentSection from './CommentSection'
import PostForm from './PostForm'
import UserAvatar from './ui/UserAvatar'

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function PostDetail({
  post,
  userId,
  onBack,
  onDelete,
  onUpdate,
  fetchComments,
  createComment,
  deleteComment,
}) {
  const [isEditing, setIsEditing] = useState(false)

  if (!post) return null

  const author = post.users ?? {}
  const isOwner = post.user_id === userId

  async function handleUpdate(data) {
    const { error } = await onUpdate(post.id, data)
    if (!error) setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="px-0">
        <button
          onClick={() => setIsEditing(false)}
          className="flex items-center gap-1 text-sm mb-5 transition hover:opacity-70"
          style={{ color: LIB.inkMid }}
        >
          <ChevronLeft size={16} strokeWidth={2} />
          취소
        </button>
        <PostForm
          initialValues={{ title: post.title, content: post.content, major: post.major }}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isEdit
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm mb-5 transition hover:opacity-70"
        style={{ color: LIB.inkMid }}
      >
        <ChevronLeft size={16} strokeWidth={2} />
        목록으로
      </button>

      <div className="rounded-2xl p-6 mb-4" style={{ background: LIB.cream, border: `1px solid ${LIB.parchmentDark}` }}>
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: LIB.parchmentDark, color: LIB.wood }}
          >
            {post.major}
          </span>
          {isOwner && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs transition hover:opacity-70"
                style={{ color: LIB.woodLight }}
              >
                <Pencil size={13} strokeWidth={1.8} /> 수정
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="flex items-center gap-1 text-xs transition hover:opacity-70"
                style={{ color: LIB.deepRed }}
              >
                <Trash2 size={13} strokeWidth={1.8} /> 삭제
              </button>
            </div>
          )}
        </div>

        <h2 className="text-xl font-extrabold mb-4" style={{ color: LIB.ink }}>{post.title}</h2>

        <div className="flex items-center gap-2 pb-4 mb-4" style={{ borderBottom: `1px solid ${LIB.parchmentDark}` }}>
          <UserAvatar iconIndex={author.icon_index} size={26} />
          <span className="font-semibold text-sm" style={{ color: LIB.woodLight }}>{author.nickname ?? '알 수 없음'}</span>
          {author.active_title && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: LIB.goldLight, color: LIB.wood }}>
              {author.active_title}
            </span>
          )}
          <span className="ml-auto text-xs" style={{ color: LIB.inkLight }}>{formatDate(post.created_at)}</span>
        </div>

        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: LIB.ink }}>{post.content}</p>
      </div>

      <div className="rounded-2xl p-6" style={{ background: LIB.cream, border: `1px solid ${LIB.parchmentDark}` }}>
        <CommentSection
          postId={post.id}
          userId={userId}
          fetchComments={fetchComments}
          createComment={createComment}
          deleteComment={deleteComment}
        />
      </div>
    </div>
  )
}
