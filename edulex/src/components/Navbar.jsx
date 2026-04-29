import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'
import icon1 from '../assets/icon1.png'
import icon2 from '../assets/icon2.png'
import icon3 from '../assets/icon3.png'
import icon4 from '../assets/icon4.png'
import icon5 from '../assets/icon5.png'
import icon6 from '../assets/icon6.png'
import icon7 from '../assets/icon7.png'
import icon8 from '../assets/icon8.png'
import icon9 from '../assets/icon9.png'
import icon10 from '../assets/icon10.png'
import icon11 from '../assets/icon11.png'
import icon12 from '../assets/icon12.png'

const ICONS = [icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8, icon9, icon10, icon11, icon12]

const MENU_ITEMS = [
  { path: '/wordbook/official', label: '공식 단어장', icon: '📚' },
  { path: '/wordbook/my', label: '나만의 단어장', icon: '📝' },
  { path: '/quiz', label: '테스트', icon: '🎮' },
  { path: '/dashboard', label: '학습 현황', icon: '📊' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState(icon1)
  const profileRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        {/* 로고 */}
        <Link to="/"><img src={logo} alt="EduLex" className="h-16 w-auto" /></Link>

        {/* 우측: 아이콘 + 햄버거 */}
        <div className="flex items-center gap-4">

          {/* 프로필 아이콘 */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1a3a5c] hover:border-[#0d9488] transition"
              title="아이콘 변경"
            >
              <img src={selectedIcon} alt="내 아이콘" className="w-full h-full object-cover" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 w-72 overflow-hidden">
                {/* 아이콘 선택 */}
                <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 mb-3">아이콘 선택</p>
                  <div className="grid grid-cols-4 gap-2">
                    {ICONS.map((ic, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedIcon(ic); setProfileOpen(false) }}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition hover:scale-110 ${
                          selectedIcon === ic ? 'border-[#0d9488]' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img src={ic} alt={`icon${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                {/* 로그아웃 */}
                <button
                  onClick={async () => { setProfileOpen(false); await signOut(); navigate('/login') }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition flex items-center gap-2"
                >
                  <span>🚪</span> 로그아웃
                </button>
              </div>
            )}
          </div>

          {/* 햄버거 메뉴 */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition"
            title="메뉴"
          >
            <span className="block w-5 h-0.5 bg-[#1a3a5c]" />
            <span className="block w-5 h-0.5 bg-[#1a3a5c]" />
            <span className="block w-5 h-0.5 bg-[#1a3a5c]" />
          </button>
        </div>
      </nav>

      {/* 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <span className="text-lg font-extrabold text-[#1a3a5c]">메뉴</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-4 flex-1">
          {MENU_ITEMS.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition
                ${pathname === path
                  ? 'bg-[#1a3a5c] text-white'
                  : 'text-gray-600 hover:bg-[#f0fdfa] hover:text-[#0d9488]'
                }`}
            >
              <span className="text-xl">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-gray-100">
          <button
            onClick={async () => { await signOut(); navigate('/login'); setSidebarOpen(false) }}
            className="w-full text-sm text-red-400 hover:text-red-600 transition text-left flex items-center gap-2"
          >
            <span>🚪</span> 로그아웃
          </button>
        </div>
      </aside>
    </>
  )
}
