import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ----------------------------------------------------------------
// resource-cron Edge Function
//
// 호출 방법:
//   1. Supabase pg_cron (권장):
//      SELECT cron.schedule('resource-cron-daily', '0 0 * * *',
//        $$SELECT net.http_post(
//          url := '<SUPABASE_URL>/functions/v1/resource-cron',
//          body := '{"cron_secret":"<CRON_SECRET>"}'::jsonb,
//          headers := '{"Content-Type":"application/json"}'::jsonb
//        ) AS request_id;$$
//      );
//
//   2. 외부 cron 서비스(GitHub Actions, cron-job.org 등)에서
//      POST /functions/v1/resource-cron  body: {"cron_secret": "..."}
//
// 환경 변수:
//   CRON_SECRET            — 무단 호출 방지용 공유 비밀
//   RESEND_API_KEY         — Resend 이메일 API 키
//   ADMIN_EMAIL            — 알림 수신 관리자 이메일
//   SUPABASE_PROJECT_REF   — Storage Management API용 프로젝트 ref (선택)
// ----------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

// 임계치 상수 (bytes)
const DB_LIMIT_BYTES          = 500 * 1024 * 1024       // 500MB
const STORAGE_LIMIT_BYTES     = 1 * 1024 * 1024 * 1024  // 1GB
const DB_ALERT_THRESHOLD_PCT  = 90                       // 90% 이상 → 알림
const ST_ALERT_THRESHOLD_PCT  = 90                       // 90% 이상 → 알림

serve(async (req) => {
  // 1. Preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 2. Content-Type 검증
    const contentType = req.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ message: `Invalid Content-Type: ${contentType}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Body 파싱
    const rawBody = await req.text()
    let parsedBody: { cron_secret?: string }
    try {
      parsedBody = JSON.parse(rawBody)
    } catch {
      return new Response(
        JSON.stringify({ message: 'Request body is not valid JSON.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Cron secret 검증 (무단 호출 방지)
    const cronSecret = Deno.env.get('CRON_SECRET')
    if (!cronSecret) {
      throw new Error('CRON_SECRET environment variable is not set.')
    }
    if (parsedBody.cron_secret !== cronSecret) {
      return new Response(JSON.stringify({ message: 'Unauthorized cron request.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 5. Admin Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // 6. DB 크기 조회 (get_db_size_bytes RPC — migration D항목)
    const { data: dbSizeRow, error: dbSizeError } = await supabase
      .rpc('get_db_size_bytes')
    if (dbSizeError) {
      throw new Error(`get_db_size_bytes RPC 실패: ${dbSizeError.message}`)
    }
    const dbSizeBytes: number = (dbSizeRow as number) ?? 0

    // 7. Storage 크기 조회
    const storageSizeBytes = await getStorageSize(supabase)

    // 8. 임계치 비율 계산
    const dbThresholdPct      = parseFloat(((dbSizeBytes / DB_LIMIT_BYTES) * 100).toFixed(2))
    const storageThresholdPct = parseFloat(((storageSizeBytes / STORAGE_LIMIT_BYTES) * 100).toFixed(2))

    // 9. 알림 필요 여부 판단
    const needsAlert = dbThresholdPct >= DB_ALERT_THRESHOLD_PCT
                    || storageThresholdPct >= ST_ALERT_THRESHOLD_PCT

    let alertSent = false
    if (needsAlert) {
      alertSent = await sendAlertEmail(
        dbSizeBytes,
        storageSizeBytes,
        dbThresholdPct,
        storageThresholdPct
      )
    }

    // 10. resource_logs에 저장 (save_resource_log RPC)
    const { error: logError } = await supabase.rpc('save_resource_log', {
      p_db_size_bytes:         dbSizeBytes,
      p_storage_size_bytes:    storageSizeBytes,
      p_db_threshold_pct:      dbThresholdPct,
      p_storage_threshold_pct: storageThresholdPct,
      p_alert_sent:            alertSent,
    })
    if (logError) {
      throw new Error(`save_resource_log 실패: ${logError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        db_size_bytes:        dbSizeBytes,
        storage_size_bytes:   storageSizeBytes,
        db_threshold_pct:     dbThresholdPct,
        storage_threshold_pct: storageThresholdPct,
        alert_sent:           alertSent,
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

// ----------------------------------------------------------------
// Storage 크기 집계
// Supabase Management API 또는 storage.objects 폴백
// ----------------------------------------------------------------
async function getStorageSize(
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  const projectRef = Deno.env.get('SUPABASE_PROJECT_REF') ?? ''

  if (projectRef) {
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
      return mgmtData?.size_bytes ?? 0
    }
    await mgmtRes.body?.cancel()
  }

  // 폴백: storage.objects에서 metadata.size 합산
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

// ----------------------------------------------------------------
// Resend API를 이용한 이메일 발송
// 환경 변수: RESEND_API_KEY, ADMIN_EMAIL
// ----------------------------------------------------------------
async function sendAlertEmail(
  dbSizeBytes: number,
  storageSizeBytes: number,
  dbThresholdPct: number,
  storageThresholdPct: number
): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not set — skipping email alert.')
    return false
  }

  const adminEmail = Deno.env.get('ADMIN_EMAIL')
  if (!adminEmail) {
    console.error('ADMIN_EMAIL is not set — skipping email alert.')
    return false
  }

  const dbMb      = (dbSizeBytes / 1024 / 1024).toFixed(1)
  const storageMb = (storageSizeBytes / 1024 / 1024).toFixed(1)
  const today     = new Date().toISOString().slice(0, 10)

  const htmlBody = `
<h2>EduLex 리소스 임계치 경고</h2>
<p>측정일: <strong>${today}</strong></p>
<table border="1" cellpadding="8" style="border-collapse:collapse;">
  <thead>
    <tr>
      <th>항목</th><th>현재 사용량</th><th>한도</th><th>사용률</th><th>상태</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>DB 크기</td>
      <td>${dbMb} MB</td>
      <td>500 MB</td>
      <td>${dbThresholdPct}%</td>
      <td>${dbThresholdPct >= 90 ? '⚠️ 경고' : '정상'}</td>
    </tr>
    <tr>
      <td>Storage 크기</td>
      <td>${storageMb} MB</td>
      <td>1,024 MB</td>
      <td>${storageThresholdPct}%</td>
      <td>${storageThresholdPct >= 90 ? '⚠️ 경고' : '정상'}</td>
    </tr>
  </tbody>
</table>
<p>임계치(90%)를 초과한 항목이 있습니다. Supabase 플랜 업그레이드를 검토하세요.</p>
`

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from:    'EduLex Monitor <noreply@yourdomain.com>',
      to:      [adminEmail],
      subject: `[EduLex] 리소스 임계치 경고 — ${today}`,
      html:    htmlBody,
    }),
  })

  if (!emailRes.ok) {
    const errText = await emailRes.text()
    console.error(`Resend API 실패: ${errText}`)
    return false
  }

  await emailRes.body?.cancel()
  return true
}
