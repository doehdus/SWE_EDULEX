import { useState, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export function useCommunity(user) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMajor, setSelectedMajor] = useState('전체')

  const fetchPosts = useCallback(async (major) => {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, users(nickname, bookmark, active_title, icon_index), comments(count)')
      .order('created_at', { ascending: false })

    if (major && major !== '전체') {
      query = query.eq('major', major)
    }

    const { data, error } = await query
    if (!error) setPosts(data ?? [])
    setLoading(false)
  }, [])

  const createPost = useCallback(async ({ title, content, major }) => {
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      title,
      content,
      major,
    })
    return { error }
  }, [user])

  const deletePost = useCallback(async (postId) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    return { error }
  }, [])

  const updatePost = useCallback(async (postId, { title, content, major }) => {
    const { error } = await supabase
      .from('posts')
      .update({ title, content, major })
      .eq('id', postId)
    return { error }
  }, [])

  const fetchComments = useCallback(async (postId) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(nickname, bookmark, active_title, icon_index)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    return { data: data ?? [], error }
  }, [])

  const createComment = useCallback(async ({ postId, content }) => {
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content,
    })
    return { error }
  }, [user])

  const deleteComment = useCallback(async (commentId) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    return { error }
  }, [])

  return {
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
  }
}
