import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return new Response(JSON.stringify({ message: '인증 토큰이 없습니다.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const userRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: Deno.env.get('SUPABASE_ANON_KEY')! },
    })
    if (!userRes.ok) { await userRes.body?.cancel(); return new Response(JSON.stringify({ message: '인증 실패' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }) }
    await userRes.body?.cancel()

    const { word, majors } = JSON.parse(await req.text())
    if (!word?.trim()) return new Response(JSON.stringify({ message: '단어를 입력해주세요.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) throw new Error('GROQ_API_KEY 환경변수가 설정되지 않았습니다.')
    const majorContext = majors && majors.length > 0
      ? `사용자의 전공은 [${majors.join(', ')}]이다.`
      : '일반적인 전공 맥락에서 작성하라.'

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqApiKey}` },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', max_tokens: 512, temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: '당신은 전공 단어장을 만드는 전문가입니다. JSON 형식으로만 응답합니다.' },
          { role: 'user', content: `영어 단어 "${word.trim()}"에 대해 아래 JSON 형식으로만 응답하라.\n${majorContext}\n{"general_meaning":"일반 뜻","major_meaning":"전공 뜻","general_example":"일반 예문","major_example":"전공 예문"}` },
        ],
      }),
    })
    if (!groqRes.ok) throw new Error(`Groq API 호출 실패: ${await groqRes.text()}`)
    const groqData = await groqRes.json()
    const parsed = JSON.parse(groqData.choices?.[0]?.message?.content)
    if (!parsed.general_meaning || !parsed.major_meaning) throw new Error('Groq 응답 형식이 올바르지 않습니다.')
    return new Response(JSON.stringify({ english: word.trim(), ...parsed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})