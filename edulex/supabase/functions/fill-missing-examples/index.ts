import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey, x-cron-secret',
}

// 호출 경로 2가지:
//   1. x-cron-secret 헤더 (pg_cron 자동 호출)
//   2. 관리자 Bearer 토큰 (FE 수동 호출)
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const groqApiKey = Deno.env.get('GROQ_API_KEY')!
    const cronSecret = Deno.env.get('CRON_SECRET')!

    const cronHeader = req.headers.get('x-cron-secret')
    const isCronCall = cronHeader === cronSecret

    if (!isCronCall) {
      // 관리자 토큰 경로
      const token = req.headers.get('authorization')?.replace('Bearer ', '')
      if (!token) {
        return new Response(JSON.stringify({ message: '인증 토큰이 없습니다.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
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
      const { id: userId } = await userRes.json()

      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (profile?.role !== 'admin') {
        return new Response(JSON.stringify({ message: '관리자 권한이 필요합니다.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: words, error: fetchErr } = await supabase
      .from('official_words')
      .select('id, english, major_meaning')
      .is('general_example', null)
      .limit(30)

    if (fetchErr) throw fetchErr
    if (!words || words.length === 0) {
      return new Response(JSON.stringify({ message: '보완할 단어가 없습니다.', updated: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let updated = 0
    const errors: string[] = []

    for (const word of words) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            max_tokens: 200,
            temperature: 0.3,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: '당신은 영어 단어 예문 전문가입니다. JSON 형식으로만 응답합니다.',
              },
              {
                role: 'user',
                content: `Write a one-sentence English example for the word "${word.english}".
Domain meaning (Korean): "${word.major_meaning}"

Rules:
- general_example MUST be written in English only. Never use Korean.
- general_meaning must be written in Korean only.

Respond only in this JSON format:
{"general_example": "one sentence in English", "general_meaning": "한국어 뜻"}`,
              },
            ],
          }),
        })

        if (!groqRes.ok) {
          errors.push(`${word.english}: Groq API 오류`)
          continue
        }

        const groqData = await groqRes.json()
        const parsed = JSON.parse(groqData.choices?.[0]?.message?.content ?? '{}')

        if (!parsed.general_example) {
          errors.push(`${word.english}: 응답 파싱 실패`)
          continue
        }

        const updateData: Record<string, string> = { general_example: parsed.general_example }
        if (parsed.general_meaning) {
          const { data: current } = await supabase
            .from('official_words')
            .select('general_meaning')
            .eq('id', word.id)
            .single()
          if (!current?.general_meaning) updateData.general_meaning = parsed.general_meaning
        }

        const { error: updateErr } = await supabase
          .from('official_words')
          .update(updateData)
          .eq('id', word.id)

        if (updateErr) {
          errors.push(`${word.english}: DB 업데이트 오류`)
        } else {
          updated++
        }
      } catch {
        errors.push(`${word.english}: 처리 중 오류`)
      }
    }

    return new Response(
      JSON.stringify({
        message: `${updated}개 단어 예문 보완 완료`,
        updated,
        total: words.length,
        errors: errors.length > 0 ? errors : undefined,
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
