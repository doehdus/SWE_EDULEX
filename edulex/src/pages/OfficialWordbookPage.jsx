// MajorContext selectedMajors 구독 → 전공 변경 시 자동 갱신
useEffect(() => { fetchWordbooks() }, [selectedMajors])

const fetchWordbooks = async () => {
  let query = supabase.from('official_wordbooks').select('*').order('created_at', { ascending: false })
  if (selectedMajors.length > 0) query = query.in('major', selectedMajors)
  const { data } = await query
  setWordbooks(data ?? [])
  setSelectedWb(null)
  setWords([])
}

const selectWordbook = async (wb, colorIdx) => {
  setSelectedWb(wb)
  setSelectedWbColor(BOOK_COLORS[colorIdx % BOOK_COLORS.length])
  setLoading(true)
  const { data } = await supabase.from('official_words').select('*').eq('wordbook_id', wb.id)
  setWords(data ?? [])
  setLoading(false)
}