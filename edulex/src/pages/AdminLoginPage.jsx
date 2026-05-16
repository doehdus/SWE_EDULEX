import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function AdminLoginPage() {
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
      setError('로그인 정보가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    // 관리자 권한 검증 미들웨어 역할
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (userData?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('관리자 권한이 없습니다.')
      setLoading(false)
      return
    }

    navigate('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#1a1a2e]">EduLex</h1>
          <span className="inline-block bg-[#7c3aed] text-white text-xs font-semibold px-3 py-1 rounded-full mt-2">
            관리자 전용
          </span>
        </div>

        <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">관리자 로그인</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">관리자 이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
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
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a2e] text-white font-semibold rounded-lg py-3 text-sm hover:bg-[#2d2d4e] transition disabled:opacity-50"
          >
            {loading ? '확인 중...' : '관리자 로그인'}
          </button>
        </form>

        {/* 테스트 계정 안내 */}
        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className="text-xs text-gray-400 text-center mb-3">테스트용 관리자 계정</p>
          <button
            type="button"
            onClick={() => setForm({ email: 'admin@edulex.com', password: 'edulex1234' })}
            className="w-full border border-violet-200 bg-violet-50 rounded-lg py-3 text-sm text-violet-600 hover:bg-violet-100 transition"
          >
            <span className="font-semibold">admin@edulex.com</span>
            <span className="text-violet-400 mx-2">/</span>
            <span>edulex1234</span>
          </button>
          <p className="text-center text-xs text-gray-300 mt-2">클릭하면 자동 입력됩니다</p>
        </div>
      </div>
    </div>
  )
}
