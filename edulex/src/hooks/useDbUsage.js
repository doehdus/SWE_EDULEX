import { useState, useCallback } from 'react'
import { supabase } from '../utils/supabase'

// resource-monitor Edge Function 응답 shape:
// {
//   db: { size_bytes: number, row_counts: { [table]: number } },
//   storage: { size_bytes: number, file_count: number },
//   edge_functions: { invocations_today: number, invocations_total: number },
//   fetched_at: string (ISO)
// }

const INITIAL_METRICS = null

export function useDbUsage() {
  const [metrics, setMetrics]   = useState(INITIAL_METRICS)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [fetchedAt, setFetchedAt] = useState(null)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fnError } = await supabase.functions.invoke('resource-monitor')
    if (fnError) {
      console.error('[useDbUsage] resource-monitor error:', fnError)
      setError(fnError.message ?? '데이터를 불러오지 못했습니다.')
      setLoading(false)
      return
    }
    setMetrics(data ?? null)
    setFetchedAt(data?.fetched_at ? new Date(data.fetched_at) : new Date())
    setLoading(false)
  }, [])

  return { metrics, loading, error, fetchedAt, fetchMetrics }
}
