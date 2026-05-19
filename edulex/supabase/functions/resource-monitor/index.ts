import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

// 임계치 상수 (bytes)
const DB_LIMIT_BYTES      = 500 * 1024 * 1024  // 500MB (Supabase Free 기준)
const STORAGE_LIMIT_BYTES = 1   * 1024 * 1024 * 1024  // 1GB

serve(async (req) => {
  // 1. Preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 2. JWT 인증
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return new Response(JSON.stringify({ message: '인증 토큰이 없습니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
      },
    })
    if (!userRes.ok) {
      await userRes.body?.cancel()
      return new Response(JSON.stringify({ message: '인증 실패' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const user = await userRes.json()
    if (!user?.id) {
      return new Response(JSON.stringify({ message: '인증 실패' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Admin client 생성
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // 4. 관리자 role 확인
    const { data: callerData, error: callerError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (callerError || !callerData) {
      return new Response(JSON.stringify({ message: '사용자 정보를 확인할 수 없습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (callerData.role !== 'admin') {
      return new Response(JSON.stringify({ message: '관리자만 접근할 수 있습니다.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 5. DB 통계 조회 (get_db_stats RPC — admin 호출자로 동작하도록 user JWT로 호출)
    const dbStatsRes = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/get_db_stats`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
        },
        body: JSON.stringify({}),
      }
    )
    if (!dbStatsRes.ok) {
      const errText = await dbStatsRes.text()
      throw new Error(`get_db_stats RPC 실패: ${errText}`)
    }
    const dbStats: { db_size_bytes: number; table_stats: { table_name: string; row_count: number }[] }
      = await dbStatsRes.json()

    // 6. Storage 사용량 조회 (Management API)
    //    Supabase Management API: GET /v1/projects/{ref}/storage/buckets
    //    Storage 총 사용량은 Management API가 아닌 storage.objects 집계로 대체
    const projectRef = Deno.env.get('SUPABASE_PROJECT_REF') ?? ''
    let storageSizeBytes = 0

    if (projectRef) {
      // Management API를 통한 Storage 사용량 조회 시도
      const mgmtRes = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/storage/stats`,
        {
          headers: {
            Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}`,
          },
        }
      )
      if (mgmtRes.ok) {
        const mgmtData = await mgmtRes.json()
        storageSizeBytes = mgmtData?.size_bytes ?? 0
      } else {
        await mgmtRes.body?.cancel()
        // Management API 실패 시 storage.objects에서 metadata 집계로 폴백
        storageSizeBytes = await estimateStorageSizeFromObjects(supabase)
      }
    } else {
      // projectRef 없으면 storage.objects 집계 폴백
      storageSizeBytes = await estimateStorageSizeFromObjects(supabase)
    }

    // 7. 임계치 비율 계산
    const dbSizeBytes = dbStats.db_size_bytes ?? 0
    const dbThresholdPct      = Math.round((dbSizeBytes / DB_LIMIT_BYTES) * 10000) / 100
    const storageThresholdPct = Math.round((storageSizeBytes / STORAGE_LIMIT_BYTES) * 10000) / 100

    // 8. 최근 로그 30개 조회
    const { data: recentLogs } = await supabase
      .from('resource_logs')
      .select('logged_date, db_size_bytes, storage_size_bytes, db_threshold_pct, storage_threshold_pct, alert_sent, created_at')
      .order('logged_date', { ascending: false })
      .limit(30)

    // 9. 응답 반환
    return new Response(
      JSON.stringify({
        db_size_bytes:           dbSizeBytes,
        db_size_mb:              Math.round(dbSizeBytes / 1024 / 1024 * 100) / 100,
        db_limit_mb:             Math.round(DB_LIMIT_BYTES / 1024 / 1024),
        db_threshold_pct:        dbThresholdPct,
        storage_size_bytes:      storageSizeBytes,
        storage_size_mb:         Math.round(storageSizeBytes / 1024 / 1024 * 100) / 100,
        storage_limit_mb:        Math.round(STORAGE_LIMIT_BYTES / 1024 / 1024),
        storage_threshold_pct:   storageThresholdPct,
        table_stats:             dbStats.table_stats ?? [],
        recent_logs:             recentLogs ?? [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// storage.objects 테이블에서 metadata.size 합산으로 스토리지 크기 추정
async function estimateStorageSizeFromObjects(
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  // storage.objects는 service role로만 접근 가능
  const { data, error } = await supabase
    .from('objects')
    .select('metadata')
    .schema('storage' as never)

  if (error || !data) return 0

  let total = 0
  for (const obj of data) {
    const size = (obj.metadata as { size?: number } | null)?.size ?? 0
    total += size
  }
  return total
}
