import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MajorProvider } from './context/MajorContext'
import { RewardProvider } from './context/RewardContext'
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
import ShopPage from './pages/ShopPage'
import TitleTestPage from './pages/TitleTestPage' // TODO(임시): Phase 3 검증 후 라우트와 함께 제거

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
         <RewardProvider>
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
            <Route path="/shop" element={
              <ProtectedRoute>
                <UserLayout><ShopPage /></UserLayout>
              </ProtectedRoute>
            } />

            {/* TODO(임시): 칭호 시스템 Phase 3 검증용 — 검증 완료 후 본 라우트 제거 */}
            <Route path="/title-test" element={
              <ProtectedRoute>
                <UserLayout><TitleTestPage /></UserLayout>
              </ProtectedRoute>
            } />

            {/* 관리자 보호 라우트 */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminWordbookPage />
              </AdminRoute>
            } />
          </Routes>
         </RewardProvider>
        </MajorProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
