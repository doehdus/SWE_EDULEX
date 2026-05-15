import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { LIB } from '../constants/theme'

function BookCard({ to, label, title, subtitle, bookColor }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link to={to} className="flex gap-4 rounded-2xl p-5 group relative overflow-hidden select-none"
      style={{
        background: LIB.cream, border: `1px solid ${LIB.shelfLine}`,
        boxShadow: hovered ? '0 10px 30px rgba(92,58,30,0.22)' : '0 2px 8px rgba(92,58,30,0.08)',
        transform: hovered ? 'translateY(-5px) rotate(-0.4deg)' : 'none',
        transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease',
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="w-4 shrink-0 rounded-l-sm self-stretch"
        style={{ background: `linear-gradient(180deg, ${bookColor} 0%, rgba(0,0,0,0.4) 100%)`, boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3)' }} />
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: LIB.inkLight }}>{label}</p>
          {title
            ? <p className="text-base font-extrabold leading-snug truncate" style={{ color: LIB.ink }}>{title}</p>
            : <p className="text-sm font-bold" style={{ color: LIB.shelfLine }}>아직 없어요</p>
          }
        </div>
        <p className="text-xs mt-3 font-semibold flex items-center gap-1" style={{ color: LIB.inkLight }}>
          {subtitle} <ChevronRight size={12} />
        </p>
      </div>
    </Link>
  )
}

function RecentCards({ recentWordbook, recentQuiz }) {
  return (
    <div className="grid grid-cols-2 gap-4 min-h-0">
      <BookCard to="/wordbook/my" label="최근 단어장" title={recentWordbook?.title} subtitle="이어서 학습하기" bookColor={LIB.deepRed} />
      <BookCard to="/quiz" label="최근 테스트" title={recentQuiz ? `최근 점수: ${recentQuiz.score}점` : null} subtitle="다시 도전하기" bookColor={LIB.wood} />
    </div>
  )
}