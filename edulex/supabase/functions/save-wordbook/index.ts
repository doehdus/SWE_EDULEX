import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

interface WordEntry {
  english: string
  general_meaning: string
  major_meaning: string
  general_example: string
  major_example: string
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

    const rawBody = await req.text()
    let parsedBody: { title: string; words: WordEntry[] }
    try {
      parsedBody = JSON.parse(rawBody)
    } catch {
      return new Response(
        JSON.stringify({ message: 'Request body가 유효한 JSON이 아닙니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const { title, words } = parsedBody

    if (!title?.trim()) {
      return new Response(JSON.stringify({ message: '단어장 제목을 입력해주세요.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!Array.isArray(words) || words.length === 0) {
      return new Response(JSON.stringify({ message: '저장할 단어가 없습니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 중복 단어 제거 (사용자의 모든 단어장 기준)
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
      existingSet = new Set((existingWords ?? []).map((w: any) => w.english.toLowerCase()))
    }

    // 입력 배열 자체 내 중복 제거 (대소문자 무시)
    const seenInInput = new Set<string>()
    const deduped = words.filter(w => {
      const key = w.english.toLowerCase()
      if (seenInInput.has(key)) return false
      seenInInput.add(key)
      return true
    })

    const newWords = deduped.filter(w => !existingSet.has(w.english.toLowerCase()))
    const skippedCount = words.length - newWords.length  // 원본 기준(중복 포함) 스킵 수

    if (newWords.length === 0) {
      return new Response(
        JSON.stringify({ message: '모든 단어가 이미 단어장에 존재합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
      general_example: w.general_example ?? '',
      major_example: w.major_example ?? '',
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
