import { useState, useEffect } from 'react'
import { PenSquare, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCommunity } from '../hooks/useCommunity'
import { LIB, MAJORS } from '../constants/theme'
import PostCard from '../components/PostCard'
import PostDetail from '../components/PostDetail'
import PostForm from '../components/PostForm'

const TABS = ['전체', ...MAJORS]

export default function CommunityPage() {
  const { user } = useAuth()
  const {
    posts,
    loading,
    selectedMajor,
    setSelectedMajor,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    fetchComments,
    createComment,
    deleteComment,
  } = useCommunity(user)

  const [step, setStep] = useState('list')
  const [selectedPost, setSelectedPost] = useState(null)

  useEffect(() => {
    if (step === 'list') fetchPosts(selectedMajor)
  }, [step, selectedMajor, fetchPosts])

  function handleTabChange(tab) {
    setSelectedMajor(tab)
  }

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

  if (step === 'create') {
    return (
      <div className="px-6 py-8">
        <PostForm
          onSubmit={handleCreatePost}
          onCancel={() => setStep('list')}
        />
      </div>
    )
  }

  if (step === 'detail') {
    return (
      <div className="px-6 py-8">
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
    <div className="px-6 py-8" style={{ background: LIB.parchment, minHeight: 'calc(100vh - 72px)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold" style={{ color: LIB.wood }}>커뮤니티</h1>
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
          {TABS.map(tab => {
            const isActive = selectedMajor === tab
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
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

        {loading ? (
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
    </div>
  )
}
