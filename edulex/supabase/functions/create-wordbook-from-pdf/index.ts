import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as pdfjsLib from 'npm:pdfjs-dist@4.4.168/legacy/build/pdf.mjs'

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

// 텍스트에서 단어 토큰화
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(isContentWord)
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

// PDF 바이너리에서 텍스트 추출 (순수 JS 파서)
// PDF 스트림에서 BT...ET 텍스트 블록 및 Tj/TJ 연산자로 텍스트 파싱
function extractTextFromPdf(buffer: Uint8Array): string {
  const decoder = new TextDecoder('latin1')
  const raw = decoder.decode(buffer)

  const chunks: string[] = []

  // BT ... ET 블록 내에서 텍스트 추출
  const btEtRegex = /BT([\s\S]*?)ET/g
  let match: RegExpExecArray | null
  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1]

    // (text) Tj 또는 [(text)] TJ 패턴 추출
    const tjRegex = /\(([^)]*)\)\s*Tj/g
    const tjArrRegex = /\[([^\]]*)\]\s*TJ/g

    let tj: RegExpExecArray | null
    while ((tj = tjRegex.exec(block)) !== null) {
      chunks.push(tj[1])
    }
    while ((tj = tjArrRegex.exec(block)) !== null) {
      // 배열 내 문자열 항목들 추출
      const inner = tj[1]
      const strRegex = /\(([^)]*)\)/g
      let s: RegExpExecArray | null
      while ((s = strRegex.exec(inner)) !== null) {
        chunks.push(s[1])
      }
    }
  }

  // PDF 이스케이프 처리 (\n, \r, \t, \\, \(, \))
  return chunks
    .map(c =>
      c
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\\\/g, '\\')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
    )
    .join(' ')
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

    // 단어장 개수 검증
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

    // 1단계: PDF → 텍스트 추출 (로컬)
    const pdfBuffer = await pdfFile.arrayBuffer()
    const pdfBytes = new Uint8Array(pdfBuffer)
    const extractedText = extractTextFromPdf(pdfBytes)

    if (extractedText.trim().length < 50) {
      return new Response(
        JSON.stringify({ message: 'PDF에서 텍스트를 추출할 수 없습니다. 스캔된 이미지 PDF는 지원되지 않습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2단계: TF-IDF + 품사태깅으로 핵심 단어 50개 선별 (로컬, API 없음)
    const topWords = extractTopWordsByTfIdf(extractedText, 50)

    if (topWords.length < 5) {
      return new Response(
        JSON.stringify({ message: 'PDF에서 충분한 영어 단어를 찾을 수 없습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3단계: Groq API → 단어장 생성 (선별된 단어 목록만 전달)
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) throw new Error('GROQ_API_KEY 환경변수가 설정되지 않았습니다.')

    const wordListText = topWords.join(', ')

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4096,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: '당신은 전공 단어장을 만드는 전문가입니다. 요청받은 단어 목록을 분석하여 JSON 형식으로만 응답합니다. 다른 텍스트는 절대 출력하지 않습니다.',
          },
          {
            role: 'user',
            content: `다음은 전공 PDF에서 TF-IDF로 추출한 핵심 영어 단어 목록이다:
${wordListText}

이 단어들 중 전공 맥락에서 중요한 단어를 최대 30개 골라 아래 JSON 형식으로만 응답하라.
일반적인 단어보다 전공 용어에 가까운 단어를 우선 선택하라.
다른 텍스트 없이 JSON만 출력.

{
  "title": "단어장 제목 (한국어, 20자 이내, 전공 내용 반영)",
  "words": [
    {
      "english": "영어 단어",
      "general_meaning": "일반적인 한국어 뜻 (반드시 작성)",
      "major_meaning": "전공 맥락에서의 한국어 뜻",
      "general_example": "일반적인 의미로 만든 영어 예문 (반드시 작성)",
      "major_example": "전공 영어 예문"
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
    if (!parsed.title || !Array.isArray(parsed.words) || parsed.words.length === 0) {
      throw new Error('Groq 응답 형식이 올바르지 않습니다.')
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
      general_meaning: w.general_meaning,
      major_meaning: w.major_meaning,
      general_example: w.general_example,
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
