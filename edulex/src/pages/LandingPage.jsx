import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import logo from '../assets/edulex.png'
import library from '../assets/library.png'

function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('is-visible'); io.disconnect() } },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    <line x1="12" y1="6" x2="17" y2="6"/><line x1="12" y1="10" x2="17" y2="10"/>
  </svg>
)
const IconAI = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <circle cx="11" cy="15" r="2.5"/><line x1="13" y1="17" x2="15.5" y2="19.5"/>
  </svg>
)
const IconGame = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"/>
  </svg>
)
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

const features = [
  { tag: '공식 단어장', Icon: IconBook,
    title: '전공 핵심 어휘를\n체계적으로 학습',
    desc: '전공 수업·원서에 나오는 핵심 어휘를 영어·전공 뜻·예문으로 구성된 공식 단어장으로 학습하세요.' },
  { tag: 'AI 단어장', Icon: IconAI,
    title: 'PDF 하나로\n나만의 단어장 완성',
    desc: 'PDF를 업로드하면 AI가 핵심 단어를 자동 추출해 나만의 단어장을 즉시 생성합니다.' },
  { tag: '게이미피케이션', Icon: IconGame,
    title: '퀴즈·보상으로\n매일 학습 유지',
    desc: '객관식 퀴즈로 단어를 점검하고 책갈피 보상과 출석 스트릭으로 학습 동기를 이어가세요.' },
  { tag: '대시보드', Icon: IconChart,
    title: '내 진행률을\n한눈에 파악',
    desc: '단어장별 학습 완료율을 시각화하여 취약 영역을 빠르게 파악하고 집중 학습할 수 있습니다.' },
]

const steps = [
  { num: '01', title: '회원가입', desc: '이메일 또는 Google 계정으로 30초 만에 가입' },
  { num: '02', title: '전공 선택', desc: '최대 2개 전공을 선택하면 맞춤 단어장 자동 필터링' },
  { num: '03', title: '학습 시작', desc: '퀴즈를 풀고 책갈피를 모아 캐릭터를 성장시키기' },
]

const stats = [
  { value: '140%', label: '전통 방식 대비 암기 성공률' },
  { value: '2', label: '동시 전공 학습 지원' },
  { value: 'AI', label: 'PDF 자동 단어 추출' },
]

function StatItem({ value, label, delay }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="fade-up px-8 first:pl-0 last:pr-0 text-center" style={{ '--d': `${delay}ms` }}>
      <p className="font-display text-5xl font-semibold text-stone-800 mb-2">{value}</p>
      <p className="text-xs text-stone-400 tracking-wide">{label}</p>
    </div>
  )
}

