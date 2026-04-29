import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>
  if (!user) return <Navigate to="/landing" replace />
  return children
}

export function PublicOnlyRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>
  // user는 있지만 profile 아직 로드 중이면 대기
  if (user && profile === null) return <div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>
  if (user) return <Navigate to={profile?.role === 'admin' ? '/admin' : '/'} replace />
  return children
}

export function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>
  if (!user) return <Navigate to="/login" replace />
  // profile 아직 로드 중이면 대기
  if (profile === null) return <div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>
  if (profile.role !== 'admin') return <Navigate to="/" replace />
  return children
}
