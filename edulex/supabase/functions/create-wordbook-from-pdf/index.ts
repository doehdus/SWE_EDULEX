import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

// 기능어(불용어) 목록
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

// 단순 품사 필터: 영문자만 포함, 길이 3~20, 숫자/특수문자 제외
function isContentWord(word: string): boolean {
  return /^[a-zA-Z]{3,20}$/.test(word) && !STOP_WORDS.has(word.toLowerCase())
}

// 간단한 suffix 제거로 어간 추출 (Porter stemmer 경량 버전)
function stem(word: string): string {
  const w = word.toLowerCase()
  // 불규칙 복수/동사 처리
  const irregular: Record<string, string> = {
    analyses: 'analysis', bases: 'basis', theses: 'thesis', crises: 'crisis',
    phenomena: 'phenomenon', criteria: 'criterion', data: 'datum',
  }
  if (irregular[w]) return irregular[w]

  // 길이 6 이상일 때만 suffix 제거 (짧은 단어 오변환 방지)
  if (w.length >= 6) {
    if (w.endsWith('ational')) return w.slice(0, -7) + 'ate'
    if (w.endsWith('tional'))  return w.slice(0, -6) + 'tion'
    if (w.endsWith('ization')) return w.slice(0, -7) + 'ize'
    if (w.endsWith('isation')) return w.slice(0, -7) + 'ise'
    if (w.endsWith('fulness')) return w.slice(0, -7) + 'ful'
    if (w.endsWith('ousness')) return w.slice(0, -7) + 'ous'
    if (w.endsWith('iveness')) return w.slice(0, -7) + 'ive'
    if (w.endsWith('nesses')) return w.slice(0, -6)
    if (w.endsWith('ments'))  return w.slice(0, -5)
    if (w.endsWith('ities'))  return w.slice(0, -5) + 'ity'
    if (w.endsWith('ation'))  return w.slice(0, -5) + 'ate'
    if (w.endsWith('alism'))  return w.slice(0, -5) + 'al'
    if (w.endsWith('ness'))   return w.slice(0, -4)
    if (w.endsWith('ment'))   return w.slice(0, -4)
    if (w.endsWith('tion'))   return w.slice(0, -4)
    if (w.endsWith('able'))   return w.slice(0, -4)
    if (w.endsWith('ible'))   return w.slice(0, -4)
    if (w.endsWith('ical'))   return w.slice(0, -4) + 'ic'
    if (w.endsWith('less'))   return w.slice(0, -4)
    if (w.endsWith('ful'))    return w.slice(0, -3)
    if (w.endsWith('ous'))    return w.slice(0, -3)
    if (w.endsWith('ive'))    return w.slice(0, -3)
    if (w.endsWith('ing'))    return w.slice(0, -3)
    if (w.endsWith('ies'))    return w.slice(0, -3) + 'y'
    if (w.endsWith('ily'))    return w.slice(0, -3) + 'y'
    if (w.endsWith('ize'))    return w.slice(0, -3)
    if (w.endsWith('ise'))    return w.slice(0, -3)
    if (w.endsWith('ers'))    return w.slice(0, -2)
    if (w.endsWith('ed'))     return w.slice(0, -2)
    if (w.endsWith('er'))     return w.slice(0, -2)
    if (w.endsWith('ly'))     return w.slice(0, -2)
    if (w.endsWith('al'))     return w.slice(0, -2)
    if (w.endsWith('ic'))     return w
    if (w.endsWith('es') && w.length > 5) return w.slice(0, -2)
    if (w.endsWith('s') && w.length > 4 && !w.endsWith('ss')) return w.slice(0, -1)
  }
  return w
}

// 텍스트에서 단어 토큰화 — 어간으로 정규화해 중복 어형 변화 통합
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(isContentWord)
    .map(stem)
}

// TF-IDF 기반 상위 N개 단어 추출
// 단일 문서이므로 문장을 "문서"로 간주하여 IDF 계산
function extractTopWordsByTfIdf(text: string, topN: number): string[] {
  // 문장 단위로 분할 → 각 문장이 mini-document
  const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 10)
  if (sentences.length === 0) return []

  const docCount = sentences.length
  const dfMap = new Map<string, number>() // 단어 → 등장 문서 수
  const tfMap = new Map<string, number>()  // 단어 → 전체 등장 횟수

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

  // TF-IDF 점수 계산
  const scores: { word: string; score: number }[] = []
  for (const [word, tf] of tfMap) {
    const df = dfMap.get(word) ?? 1
    const idf = Math.log((docCount + 1) / (df + 1)) + 1
    scores.push({ word, score: tf * idf })
  }

  scores.sort((a, b) => b.score - a.score)
  return scores.slice(0, topN).map(s => s.word)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
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

    // 프론트에서 추출한 텍스트 + 전공 정보 수신
    const contentType = req.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ message: `잘못된 Content-Type: ${contentType}. application/json이어야 합니다.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const rawBody = await req.text()
    let parsedBody: { text: string; majors?: string[] }
    try {
      parsedBody = JSON.parse(rawBody)
    } catch {
      return new Response(
        JSON.stringify({ message: 'Request body가 유효한 JSON이 아닙니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const { text: extractedText, majors = [] } = parsedBody

    if (extractedText.trim().length < 50) {
      return new Response(
        JSON.stringify({ message: 'PDF에서 텍스트를 추출할 수 없습니다. 스캔된 이미지 PDF는 지원되지 않습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2단계: TF-IDF로 핵심 단어 50개 선별
    const topWords = extractTopWordsByTfIdf(extractedText, 50)

    if (topWords.length < 5) {
      return new Response(
        JSON.stringify({ message: 'PDF에서 충분한 영어 단어를 찾을 수 없습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3단계: Groq → 전공 맥락으로 단어 선별 + 뜻/예문 생성
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) throw new Error('GROQ_API_KEY 환경변수가 설정되지 않았습니다.')

    const majorContext = majors.length > 0
      ? `사용자의 전공은 [${majors.join(', ')}]이다. 해당 전공 맥락에서 중요한 단어를 우선 선택하라.`
      : '전공 용어에 가까운 단어를 우선 선택하라.'

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
            content: `다음은 PDF에서 TF-IDF로 추출한 영어 단어 목록이다:
${topWords.join(', ')}

${majorContext}
이 단어들 중 최대 30개를 골라 아래 JSON 형식으로만 응답하라.

{
  "words": [
    {
      "english": "영어 단어",
      "general_meaning": "일반적인 한국어 뜻 (반드시 작성)",
      "major_meaning": "전공 맥락에서의 한국어 뜻 (반드시 작성)",
      "general_example": "일반적인 의미의 영어 예문 (반드시 영어로 작성)",
      "major_example": "전공 맥락의 영어 예문 (반드시 영어로 작성)"
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

    const parsed = JSON.parse(rawText)
    if (!Array.isArray(parsed.words) || parsed.words.length === 0) {
      throw new Error('Groq 응답 형식이 올바르지 않습니다.')
    }

    // DB 저장 없이 단어 목록만 반환 → 프론트에서 검토 후 save-wordbook으로 저장
    return new Response(
      JSON.stringify({ words: parsed.words }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
