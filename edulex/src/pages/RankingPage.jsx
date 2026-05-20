import { useEffect } from 'react'
import { Bookmark, Loader2, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useRanking } from '../hooks/useRanking'
import { LIB } from '../constants/theme'

const MEDAL = {
  1: { bg: '#FFD700', color: '#7a5c00', label: '🥇' },
  2: { bg: '#C0C0C0', color: '#555555', label: '🥈' },
  3: { bg: '#CD7F32', color: '#5c2d00', label: '🥉' },
}

function RankRow({ rank, user, isMe }) {
  const medal = MEDAL[rank]

  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5 rounded-2xl"
      style={{
        background: isMe ? LIB.parchment : LIB.cream,
        border: `1.5px solid ${isMe ? LIB.gold : LIB.parchmentDark}`,
        boxShadow: isMe ? `0 0 0 2px ${LIB.goldLight}` : 'none',
      }}
    >
      {/* 순위 */}
      <div className="w-8 flex-shrink-0 text-center">
        {medal ? (
          <span className="text-xl">{medal.label}</span>
        ) : (
          <span className="text-sm font-extrabold" style={{ color: LIB.inkMid }}>{rank}</span>
        )}
      </div>

      {/* 닉네임 + 칭호 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm truncate" style={{ color: LIB.ink }}>
            {user.nickname ?? '알 수 없음'}
          </span>
          {isMe && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: LIB.gold, color: LIB.ink }}>
              나
            </span>
          )}
          {user.active_title && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: LIB.parchmentDark, color: LIB.wood }}>
              {user.active_title}
            </span>
          )}
        </div>
      </div>

      {/* 책갈피 수 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Bookmark size={14} strokeWidth={2} style={{ color: LIB.gold }} />
        <span className="text-sm font-bold" style={{ color: LIB.woodLight }}>
          {(user.bookmark ?? 0).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default function RankingPage() {
  const { user, profile } = useAuth()
  const { topUsers, myRank, loading, isInTop10, fetchRanking } = useRanking(user)

  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  return (
    <div className="px-6 py-8" style={{ background: LIB.parchment, minHeight: 'calc(100vh - 72px)' }}>
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-8">
          <Trophy size={26} strokeWidth={1.8} style={{ color: LIB.gold }} />
          <h1 className="text-2xl font-extrabold" style={{ color: LIB.wood }}>랭킹</h1>
          <span className="text-sm" style={{ color: LIB.inkLight }}>책갈피 수 기준</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: LIB.woodLight }} />
          </div>
        ) : (
          <>
            {/* 상위 10위 목록 */}
            <div className="flex flex-col gap-2">
              {topUsers.map((u, i) => (
                <RankRow
                  key={u.id}
                  rank={i + 1}
                  user={u}
                  isMe={u.id === user?.id}
                />
              ))}
            </div>

            {/* 10위 밖 내 순위 별도 표시 */}
            {!isInTop10 && myRank !== null && user && (
              <>
                <div className="my-3 flex items-center gap-2">
                  <div className="flex-1 h-px" style={{ background: LIB.parchmentDark }} />
                  <span className="text-xs" style={{ color: LIB.inkLight }}>내 순위</span>
                  <div className="flex-1 h-px" style={{ background: LIB.parchmentDark }} />
                </div>
                <RankRow
                  rank={myRank}
                  user={{
                    id: user.id,
                    nickname: profile?.nickname ?? user.email,
                    bookmark: profile?.bookmark ?? 0,
                    active_title: profile?.active_title ?? null,
                  }}
                  isMe
                />
              </>
            )}

            {topUsers.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm" style={{ color: LIB.inkLight }}>랭킹 정보가 없습니다.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
