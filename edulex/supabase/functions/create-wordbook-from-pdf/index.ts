import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // JWT에서 사용자 확인 (Auth REST API 직접 호출 — ES256 JWT 알고리즘 지원)
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

    // 단어장 개수 검증 (API 레벨 방어)
    const { count } = await supabase
      .from('user_wordbooks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= 2) {
      return new Response(
        JSON.stringify({ message: '단어장은 최대 2개까지만 생성할 수 있습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PDF 파일 수신
    const formData = await req.formData()
    const pdfFile = formData.get('pdf') as File
    if (!pdfFile) {
      return new Response(JSON.stringify({ message: 'PDF 파일이 없습니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // PDF를 base64로 변환 (Gemini multimodal inline_data)
    // spread 연산자는 큰 파일에서 스택 오버플로 → 청크 단위 변환
    const pdfBuffer = await pdfFile.arrayBuffer()
    const bytes = new Uint8Array(pdfBuffer)
    let binary = ''
    const chunkSize = 0x8000 // 32KB
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
    }
    const pdfBase64 = btoa(binary)

    // Gemini 1.5 Flash — PDF를 직접 전달하여 단어 추출
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.')

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: 'application/pdf',
                    data: pdfBase64,
                  },
                },
                {
                  text: `이 PDF에서 전공 핵심 영어 단어를 최대 30개 추출하라.
일반 단어(the, and, is 등 기능어)와 영어가 아닌 항목은 제외.
아래 JSON 형식으로만 응답하라. 다른 텍스트 없이 JSON만 출력.

{
  "title": "단어장 제목 (PDF 내용 기반, 한국어, 20자 이내)",
  "words": [
    {
      "english": "영어 단어",
      "general_meaning": "일반적인 한국어 뜻 (없으면 null)",
      "major_meaning": "전공 맥락에서의 한국어 뜻",
      "general_example": "일반 영어 예문 (없으면 null)",
      "major_example": "전공 영어 예문"
    }
  ]
}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      throw new Error(`Gemini API 호출 실패: ${errText}`)
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) throw new Error('Gemini 응답에서 텍스트를 찾을 수 없습니다.')

    const parsed = JSON.parse(rawText)
    if (!parsed.title || !Array.isArray(parsed.words) || parsed.words.length === 0) {
      throw new Error('Gemini 응답 형식이 올바르지 않습니다.')
    }

    // 단어장 저장
    const { data: wordbook, error: wbError } = await supabase
      .from('user_wordbooks')
      .insert({ user_id: user.id, title: parsed.title })
      .select()
      .single()

    if (wbError) throw new Error(wbError.message)

    const wordsToInsert = parsed.words.map((w: any) => ({
      wordbook_id: wordbook.id,
      english: w.english,
      general_meaning: w.general_meaning ?? null,
      major_meaning: w.major_meaning,
      general_example: w.general_example ?? null,
      major_example: w.major_example,
    }))

    const { error: wordsError } = await supabase.from('user_words').insert(wordsToInsert)
    if (wordsError) throw new Error(wordsError.message)

    return new Response(
      JSON.stringify({ success: true, wordbook_id: wordbook.id, word_count: wordsToInsert.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
