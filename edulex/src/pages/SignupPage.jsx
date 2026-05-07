import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', nickname: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { email, password, nickname } = form

    // 닉네임 중복 검사
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('nickname', nickname)
      .maybeSingle()

    if (existing) {
      setError('이미 사용 중인 닉네임입니다.')
      setLoading(false)
      return
    }

    // Supabase Auth 이메일 인증 회원가입
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    // users 테이블에 기본 정보 저장 (major는 null 허용 — H01에서 선택)
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        nickname,
        major: null,
        active_title: null,
        bookmark: 0,
        level: 1,
      })
    }

    setEmailSent(true)
    setLoading(false)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
        <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">이메일을 확인해주세요</h2>
          <p className="text-gray-500 text-sm mb-6">
            <span className="font-semibold text-[#7c3aed]">{form.email}</span> 로<br />
            인증 메일을 발송했습니다. 메일함을 확인하고 링크를 클릭해주세요.
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

        <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">회원가입</h2>

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
              placeholder="8자 이상"
              minLength={8}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              required
              placeholder="2~12자"
              minLength={2}
              maxLength={12}
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
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-[#7c3aed] font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
