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
    if (!user?.id || !user?.email) {
      return new Response(JSON.stringify({ message: '인증 실패' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Body 파싱
    const rawBody = await req.text()
    let parsedBody: { currentPassword: string; newPassword: string }
    try {
      parsedBody = JSON.parse(rawBody)
    } catch {
      return new Response(
        JSON.stringify({ message: 'Request body가 유효한 JSON이 아닙니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const { currentPassword, newPassword } = parsedBody

    if (!currentPassword) {
      return new Response(JSON.stringify({ message: '현재 비밀번호를 입력해주세요.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!newPassword || newPassword.length < 8) {
      return new Response(
        JSON.stringify({ message: '새 비밀번호는 8자 이상이어야 합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 현재 비밀번호 검증 (anon client로 signInWithPassword)
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { auth: { persistSession: false } }
    )

    const { error: signInError } = await anonClient.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (signInError) {
      return new Response(
        JSON.stringify({ message: '현재 비밀번호가 올바르지 않습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 새 비밀번호 업데이트 (admin client)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })
    if (updateError) {
      throw new Error(updateError.message)
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
