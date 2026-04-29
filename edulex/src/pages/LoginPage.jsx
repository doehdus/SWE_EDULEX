import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (loginError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    // 관리자 역할 확인 후 라우팅 분기
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    navigate(userData?.role === 'admin' ? '/admin' : '/')
    setLoading(false)
  }

  const handleOAuthLogin = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#1a1a2e]">EduLex</h1>
          <p className="text-gray-400 text-sm mt-1">전공 어휘 학습 플랫폼</p>
        </div>

        <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">로그인</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="비밀번호 입력"
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
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={() => handleOAuthLogin('google')}
          className="w-full border border-gray-200 rounded-lg py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-4 h-4"
          />
          Google로 로그인
        </button>

        <p className="text-center text-sm text-gray-400 mt-6">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-[#7c3aed] font-semibold hover:underline">
            회원가입
          </Link>
        </p>


        {/* 테스트 계정 */}
        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className="text-xs text-gray-300 text-center mb-3">테스트 계정</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ email: 'user@edulex.com', password: 'edulex1234' })}
              className="flex-1 border border-gray-200 rounded-lg py-2 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
            >
              <span className="font-medium">사용자</span>
              <br />
              <span className="text-gray-300">user@edulex.com</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'admin@edulex.com', password: 'edulex1234' })}
              className="flex-1 border border-gray-200 rounded-lg py-2 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
            >
              <span className="font-medium">관리자</span>
              <br />
              <span className="text-gray-300">admin@edulex.com</span>
              <br />
              <span className="text-gray-300">edulex1234</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
