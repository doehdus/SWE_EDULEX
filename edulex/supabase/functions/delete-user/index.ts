import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
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

    // admin client — 관리자 role 확인 및 유저 삭제에 사용
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // 호출자가 관리자인지 확인
    const { data: callerData, error: callerError } = await adminClient
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

    // Body 파싱
    const rawBody = await req.text()
    let parsedBody: { userId: string }
    try {
      parsedBody = JSON.parse(rawBody)
    } catch {
      return new Response(
        JSON.stringify({ message: 'Request body가 유효한 JSON이 아닙니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { userId } = parsedBody
    if (!userId) {
      return new Response(JSON.stringify({ message: '삭제할 userId를 입력해주세요.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 관리자가 자기 자신을 삭제하는 것 방지
    if (userId === user.id) {
      return new Response(JSON.stringify({ message: '자기 자신은 삭제할 수 없습니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // auth.users에서 유저 삭제 (cascade로 public.users도 함께 삭제됨)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteError) {
      throw new Error(deleteError.message)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
