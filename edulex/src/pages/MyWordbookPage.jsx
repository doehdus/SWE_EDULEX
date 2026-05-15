import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

export default function MyWordbookPage() {
  const { user } = useAuth()
  const [wordbooks, setWordbooks] = useState([])
  const [words, setWords] = useState([])
  const [wordCounts, setWordCounts] = useState({})

  useEffect(() => { fetchWordbooks() }, [user])

  // 사용자별 단어장 목록 + 각 단어장 단어 수 조회
  const fetchWordbooks = async () => {
    const { data } = await supabase.from('user_wordbooks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    const wbs = data ?? []
    setWordbooks(wbs)
    if (wbs.length > 0) {
      const counts = {}
      await Promise.all(wbs.map(async wb => {
        const { count } = await supabase.from('user_words').select('*', { count: 'exact', head: true }).eq('wordbook_id', wb.id)
        counts[wb.id] = count ?? 0
      }))
      setWordCounts(counts)
    }
  }

  // 단어장 선택 → user_words 조회
  const selectWordbook = async (wb, colorIdx) => {
    setSelectedWb(wb)
    setLoading(true)
    const { data } = await supabase.from('user_words').select('*').eq('wordbook_id', wb.id)
    setWords(data ?? [])
    setLoading(false)
  }

  // 단어장 삭제 (cascade → user_words도 삭제됨)
  const deleteWordbook = async (wb) => {
    await supabase.from('user_wordbooks').delete().eq('id', wb.id)
    setShowDeleteModal(null)
    if (selectedWb?.id === wb.id) { setSelectedWb(null); setWords([]) }
    fetchWordbooks()
  }
}
