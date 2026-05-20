import { useState, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export function useSuggestions(user) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchSuggestions = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('suggestions')
      .select('id, content, status, created_at')
      .order('created_at', { ascending: false })
    if (!error) setSuggestions(data ?? [])
    setLoading(false)
  }, [])

  const createSuggestion = useCallback(async (content) => {
    const { error } = await supabase.from('suggestions').insert({
      user_id: user.id,
      content,
    })
    return { error }
  }, [user])

  return { suggestions, loading, fetchSuggestions, createSuggestion }
}
