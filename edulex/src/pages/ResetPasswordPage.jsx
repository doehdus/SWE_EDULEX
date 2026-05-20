import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', passwordConfirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
      setSessionChecked(true)
    })

    // 이벤트가 발생하지 않는 경우(직접 URL 진입) 타임아웃 후 오류 화면 표시
    const timer = setTimeout(() => setSessionChecked(true), 1500)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password: form.password })

    if (updateError) {
      setError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    setDone(true)
    setLoading(false)

    setTimeout(() => { navigate('/login') }, 2000)
  }

  // 이벤트 수신 대기 중
  if (!sessionChecked && !done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
        <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md text-center">
          <p className="text-gray-400 text-sm">링크를 확인하는 중입니다...</p>
        </div>
      </div>
    )
  }

  // 유효하지 않은 복구 링크 접근 시 오류 화면
  if (!sessionReady && !done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
        <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">유효하지 않은 링크입니다</h2>
          <p className="text-gray-500 text-sm mb-6">
            비밀번호 재설정 링크가 만료되었거나 올바르지 않습니다.<br />
            다시 비밀번호 찾기를 진행해주세요.
          </p>
          <Link to="/forgot-password" className="text-[#7c3aed] font-semibold hover:underline text-sm">
            비밀번호 찾기로 이동 →
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
        <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">비밀번호가 변경되었습니다</h2>
          <p className="text-gray-500 text-sm mb-6">
            잠시 후 로그인 페이지로 이동합니다.
          </p>
          <Link to="/login" className="text-[#7c3aed] font-semibold hover:underline text-sm">
            로그인 페이지로 이동 →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#1a1a2e]">EduLex</h1>
          <p className="text-gray-400 text-sm mt-1">전공 어휘 학습 플랫폼</p>
        </div>

        <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">새 비밀번호 설정</h2>
        <p className="text-gray-400 text-sm mb-6">사용할 새 비밀번호를 입력해주세요.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="8자 이상"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              required
              placeholder="비밀번호를 다시 입력해주세요"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7c3aed] text-white font-semibold rounded-lg py-3 text-sm hover:bg-[#6d28d9] transition disabled:opacity-50"
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link to="/login" className="text-[#7c3aed] font-semibold hover:underline">
            로그인 페이지로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  )
}
