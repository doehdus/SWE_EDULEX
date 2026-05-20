import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MajorProvider } from './context/MajorContext'
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import MainPage from './pages/MainPage'
import OfficialWordbookPage from './pages/OfficialWordbookPage'
import MyWordbookPage from './pages/MyWordbookPage'
import QuizPage from './pages/QuizPage'
import DashboardPage from './pages/DashboardPage'
import AdminWordbookPage from './pages/AdminWordbookPage'

function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      <Navbar />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MajorProvider>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/landing" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
            <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/admin/login" element={<PublicOnlyRoute><AdminLoginPage /></PublicOnlyRoute>} />

            {/* 사용자 보호 라우트 */}
            <Route path="/" element={
              <ProtectedRoute>
                <UserLayout><MainPage /></UserLayout>
              </ProtectedRoute>
            } />
            <Route path="/wordbook/official" element={
              <ProtectedRoute>
                <UserLayout><OfficialWordbookPage /></UserLayout>
              </ProtectedRoute>
            } />
            <Route path="/wordbook/my" element={
              <ProtectedRoute>
                <UserLayout><MyWordbookPage /></UserLayout>
              </ProtectedRoute>
            } />
            <Route path="/quiz" element={
              <ProtectedRoute>
                <UserLayout><QuizPage /></UserLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserLayout><DashboardPage /></UserLayout>
              </ProtectedRoute>
            } />

            {/* 관리자 보호 라우트 */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminWordbookPage />
              </AdminRoute>
            } />
          </Routes>
        </MajorProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