function FeatureCard({ tag, Icon, title, desc, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className="fade-up group relative bg-white border border-stone-200/80 rounded-xl p-7 overflow-hidden cursor-default transition-all duration-400 hover:border-amber-200 hover:bg-amber-50/30"
      style={{ '--d': `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-amber-700 opacity-80"><Icon /></span>
        <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-stone-400">{tag}</span>
      </div>
      <h3 className="font-display text-xl font-semibold whitespace-pre-line leading-snug text-stone-800 mb-3">
        {title}
      </h3>
      <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
      <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full bg-linear-to-r from-amber-300 to-amber-100 transition-all duration-500" />
    </div>
  )
}

function StepItem({ num, title, desc, delay }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="fade-up flex gap-6" style={{ '--d': `${delay}ms` }}>
      <span className="font-display text-5xl font-semibold text-amber-200 leading-none select-none shrink-0 w-14">{num}</span>
      <div className="pt-1">
        <h3 className="text-base font-semibold text-stone-800 mb-1.5">{title}</h3>
        <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        * { font-family: 'Inter', system-ui, sans-serif; }
        h1, h2, h3, .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .fade-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(.22,1,.36,1) var(--d,0ms),
                      transform 0.65s cubic-bezier(.22,1,.36,1) var(--d,0ms);
        }
        .fade-up.is-visible { opacity: 1; transform: translateY(0); }
        .hero-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(16px);
          animation: wordIn 0.9s cubic-bezier(.22,1,.36,1) forwards;
        }
        @keyframes wordIn { to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="min-h-screen bg-[#f7f5f0] text-stone-900">

        {/* ─── 헤더 ─── */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3
                           bg-[#f7f5f0]/85 backdrop-blur-md border-b border-stone-200/60">
          <img src={logo} alt="EDULEX" className="h-16 w-auto" />
          <nav className="flex items-center gap-2">
            <Link to="/login"
              className="text-sm font-medium text-stone-500 px-4 py-2 rounded-lg hover:text-stone-900 hover:bg-stone-100 transition-colors">
              로그인
            </Link>
            <Link to="/signup"
              className="text-sm font-medium text-white bg-stone-900 px-5 py-2.5 rounded-lg hover:bg-stone-700 transition-colors">
              무료로 시작하기
            </Link>
          </nav>
        </header>

        {/* ─── 히어로 ─── */}
        <section className="relative w-full min-h-screen flex flex-col justify-end overflow-hidden">
          <img src={library} alt="도서관" className="absolute inset-0 w-full h-full object-cover object-center scale-105" />
          <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/70 to-stone-900/30" />

          <div className="relative z-10 max-w-5xl mx-auto w-full px-8 pb-24 pt-48">
            <p className="hero-word text-[10px] font-medium tracking-[0.3em] uppercase text-amber-300/80 mb-6"
               style={{ animationDelay: '200ms' }}>
              전공 어휘 학습 플랫폼
            </p>
            <h1 className="font-display font-semibold leading-none tracking-tight text-stone-50 mb-8">
              <span className="hero-word block text-7xl md:text-9xl" style={{ animationDelay: '350ms' }}>전공 단어,</span>
              <span className="hero-word block text-7xl md:text-9xl text-amber-300" style={{ animationDelay: '480ms' }}>게임처럼</span>
              <span className="hero-word block text-7xl md:text-9xl" style={{ animationDelay: '610ms' }}>암기하세요.</span>
            </h1>
            <div className="hero-word flex flex-col items-start gap-6" style={{ animationDelay: '750ms' }}>
              <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
                전공 원서가 어렵게 느껴지나요?<br />EDULEX로 핵심 어휘를 재미있게 학습하고 성적을 올리세요.
              </p>
              <div className="flex gap-3 shrink-0">
                <Link to="/signup"
                  className="text-sm font-medium text-stone-900 bg-amber-300 px-6 py-3 rounded-lg hover:bg-amber-200 transition-colors">
                  무료로 시작하기 →
                </Link>
                <Link to="/login"
                  className="text-sm font-medium text-stone-300 border border-stone-600 px-6 py-3 rounded-lg hover:border-stone-400 hover:text-white transition-colors">
                  로그인
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 통계 ─── */}
        <section className="bg-[#f7f5f0] border-b border-stone-200">
          <div className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-3 divide-x divide-stone-200">
            {stats.map((s, i) => <StatItem key={s.label} {...s} delay={i * 80} />)}
          </div>
        </section>

        {/* ─── 기능 소개 ─── */}
        <section className="max-w-5xl mx-auto px-8 py-28">
          <div className="mb-14">
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-amber-700 mb-3">Features</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-stone-800 leading-[1.1]">
              학습의 모든 단계를<br />EDULEX 하나로
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, i) => <FeatureCard key={f.tag} {...f} delay={i * 70} />)}
          </div>
        </section>

        {/* ─── 사용 방법 ─── */}
        <section className="border-t border-stone-200 bg-stone-100/50">
          <div className="max-w-5xl mx-auto px-8 py-28">
            <div className="mb-14">
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-amber-700 mb-3">How it works</p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-stone-800 leading-[1.1]">
                3분이면<br />시작할 수 있어요
              </h2>
            </div>
            <div className="flex flex-col gap-10 max-w-lg">
              {steps.map((s, i) => <StepItem key={s.num} {...s} delay={i * 100} />)}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="relative overflow-hidden">
          <img src={library} alt="도서관" className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-stone-950/82" />
          <div className="absolute inset-0 bg-amber-950/15" />
          <div className="relative z-10 max-w-5xl mx-auto px-8 py-36 text-center">
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-amber-300/70 mb-8">EDULEX</p>
            <h2 className="font-display text-5xl md:text-7xl font-semibold text-stone-100 leading-[1.05] mb-6">
              오늘부터<br />시작하세요.
            </h2>
            <p className="text-stone-400 text-sm mb-12 max-w-xs mx-auto leading-relaxed">
              무료로 가입하고 전공 어휘 학습을 게임처럼 즐기세요.
            </p>
            <Link to="/signup"
              className="inline-block text-stone-900 bg-amber-300 font-medium text-sm px-10 py-4 rounded-lg hover:bg-amber-200 transition-colors">
              무료로 시작하기 →
            </Link>
          </div>
        </section>

        {/* ─── 푸터 ─── */}
        <footer className="bg-[#f7f5f0] border-t border-stone-200 py-8 px-8 flex items-center justify-between">
          <img src={logo} alt="EDULEX" className="h-11 w-auto opacity-40" />
          <p className="text-xs text-stone-300">© 2026 EDULEX. All rights reserved.</p>
        </footer>

      </div>
    </>
  )
}
