import { useEffect, useState } from 'react'
import { PenSquare, Loader2, Users, Sparkles, Clock, Trophy } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { useCommunity } from '../hooks/useCommunity'
import { LoadingState, EmptyState } from '../components/ui/StateViews'
import { BOOK_COLORS, LIB, MAJORS } from '../constants/theme'
import CreateWordbookModal from '../components/CreateWordbookModal'
import WordbookDetailModal from '../components/WordbookDetailModal'
import PostCard from '../components/PostCard'
import PostDetail from '../components/PostDetail'
import PostForm from '../components/PostForm'

const MAJOR_TABS = ['전체', ...MAJORS]

function SharedWordbookCard({ wb, idx, onClick }) {
  const [hovered, setHovered] = useState(false)
  const color = BOOK_COLORS[idx % BOOK_COLORS.length]

  return (
    <div
      onClick={() => onClick(wb, idx)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl p-5 transition-all flex flex-col justify-between"
      style={{
        background: '#fff',
        border: `2px solid ${hovered ? color.accent : '#e8ddd0'}`,
        boxShadow: hovered ? `0 8px 24px ${color.spine}15` : '0 2px 8px #00000008',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <h3 className="font-bold text-lg leading-tight line-clamp-1" style={{ color: '#2d1b00' }}>
              {wb.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: color.accent + '40', color: color.spine }}>
                {wb.word_count} 단어
              </span>
              <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: '#8b6e4e' }}>
                <Users size={10} /> 공유 {wb.share_count}회
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-dashed" style={{ borderColor: '#e8ddd0' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: color.accent + '30', color: color.spine }}>
            <span className="font-bold text-xs">{wb.author_nickname?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#2d1b00' }}>
              {wb.author_nickname}
            </p>
            <div className="flex items-center gap-1.5">
              {wb.author_title && (
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#b09070' }}>
                  {wb.author_title}
                </span>
              )}
              {wb.author_bookmark > 0 && (
                <span className="text-[9px] font-bold flex items-center gap-0.5" style={{ color: LIB.gold }}>
                  <Trophy size={9} /> {wb.author_bookmark}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CommunityPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('wordbooks') // 'wordbooks' | 'posts'

  // N05 — 단어장 공유 state
  const [wordbooks, setWordbooks] = useState([])
  const [wbLoading, setWbLoading] = useState(true)
  const [sort, setSort] = useState('latest')
  const [importingId, setImportingId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [detailWb, setDetailWb] = useState(null)
  const [detailIdx, setDetailIdx] = useState(0)

  // N04 — 정보 공유 state
  const {
    posts, loading: postsLoading, selectedMajor, setSelectedMajor,
    fetchPosts, createPost, updatePost, deletePost,
    fetchComments, createComment, deleteComment,
  } = useCommunity(user)
  const [step, setStep] = useState('list')
  const [selectedPost, setSelectedPost] = useState(null)

  function handleTabChange(tab) {
    setActiveTab(tab)
    setStep('list')
    setSelectedPost(null)
  }

  // N05 fetch
  useEffect(() => {
    if (activeTab === 'wordbooks') fetchSharedWordbooks()
  }, [sort, activeTab])

  // N04 fetch
  useEffect(() => {
    if (activeTab === 'posts' && step === 'list') fetchPosts(selectedMajor)
  }, [step, selectedMajor, fetchPosts, activeTab])

  // N05 functions
  async function fetchSharedWordbooks() {
    setWbLoading(true)
    const { data, error } = await supabase.rpc('get_shared_wordbooks', { p_sort: sort })
    if (!error) setWordbooks(data || [])
    setWbLoading(false)
  }

  async function handleImport(wb) {
    if (wb.author_id === user.id) {
      alert('자신의 단어장은 가져올 수 없습니다.')
      return
    }
    setImportingId(wb.id)
    try {
      const { error } = await supabase.rpc('import_shared_wordbook', {
        p_user_id: user.id,
        p_source_wordbook_id: wb.id,
      })
      if (error) throw error
      alert(`"${wb.title}" 단어장을 성공적으로 가져왔습니다!\n나만의 단어장 탭에서 확인하세요.`)
      fetchSharedWordbooks()
      setDetailWb(null)
    } catch (e) {
      console.error(e)
      alert('단어장을 가져오는 중 오류가 발생했습니다.')
    } finally {
      setImportingId(null)
    }
  }

  // N04 functions
  function openPost(post) {
    setSelectedPost(post)
    setStep('detail')
  }

  async function handleCreatePost(data) {
    const { error } = await createPost(data)
    if (!error) setStep('list')
  }

  async function handleUpdatePost(postId, data) {
    const { error } = await updatePost(postId, data)
    if (!error) setSelectedPost(prev => ({ ...prev, ...data }))
    return { error }
  }

  async function handleDeletePost(postId) {
    const { error } = await deletePost(postId)
    if (!error) {
      setStep('list')
      setSelectedPost(null)
    }
  }

  // 게시글 작성/상세 화면은 탭 없이 전체 렌더
  if (activeTab === 'posts' && step === 'create') {
    return (
      <div className="px-6 py-8" style={{ minHeight: 'calc(100vh - 72px)', background: LIB.parchment }}>
        <div className="max-w-2xl mx-auto">
          <PostForm onSubmit={handleCreatePost} onCancel={() => setStep('list')} />
        </div>
      </div>
    )
  }

  if (activeTab === 'posts' && step === 'detail') {
    return (
      <div className="px-6 py-8" style={{ minHeight: 'calc(100vh - 72px)', background: LIB.parchment }}>
        <PostDetail
          post={selectedPost}
          userId={user?.id}
          onBack={() => { setStep('list'); setSelectedPost(null) }}
          onDelete={handleDeletePost}
          onUpdate={handleUpdatePost}
          fetchComments={fetchComments}
          createComment={createComment}
          deleteComment={deleteComment}
        />
      </div>
    )
  }

  return (
    <div style={{ background: LIB.parchment, minHeight: 'calc(100vh - 72px)' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3" style={{ color: LIB.wood }}>
            <Users style={{ color: LIB.wood }} /> 커뮤니티
          </h1>
        </div>

        {/* 메인 탭 */}
        <div className="flex gap-1 mb-6 border-b" style={{ borderColor: LIB.shelfLine }}>
          {[
            { key: 'wordbooks', label: '단어장 공유' },
            { key: 'posts', label: '정보 공유' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className="px-5 py-2.5 text-sm font-bold transition-colors"
              style={{
                color: activeTab === key ? LIB.wood : LIB.inkLight,
                borderBottom: activeTab === key ? `3px solid ${LIB.wood}` : '3px solid transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* N05 — 단어장 공유 */}
        {activeTab === 'wordbooks' && (
          <>
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <p className="font-medium text-sm" style={{ color: LIB.inkMid }}>
                다른 사용자들이 공유한 단어장을 탐색하고 내 학습에 활용해 보세요.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-black/10 hover:shadow-black/20"
                style={{ background: LIB.wood }}
              >
                + 단어장 작성하기
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6 border-b pb-1" style={{ borderColor: LIB.shelfLine }}>
              <button
                onClick={() => setSort('latest')}
                className="px-4 py-2 text-sm font-bold rounded-t-lg transition-colors flex items-center gap-1.5"
                style={{
                  color: sort === 'latest' ? LIB.wood : '#b09070',
                  borderBottom: sort === 'latest' ? `3px solid ${LIB.wood}` : '3px solid transparent',
                }}
              >
                <Clock size={14} /> 최신순
              </button>
              <button
                onClick={() => setSort('popular')}
                className="px-4 py-2 text-sm font-bold rounded-t-lg transition-colors flex items-center gap-1.5"
                style={{
                  color: sort === 'popular' ? LIB.wood : '#b09070',
                  borderBottom: sort === 'popular' ? `3px solid ${LIB.wood}` : '3px solid transparent',
                }}
              >
                <Sparkles size={14} /> 인기순
              </button>
            </div>

            {wbLoading ? (
              <div className="py-20 flex justify-center"><LoadingState /></div>
            ) : wordbooks.length === 0 ? (
              <div className="py-20 flex justify-center">
                <EmptyState message="아직 공유된 단어장이 없습니다." sub="가장 먼저 내 단어장을 공유해보세요!" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wordbooks.map((wb, idx) => (
                  <SharedWordbookCard
                    key={wb.id}
                    wb={wb}
                    idx={idx}
                    onClick={(w, i) => { setDetailWb(w); setDetailIdx(i) }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* N04 — 정보 공유 */}
        {activeTab === 'posts' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <p className="font-medium text-sm" style={{ color: LIB.inkMid }}>
                전공별 정보를 공유하고 질문해보세요.
              </p>
              <button
                onClick={() => setStep('create')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
                style={{ background: LIB.wood, color: LIB.parchment }}
              >
                <PenSquare size={15} strokeWidth={2} />
                글쓰기
              </button>
            </div>

            <div className="flex gap-2 flex-wrap mb-5">
              {MAJOR_TABS.map(tab => {
                const isActive = selectedMajor === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedMajor(tab)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
                    style={{
                      background: isActive ? LIB.wood : LIB.parchmentDark,
                      color: isActive ? LIB.parchment : LIB.inkMid,
                    }}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>

            {postsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin" style={{ color: LIB.woodLight }} />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm" style={{ color: LIB.inkLight }}>아직 게시글이 없습니다.</p>
                <p className="text-xs mt-1" style={{ color: LIB.inkLight }}>첫 번째 글을 작성해보세요!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onClick={() => openPost(post)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateWordbookModal
          onClose={() => setShowCreateModal(false)}
          onComplete={() => { setShowCreateModal(false); fetchSharedWordbooks() }}
        />
      )}

      {detailWb && (
        <WordbookDetailModal
          wb={detailWb}
          idx={detailIdx}
          onClose={() => setDetailWb(null)}
          onImport={handleImport}
          isImporting={importingId === detailWb.id}
        />
      )}
    </div>
  )
}
