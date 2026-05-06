import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

interface WordRow {
  english: string
  general_meaning: string
  major_meaning: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // JWT 인증
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

    // 단어장 개수 검증 (최대 2개)
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

    // JSON으로 단어 목록과 제목 수신
    const { title, words: parsedWords } = await req.json() as { title: string; words: WordRow[] }

    if (!title?.trim()) {
      return new Response(JSON.stringify({ message: '단어장 제목을 입력해주세요.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!Array.isArray(parsedWords) || parsedWords.length === 0) {
      return new Response(JSON.stringify({ message: '단어 목록이 없습니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 중복 단어 제거: 사용자의 모든 단어장 기준
    const { data: userWbs } = await supabase
      .from('user_wordbooks')
      .select('id')
      .eq('user_id', user.id)

    const wbIds = (userWbs ?? []).map((w: any) => w.id)
    let existingSet = new Set<string>()

    if (wbIds.length > 0) {
      const { data: existingWords } = await supabase
        .from('user_words')
        .select('english')
        .in('wordbook_id', wbIds)

      existingSet = new Set(
        (existingWords ?? []).map((w: any) => w.english.toLowerCase())
      )
    }

    const newWords = parsedWords.filter(
      w => !existingSet.has(w.english.toLowerCase())
    )
    const skippedCount = parsedWords.length - newWords.length

    if (newWords.length === 0) {
      return new Response(
        JSON.stringify({ message: '모든 단어가 이미 단어장에 존재합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Groq API → 예문만 생성
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) throw new Error('GROQ_API_KEY 환경변수가 설정되지 않았습니다.')

    const wordListForGroq = newWords
      .map(w => `${w.english} | ${w.general_meaning} | ${w.major_meaning}`)
      .join('\n')

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 4096,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: '당신은 전공 단어장을 만드는 전문가입니다. JSON 형식으로만 응답합니다. 다른 텍스트는 절대 출력하지 않습니다.',
          },
          {
            role: 'user',
            content: `다음 단어 목록에 대해 예문을 생성하라. 형식: 영어단어 | 일반뜻 | 전공뜻
${wordListForGroq}

각 단어에 대해 아래 JSON 형식으로만 응답하라. 다른 텍스트 없이 JSON만 출력.

{
  "words": [
    {
      "english": "영어 단어 (위 목록과 동일하게)",
      "general_example": "일반적인 의미로 만든 영어 예문 (반드시 작성)",
      "major_example": "전공 맥락의 영어 예문 (반드시 작성)"
    }
  ]
}`,
          },
        ],
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      throw new Error(`Groq API 호출 실패: ${errText}`)
    }

    const groqData = await groqRes.json()
    const rawText = groqData.choices?.[0]?.message?.content
    if (!rawText) throw new Error('Groq 응답에서 텍스트를 찾을 수 없습니다.')

    const groqResult = JSON.parse(rawText)
    if (!Array.isArray(groqResult.words)) {
      throw new Error('Groq 응답 형식이 올바르지 않습니다.')
    }

    const exampleMap = new Map<string, { general_example: string; major_example: string }>(
      groqResult.words.map((w: any) => [w.english.toLowerCase(), w])
    )

    // 단어장 생성
    const { data: wordbook, error: wbError } = await supabase
      .from('user_wordbooks')
      .insert({ user_id: user.id, title: title.trim() })
      .select()
      .single()

    if (wbError) throw new Error(wbError.message)

    const wordsToInsert = newWords.map(w => ({
      wordbook_id: wordbook.id,
      english: w.english,
      general_meaning: w.general_meaning,
      major_meaning: w.major_meaning,
      general_example: exampleMap.get(w.english.toLowerCase())?.general_example ?? '',
      major_example: exampleMap.get(w.english.toLowerCase())?.major_example ?? '',
    }))

    const { error: wordsError } = await supabase.from('user_words').insert(wordsToInsert)
    if (wordsError) throw new Error(wordsError.message)

    return new Response(
      JSON.stringify({
        success: true,
        wordbook_id: wordbook.id,
        word_count: wordsToInsert.length,
        skipped_count: skippedCount,
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
