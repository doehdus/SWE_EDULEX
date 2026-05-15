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

const features = [
  { tag: '공식 단어장', title: '전공 핵심 어휘를\n체계적으로 학습', desc: '전공 수업·원서에 나오는 핵심 어휘를 영어·전공 뜻·예문으로 구성된 공식 단어장으로 학습하세요.' },
  { tag: 'AI 단어장',  title: 'PDF 하나로\n나만의 단어장 완성', desc: 'PDF를 업로드하면 AI가 핵심 단어를 자동 추출해 나만의 단어장을 즉시 생성합니다.' },
  { tag: '게이미피케이션', title: '퀴즈·보상으로\n매일 학습 유지', desc: '객관식 퀴즈로 단어를 점검하고 책갈피 보상과 출석 스트릭으로 학습 동기를 이어가세요.' },
  { tag: '대시보드', title: '내 진행률을\n한눈에 파악', desc: '단어장별 학습 완료율을 시각화하여 취약 영역을 빠르게 파악하고 집중 학습할 수 있습니다.' },
]

const steps = [
  { num: '01', title: '회원가입', desc: '이메일 또는 Google 계정으로 30초 만에 가입' },
  { num: '02', title: '전공 선택', desc: '최대 2개 전공을 선택하면 맞춤 단어장 자동 필터링' },
  { num: '03', title: '학습 시작', desc: '퀴즈를 풀고 책갈피를 모아 캐릭터를 성장시키기' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-900">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3 bg-[#f7f5f0]/85 backdrop-blur-md border-b border-stone-200/60">
        <img src={logo} alt="EDULEX" className="h-16 w-auto" />
        <nav className="flex items-center gap-2">
          <Link to="/login" className="text-sm font-medium text-stone-500 px-4 py-2 rounded-lg hover:text-stone-900 hover:bg-stone-100 transition-colors">로그인</Link>
          <Link to="/signup" className="text-sm font-medium text-white bg-stone-900 px-5 py-2.5 rounded-lg hover:bg-stone-700 transition-colors">무료로 시작하기</Link>
        </nav>
      </header>

      {/* 히어로 */}
      <section className="relative w-full min-h-screen flex flex-col justify-end overflow-hidden">
        <img src={library} alt="도서관" className="absolute inset-0 w-full h-full object-cover object-center scale-105" />
        <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/70 to-stone-900/30" />
        <div className="relative z-10 max-w-5xl mx-auto w-full px-8 pb-24 pt-48">
          <h1 className="font-display font-semibold leading-none tracking-tight text-stone-50 mb-8">
            <span className="block text-7xl md:text-9xl">전공 단어,</span>
            <span className="block text-7xl md:text-9xl text-amber-300">게임처럼</span>
            <span className="block text-7xl md:text-9xl">암기하세요.</span>
          </h1>
          <div className="flex gap-3">
            <Link to="/signup" className="text-sm font-medium text-stone-900 bg-amber-300 px-6 py-3 rounded-lg hover:bg-amber-200 transition-colors">무료로 시작하기 →</Link>
            <Link to="/login" className="text-sm font-medium text-stone-300 border border-stone-600 px-6 py-3 rounded-lg hover:border-stone-400 hover:text-white transition-colors">로그인</Link>
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="max-w-5xl mx-auto px-8 py-28">
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-stone-800 mb-14">학습의 모든 단계를<br />EDULEX 하나로</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(f => (
            <div key={f.tag} className="bg-white border border-stone-200/80 rounded-xl p-7 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-400">
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-stone-400">{f.tag}</span>
              <h3 className="font-display text-xl font-semibold whitespace-pre-line leading-snug text-stone-800 mb-3 mt-5">{f.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 사용 방법 */}
      <section className="border-t border-stone-200 bg-stone-100/50">
        <div className="max-w-5xl mx-auto px-8 py-28">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-stone-800 mb-14">3분이면<br />시작할 수 있어요</h2>
          <div className="flex flex-col gap-10 max-w-lg">
            {steps.map(s => (
              <div key={s.num} className="flex gap-6">
                <span className="font-display text-5xl font-semibold text-amber-200 leading-none select-none shrink-0 w-14">{s.num}</span>
                <div className="pt-1">
                  <h3 className="text-base font-semibold text-stone-800 mb-1.5">{s.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + 푸터 */}
      <section className="relative overflow-hidden">
        <img src={library} alt="도서관" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-stone-950/82" />
        <div className="relative z-10 max-w-5xl mx-auto px-8 py-36 text-center">
          <h2 className="font-display text-5xl md:text-7xl font-semibold text-stone-100 leading-[1.05] mb-6">오늘부터<br />시작하세요.</h2>
          <Link to="/signup" className="inline-block text-stone-900 bg-amber-300 font-medium text-sm px-10 py-4 rounded-lg hover:bg-amber-200 transition-colors">무료로 시작하기 →</Link>
        </div>
      </section>
      <footer className="bg-[#f7f5f0] border-t border-stone-200 py-8 px-8 flex items-center justify-between">
        <img src={logo} alt="EDULEX" className="h-11 w-auto opacity-40" />
        <p className="text-xs text-stone-300">© 2026 EDULEX. All rights reserved.</p>
      </footer>
    </div>
  )
}
