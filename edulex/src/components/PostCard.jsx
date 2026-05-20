import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { LIB } from '../constants/theme'
import UserAvatar from './ui/UserAvatar'

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function PostCard({ post, onClick }) {
  const [hovered, setHovered] = useState(false)
  const author = post.users ?? {}

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl px-5 py-4 cursor-pointer"
      style={{
        background: hovered ? LIB.parchment : LIB.cream,
        border: `1px solid ${hovered ? LIB.shelfLine : LIB.parchmentDark}`,
        transition: 'all 0.18s ease',
        boxShadow: hovered ? '0 4px 16px rgba(92,58,30,0.10)' : '0 1px 4px rgba(92,58,30,0.06)',
      }}
    >
      {/* 전공 배지 + 날짜 */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: LIB.parchmentDark, color: LIB.wood }}
        >
          {post.major}
        </span>
        <span className="text-xs" style={{ color: LIB.inkLight }}>
          {formatDate(post.created_at)}
        </span>
      </div>

      {/* 제목 */}
      <p className="font-bold text-base mb-2 line-clamp-2" style={{ color: LIB.ink }}>
        {post.title}
      </p>

      {/* 작성자 + 댓글 수 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <UserAvatar iconIndex={author.icon_index} size={22} />
          <span className="text-sm font-semibold" style={{ color: LIB.woodLight }}>
            {author.nickname ?? '알 수 없음'}
          </span>
          {author.active_title && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: LIB.goldLight, color: LIB.wood }}>
              {author.active_title}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs" style={{ color: LIB.inkLight }}>
          <MessageCircle size={13} strokeWidth={1.8} />
          {post.comments?.[0]?.count ?? 0}
        </span>
      </div>
    </div>
  )
}
