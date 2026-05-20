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
import CommunityPage from './pages/CommunityPage'
import RankingPage from './pages/RankingPage'
import SuggestionsPage from './pages/SuggestionsPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ShopPage from './pages/ShopPage'
import TitleTestPage from './pages/TitleTestPage'

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
            {/* 이메일 인증 콜백 — 가드 없음 */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

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
            <Route path="/community" element={
              <ProtectedRoute>
                <UserLayout><CommunityPage /></UserLayout>
              </ProtectedRoute>
            } />
            <Route path="/ranking" element={
              <ProtectedRoute>
                <UserLayout><RankingPage /></UserLayout>
              </ProtectedRoute>
            } />
            <Route path="/suggestions" element={
              <ProtectedRoute>
                <UserLayout><SuggestionsPage /></UserLayout>
              </ProtectedRoute>
            } />
            <Route path="/shop" element={
              <ProtectedRoute>
                <UserLayout><ShopPage /></UserLayout>
              </ProtectedRoute>
            } />
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
