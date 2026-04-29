import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import logo from '../assets/logo.png'
import hero from '../assets/hero.png'

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); observer.disconnect() } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

const features = [
  {
    tag: '공식 단어장',
    title: '전공 핵심 어휘를\n체계적으로 학습',
    desc: '전공 수업·원서에 나오는 핵심 어휘를 영어·전공 뜻·예문으로 구성된 공식 단어장으로 학습하세요.',
    icon: '📚',
    tagColor: 'text-teal-600 bg-teal-50 border-teal-200',
    accent: 'from-teal-50 to-white',
    line: 'from-teal-400 via-teal-300 to-teal-200',
  },
  {
    tag: 'AI 단어장',
    title: 'PDF 하나로\n나만의 단어장 완성',
    desc: 'PDF를 업로드하면 AI가 핵심 단어를 자동 추출해 나만의 단어장을 즉시 생성합니다.',
    icon: '🤖',
    tagColor: 'text-violet-600 bg-violet-50 border-violet-200',
    accent: 'from-violet-50 to-white',
    line: 'from-violet-400 via-violet-300 to-violet-200',
  },
  {
    tag: '게이미피케이션',
    title: '퀴즈·보상으로\n매일 학습 유지',
    desc: '객관식 퀴즈로 단어를 점검하고 별가루 보상과 출석 스트릭으로 학습 동기를 이어가세요.',
    icon: '🎮',
    tagColor: 'text-amber-600 bg-amber-50 border-amber-200',
    accent: 'from-amber-50 to-white',
    line: 'from-amber-400 via-amber-300 to-amber-200',
  },
  {
    tag: '대시보드',
    title: '내 진행률을\n한눈에 파악',
    desc: '단어장별 학습 완료율을 시각화하여 취약 영역을 빠르게 파악하고 집중 학습할 수 있습니다.',
    icon: '📊',
    tagColor: 'text-sky-600 bg-sky-50 border-sky-200',
    accent: 'from-sky-50 to-white',
    line: 'from-sky-400 via-sky-300 to-sky-200',
  },
]

const steps = [
  { num: '01', title: '회원가입', desc: '이메일 또는 Google 계정으로 30초 만에 가입', numColor: 'text-teal-400' },
  { num: '02', title: '전공 선택', desc: '최대 2개 전공을 선택하면 맞춤 단어장 자동 필터링', numColor: 'text-violet-400' },
  { num: '03', title: '학습 시작', desc: '퀴즈를 풀고 별가루를 모아 캐릭터를 성장시키기', numColor: 'text-amber-400' },
]

