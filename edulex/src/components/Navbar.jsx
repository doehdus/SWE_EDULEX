import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Library, NotebookText, FlaskConical, BarChart2, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { LIB } from '../constants/theme'
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
  { path: '/wordbook/official', label: '공식 단어장', icon: <Library size={18} strokeWidth={1.8} /> },
  { path: '/wordbook/my',       label: '나만의 단어장', icon: <NotebookText size={18} strokeWidth={1.8} /> },
  { path: '/quiz',              label: '테스트',       icon: <FlaskConical size={18} strokeWidth={1.8} /> },
  { path: '/dashboard',        label: '학습 현황',    icon: <BarChart2 size={18} strokeWidth={1.8} /> },
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
      <nav className="px-6 py-3 flex items-center justify-between sticky top-0 z-40" style={{ background: LIB.cream, borderBottom: `1px solid ${LIB.shelfLine}` }}>
        {/* 로고 */}
        <Link to="/"><img src={logo} alt="EduLex" className="h-16 w-auto" /></Link>

        {/* 우측: 아이콘 + 햄버거 */}
        <div className="flex items-center gap-4">

          {/* 프로필 아이콘 */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 transition"
              style={{ borderColor: LIB.woodLight }}
              title="아이콘 변경"
            >
              <img src={selectedIcon} alt="내 아이콘" className="w-full h-full object-cover" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 rounded-2xl shadow-xl z-50 w-72 overflow-hidden" style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}>
                {/* 아이콘 선택 */}
                <div className="px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${LIB.parchmentDark}` }}>
                  <p className="text-xs font-bold mb-3" style={{ color: LIB.inkLight }}>아이콘 선택</p>
                  <div className="grid grid-cols-4 gap-2">
                    {ICONS.map((ic, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedIcon(ic); setProfileOpen(false) }}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 transition hover:scale-110"
                        style={{ borderColor: selectedIcon === ic ? LIB.gold : 'transparent' }}
                      >
                        <img src={ic} alt={`icon${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                {/* 로그아웃 */}
                <button
                  onClick={async () => { setProfileOpen(false); await signOut(); navigate('/login') }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold transition flex items-center gap-2"
                  style={{ color: LIB.deepRed }}
                >
                  <LogOut size={15} strokeWidth={2} /> 로그아웃
                </button>
              </div>
            )}
          </div>

          {/* 햄버거 메뉴 */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col gap-1.5 p-2 rounded-lg transition hover:opacity-70"
            title="메뉴"
          >
            <span className="block w-5 h-0.5 rounded-full" style={{ background: LIB.wood }} />
            <span className="block w-5 h-0.5 rounded-full" style={{ background: LIB.wood }} />
            <span className="block w-5 h-0.5 rounded-full" style={{ background: LIB.wood }} />
          </button>
        </div>
      </nav>

      {/* 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: LIB.cream, borderLeft: `1px solid ${LIB.shelfLine}` }}
      >
        {/* 사이드바 상단 책등 라인 */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${LIB.wood}, ${LIB.woodLight})` }} />

        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${LIB.parchmentDark}` }}>
          <span className="text-lg font-extrabold" style={{ color: LIB.wood }}>메뉴</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-2xl leading-none transition hover:opacity-50"
            style={{ color: LIB.inkLight }}
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-4 flex-1">
          {MENU_ITEMS.map(({ path, label, icon }) => {
            const isActive = pathname === path
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold relative overflow-hidden group"
                style={{
                  background: isActive ? LIB.wood : 'transparent',
                  color: isActive ? LIB.parchment : LIB.inkMid,
                  transition: 'background 0.18s ease, color 0.18s ease, transform 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = LIB.parchmentDark
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ background: LIB.gold }}
                  />
                )}
                {icon}
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 py-5" style={{ borderTop: `1px solid ${LIB.parchmentDark}` }}>
          <button
            onClick={async () => { await signOut(); navigate('/login'); setSidebarOpen(false) }}
            className="w-full text-sm transition text-left flex items-center gap-2 font-semibold"
            style={{ color: LIB.deepRed }}
          >
            <LogOut size={15} strokeWidth={2} /> 로그아웃
          </button>
        </div>
      </aside>
    </>
  )
}
