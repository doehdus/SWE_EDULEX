import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('pending') // 'pending' | 'success' | 'error'

  useEffect(() => {
    // Supabase 클라이언트가 URL 해시의 토큰을 자동으로 파싱하여 세션을 생성한다.
    // onAuthStateChange로 해당 이벤트를 감지해 성공/실패를 처리한다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success')
        const timer = setTimeout(() => navigate('/'), 3000)
        return () => clearTimeout(timer)
      }
      if (event === 'TOKEN_REFRESHED') {
        setStatus('success')
        const timer = setTimeout(() => navigate('/'), 3000)
        return () => clearTimeout(timer)
      }
    })

    // 이미 세션이 있는 경우 (새로고침 등)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('success')
        const timer = setTimeout(() => navigate('/'), 3000)
        return () => clearTimeout(timer)
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md text-center">
        {status === 'pending' && (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">인증 처리 중...</h2>
            <p className="text-gray-400 text-sm">잠시만 기다려주세요.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">이메일 인증 완료!</h2>
            <p className="text-gray-500 text-sm mb-2">
              인증이 성공적으로 완료되었습니다.
            </p>
            <p className="text-gray-400 text-xs">3초 후 메인 페이지로 이동합니다...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">인증 실패</h2>
            <p className="text-gray-500 text-sm mb-4">
              인증 링크가 만료되었거나 유효하지 않습니다.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="text-[#7c3aed] font-semibold hover:underline text-sm"
            >
              로그인 페이지로 이동 →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