function FeatureCard({ tag, title, desc, icon, tagColor, accent, line, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className="reveal-card group relative bg-white border border-gray-100 rounded-3xl p-8 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 cursor-default"
      style={{ '--delay': `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-linear-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <span className={`text-xs font-bold tracking-widest uppercase border px-3 py-1 rounded-full ${tagColor}`}>
            {tag}
          </span>
          <span className="text-4xl drop-shadow transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            {icon}
          </span>
        </div>
        <h3 className="text-2xl font-extrabold mb-4 whitespace-pre-line leading-snug text-gray-900">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-500 transition-colors duration-300">
          {desc}
        </p>
      </div>

      <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-linear-to-r ${line} transition-all duration-500`} />
    </div>
  )
}

function StepCard({ num, title, desc, numColor, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className="reveal-card bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-500"
      style={{ '--delay': `${delay}ms` }}
    >
      <p className={`text-7xl font-extrabold ${numColor} opacity-20 mb-6 leading-none`}>{num}</p>
      <h3 className="text-xl font-extrabold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function StatItem({ value, label, delay }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="reveal-up" style={{ '--delay': `${delay}ms` }}>
      <p className="text-4xl md:text-5xl font-extrabold text-teal-500 mb-2">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        .reveal-card {
          opacity: 0;
          transform: translateY(40px) scale(0.97);
          transition: opacity 0.7s cubic-bezier(.22,1,.36,1) var(--delay, 0ms),
                      transform 0.7s cubic-bezier(.22,1,.36,1) var(--delay, 0ms);
        }
        .reveal-card.revealed {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .reveal-up {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease var(--delay, 0ms),
                      transform 0.6s ease var(--delay, 0ms);
        }
        .reveal-up.revealed {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

        {/* 헤더 */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
          <img src={logo} alt="EduLex" className="h-12 w-auto" />
          <div className="flex gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-500 hover:text-gray-900 px-5 py-2 rounded-full border border-gray-200 hover:border-gray-400 transition"
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className="text-sm font-bold text-white bg-teal-500 px-5 py-2 rounded-full hover:bg-teal-600 transition shadow-sm"
            >
              무료로 시작하기
            </Link>
          </div>
        </header>

        {/* 히어로 */}
        <section className="relative max-w-6xl mx-auto px-8 pt-24 pb-28 flex flex-col md:flex-row items-center gap-16">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-150 h-100 bg-teal-100 rounded-full blur-[120px] pointer-events-none opacity-60" />

          <div className="flex-1 relative z-10">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-teal-600 border border-teal-200 bg-teal-50 px-4 py-1.5 rounded-full mb-6">
              전공 어휘 학습 플랫폼
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-8 text-gray-900">
              전공 단어,<br />
              <span className="text-teal-500">게임처럼</span><br />
              암기하세요.
            </h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-md">
              전공 원서가 어렵게 느껴지나요?<br />
              EduLex로 핵심 어휘를 재미있게 학습하고 성적을 올리세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="bg-teal-500 text-white font-extrabold text-base px-8 py-4 rounded-full hover:bg-teal-600 transition shadow-lg text-center"
              >
                무료로 시작하기 →
              </Link>
              <Link
                to="/login"
                className="border border-gray-200 text-gray-500 font-semibold text-base px-8 py-4 rounded-full hover:border-gray-400 hover:text-gray-700 transition text-center"
              >
                이미 계정이 있어요
              </Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-200/50 rounded-3xl blur-2xl scale-95" />
              <img src={hero} alt="hero" className="relative w-full max-w-sm rounded-3xl drop-shadow-xl" />
            </div>
          </div>
        </section>

        {/* 통계 */}
        <section className="bg-white border-y border-gray-100 py-14 px-8">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
            <StatItem value="140%" label="게이미피케이션 암기 성공률" delay={0} />
            <StatItem value="2개" label="전공 동시 학습 지원" delay={100} />
            <StatItem value="AI" label="PDF 자동 단어 추출" delay={200} />
          </div>
        </section>

        {/* 기능 소개 */}
        <section className="max-w-6xl mx-auto px-8 py-28">
          <p className="text-xs font-bold tracking-widest uppercase text-teal-500 mb-4">기능</p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-16 max-w-xl leading-tight text-gray-900">
            학습의 모든 단계를<br />EduLex 하나로
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={f.tag} {...f} delay={i * 80} />
            ))}
          </div>
        </section>

        {/* 사용 방법 */}
        <section className="bg-white border-t border-gray-100 py-28 px-8">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-bold tracking-widest uppercase text-teal-500 mb-4">시작하기</p>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-16 leading-tight text-gray-900">
              3분이면<br />시작할 수 있어요
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <StepCard key={s.num} {...s} delay={i * 100} />
              ))}
            </div>
          </div>
        </section>

        {/* 하단 CTA */}
        <section className="py-32 px-8 text-center relative overflow-hidden bg-linear-to-br from-teal-500 to-teal-600">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-white">
              오늘부터<br />시작하세요.
            </h2>
            <p className="text-teal-100 text-lg mb-10">무료로 가입하고 전공 어휘 학습을 게임처럼 즐기세요.</p>
            <Link
              to="/signup"
              className="inline-block bg-white text-teal-600 font-extrabold text-lg px-12 py-5 rounded-full hover:bg-teal-50 transition shadow-2xl"
            >
              무료로 시작하기 →
            </Link>
          </div>
        </section>

        {/* 푸터 */}
        <footer className="border-t border-gray-100 bg-white py-8 text-center text-xs text-gray-300">
          © 2026 EduLex. All rights reserved.
        </footer>
      </div>
    </>
  )
}
