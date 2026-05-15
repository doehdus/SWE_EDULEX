const fetchProgress = async () => {
  const { data: officialWbs } = await supabase.from('official_wordbooks').select('id, title, major')
  const { data: myWbs } = await supabase.from('user_wordbooks').select('id, title').eq('user_id', user.id)

  const allWbs = [
    ...(officialWbs ?? []).map(w => ({ ...w, type: 'official' })),
    ...(myWbs ?? []).map(w => ({ ...w, type: 'user' })),
  ]

  const results = await Promise.all(
    allWbs.map(async (wb) => {
      const table = wb.type === 'official' ? 'official_words' : 'user_words'
      const { count: total } = await supabase.from(table).select('id', { count: 'exact', head: true }).eq('wordbook_id', wb.id)
      const { count: completed } = await supabase.from('word_progress').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('wordbook_id', wb.id).eq('is_completed', true)
      const percent = total > 0 ? Math.round(((completed ?? 0) / total) * 100) : 0
      return { ...wb, total: total ?? 0, completed: completed ?? 0, percent }
    })
  )
  setProgressList(results)
  setLoading(false)
}