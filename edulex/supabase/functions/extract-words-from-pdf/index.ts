import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','shall','should','may','might',
  'must','can','could','not','no','nor','so','yet','both','either',
  'neither','each','few','more','most','other','some','such','than',
  'that','this','these','those','what','which','who','whom','whose',
  'when','where','why','how','all','any','because','as','until',
  'while','about','against','between','into','through','during',
  'before','after','above','below','up','down','out','off','over',
  'under','again','further','then','once','here','there','its',
  'it','he','she','they','we','you','i','me','him','her','us','them',
  'my','your','his','our','their','its','if','only','also','very',
  'just','even','back','new','used','go','well','way','however',
  'thus','hence','therefore','since','although','though','whether',
  'among','within','without','along','across','around','upon','per',
])

function isContentWord(word: string): boolean {
  return /^[a-zA-Z]{3,20}$/.test(word) && !STOP_WORDS.has(word.toLowerCase())
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(isContentWord)
}

function extractTopWordsByTfIdf(text: string, topN: number): string[] {
  const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 10)
  if (sentences.length === 0) return []

  const docCount = sentences.length
  const dfMap = new Map<string, number>()
  const tfMap = new Map<string, number>()

  for (const sentence of sentences) {
    const words = tokenize(sentence)
    const seen = new Set<string>()
    for (const word of words) {
      tfMap.set(word, (tfMap.get(word) ?? 0) + 1)
      if (!seen.has(word)) {
        dfMap.set(word, (dfMap.get(word) ?? 0) + 1)
        seen.add(word)
      }
    }
  }

  const scores: { word: string; score: number }[] = []
  for (const [word, tf] of tfMap) {
    const df = dfMap.get(word) ?? 1
    const idf = Math.log((docCount + 1) / (df + 1)) + 1
    scores.push({ word, score: tf * idf })
  }

  scores.sort((a, b) => b.score - a.score)
  return scores.slice(0, topN).map(s => s.word)
}

// 무료 사전 API로 영어 일반 뜻 조회
async function fetchDictionaryMeanings(words: string[]): Promise<Map<string, string>> {
  const results = await Promise.allSettled(
    words.map(async (word) => {
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
        if (!res.ok) return { word, meaning: null }
        const data = await res.json()
        const meaning: string | null = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition ?? null
        return { word, meaning }
      } catch {
        return { word, meaning: null }
      }
    })
  )

  const map = new Map<string, string>()
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.meaning) {
      map.set(result.value.word.toLowerCase(), result.value.meaning)
    }
  }
  return map
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
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
    await userRes.body?.cancel()

    const { text } = await req.json()
    if (!text || text.trim().length < 50) {
      return new Response(
        JSON.stringify({ message: 'PDF에서 텍스트를 추출할 수 없습니다. 스캔된 이미지 PDF는 지원되지 않습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TF-IDF + 불용어 필터 → 상위 50단어 (로컬, API 없음)
    const topWords = extractTopWordsByTfIdf(text, 50)

    if (topWords.length < 5) {
      return new Response(
        JSON.stringify({ message: 'PDF에서 충분한 영어 단어를 찾을 수 없습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) throw new Error('GROQ_API_KEY 환경변수가 설정되지 않았습니다.')

    const wordListText = topWords.join(', ')

    // Dictionary API + Groq 병렬 호출
    const [dictMap, groqRes] = await Promise.all([
      fetchDictionaryMeanings(topWords),
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 1200,
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: '당신은 전공 단어장을 만드는 전문가입니다. JSON 형식으로만 응답합니다. 다른 텍스트는 절대 출력하지 않습니다.',
            },
            {
              role: 'user',
              content: `다음은 전공 PDF에서 TF-IDF로 추출한 핵심 영어 단어 목록이다:
${wordListText}

이 단어들 중 전공 맥락에서 중요한 단어를 최대 30개 골라 아래 JSON 형식으로만 응답하라.
일반적인 단어보다 전공 용어에 가까운 단어를 우선 선택하라.
major_meaning만 작성한다. 다른 텍스트 없이 JSON만 출력.

{
  "words": [
    {
      "english": "영어 단어",
      "major_meaning": "전공 맥락에서의 한국어 뜻"
    }
  ]
}`,
            },
          ],
        }),
      }),
    ])

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      throw new Error(`Groq API 호출 실패: ${errText}`)
    }

    const groqData = await groqRes.json()
    const rawText = groqData.choices?.[0]?.message?.content
    if (!rawText) throw new Error('Groq 응답에서 텍스트를 찾을 수 없습니다.')

    const parsed = JSON.parse(rawText)
    if (!Array.isArray(parsed.words) || parsed.words.length === 0) {
      throw new Error('Groq 응답 형식이 올바르지 않습니다.')
    }

    // Groq 결과 + Dictionary API 결과 병합
    const mergedWords = parsed.words.map((w: any) => ({
      english: w.english,
      general_meaning: dictMap.get(w.english.toLowerCase()) ?? null,
      major_meaning: w.major_meaning,
    }))

    return new Response(
      JSON.stringify({ words: mergedWords }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
