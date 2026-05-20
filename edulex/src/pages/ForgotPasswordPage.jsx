import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      form.email,
      { redirectTo: window.location.origin + '/reset-password' }
    )

    if (resetError) {
      // 이메일 존재 여부를 노출하지 않기 위해 에러가 나도 sent=true
      console.error(resetError)
    }

    // 성공/실패 무관하게 항상 sent 상태로 전환
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
        <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">이메일을 확인해주세요</h2>
          <p className="text-gray-500 text-sm mb-6">
            <span className="font-semibold text-[#7c3aed]">{form.email}</span> 로<br />
            비밀번호 재설정 메일을 발송했습니다. 메일함을 확인하고 링크를 클릭해주세요.
          </p>
          <Link to="/login" className="text-[#7c3aed] font-semibold hover:underline text-sm">
            로그인 페이지로 돌아가기 →
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

        <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">비밀번호 찾기</h2>
        <p className="text-gray-400 text-sm mb-6">
          가입한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>

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

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7c3aed] text-white font-semibold rounded-lg py-3 text-sm hover:bg-[#6d28d9] transition disabled:opacity-50"
          >
            {loading ? '발송 중...' : '재설정 메일 발송'}
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
