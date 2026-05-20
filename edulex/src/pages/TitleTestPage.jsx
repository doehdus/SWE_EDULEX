// ============================================================
// 칭호 시스템 임시 테스트 페이지 (Phase 3 검증용)
// ============================================================
// 사용 목적: 임계치 도달까지 실제 학습 활동을 반복하지 않고
//            누적 통계 / 출석 일수를 강제 조작해 칭호 부여 흐름을 검증.
//
// ⚠️ 운영 환경 진입 전 본 페이지 + App.jsx 의 /title-test 라우트 제거 필요.
// ============================================================
import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { useTitles } from '../hooks/useTitles'
import { useReward } from '../context/RewardContext'
import { TITLES, TITLES_BY_CATEGORY } from '../constants/titles'
import { LIB } from '../constants/theme'
import TitleBadge from '../components/title/TitleBadge'

const PRESET_EARNED = [0, 3000, 10000, 27000, 54000]
const PRESET_SPENT  = [0, 5000, 10000, 20000, 40000]
const PRESET_ATTEND = [0, 10, 30, 50, 100, 200, 365]

export default function TitleTestPage() {
  const { user } = useAuth()
  const { owned, activeTitle, refresh } = useTitles()
  const reward = useReward()

  const [stats, setStats] = useState({
    bookmark: 0,
    bookmark_total_earned: 0,
    bookmark_total_spent: 0,
    attendance_count: 0,
  })
  const [log, setLog] = useState('')
  const [busy, setBusy] = useState(false)

  const fetchStats = async () => {
    if (!user?.id) return
    const [{ data: u }, { count }] = await Promise.all([
      supabase
        .from('users')
        .select('bookmark, bookmark_total_earned, bookmark_total_spent')
        .eq('id', user.id)
        .single(),
      supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ])
    setStats({
      bookmark: u?.bookmark ?? 0,
      bookmark_total_earned: u?.bookmark_total_earned ?? 0,
      bookmark_total_spent: u?.bookmark_total_spent ?? 0,
      attendance_count: count ?? 0,
    })
  }

  useEffect(() => {
    fetchStats()
  }, [user?.id])

  const appendLog = (msg) => {
    const ts = new Date().toLocaleTimeString()
    setLog((prev) => `[${ts}] ${msg}\n` + prev)
  }

  // 출석 RPC 호출 — check_titles_for_user 트리거 용도.
  // 오늘 이미 체크된 경우에도 already_checked=true 로 응답하지만
  // check_titles_for_user 는 그대로 실행되어 임계치 평가됨.
  const triggerEvaluation = async () => {
    const { data, error } = await supabase.rpc('check_attendance', {
      p_user_id: user.id,
    })
    if (error) {
      appendLog(`❌ check_attendance: ${error.message}`)
      return
    }
    appendLog(`✓ trigger: ${JSON.stringify(data)}`)
    reward.pushFromRpcResponse(data)
    await refresh()
    await fetchStats()
  }

  // 누적 획득 통계 설정.
  const setTotalEarned = async (v) => {
    if (busy) return
    setBusy(true)
    const { error } = await supabase
      .from('users')
      .update({ bookmark_total_earned: v })
      .eq('id', user.id)
    if (error) appendLog(`❌ set earned: ${error.message}`)
    else {
      appendLog(`✓ bookmark_total_earned = ${v}`)
      await triggerEvaluation()
    }
    setBusy(false)
  }

  const setTotalSpent = async (v) => {
    if (busy) return
    setBusy(true)
    const { error } = await supabase
      .from('users')
      .update({ bookmark_total_spent: v })
      .eq('id', user.id)
    if (error) appendLog(`❌ set spent: ${error.message}`)
    else {
      appendLog(`✓ bookmark_total_spent = ${v}`)
      await triggerEvaluation()
    }
    setBusy(false)
  }

  // 출석 N일을 과거 날짜(오늘 - 1, -2, ...)로 INSERT.
  // 중복 충돌 무시(ON CONFLICT). 오늘 날짜는 별도(체크 버튼) 로 처리.
  const setAttendance = async (target) => {
    if (busy) return
    setBusy(true)
    const today = new Date()
    const rows = []
    // 오늘 포함 target 일수 채우기.
    for (let i = 0; i < target; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      rows.push({ user_id: user.id, date: d.toISOString().slice(0, 10) })
    }
    if (rows.length === 0) {
      // target=0 — 모두 삭제 (오늘 출석도 제거)
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('user_id', user.id)
      if (error) appendLog(`❌ delete attendance: ${error.message}`)
      else appendLog(`✓ attendance 전체 삭제`)
    } else {
      // 기존 행 모두 삭제 후 새로 INSERT (정확한 카운트 보장).
      const { error: delErr } = await supabase
        .from('attendance')
        .delete()
        .eq('user_id', user.id)
      if (delErr) {
        appendLog(`❌ delete attendance: ${delErr.message}`)
        setBusy(false)
        return
      }
      const { error } = await supabase.from('attendance').insert(rows)
      if (error) appendLog(`❌ insert attendance: ${error.message}`)
      else appendLog(`✓ attendance ${target}일 설정`)
    }
    await triggerEvaluation()
    setBusy(false)
  }

  // 전체 초기화 — 통계 0 + attendance 삭제 (user_titles 는 SQL Editor 안내).
  const resetAll = async () => {
    if (busy) return
    if (!confirm('통계 / 출석을 모두 초기화합니다. user_titles 는 SQL Editor 로 직접 정리해야 합니다.')) return
    setBusy(true)
    await supabase
      .from('users')
      .update({ bookmark_total_earned: 0, bookmark_total_spent: 0 })
      .eq('id', user.id)
    await supabase.from('attendance').delete().eq('user_id', user.id)
    appendLog('✓ 통계 / 출석 초기화 완료')
    await fetchStats()
    setBusy(false)
  }

  return (
    <div className="min-h-screen p-6" style={{ background: LIB.parchment, color: LIB.ink }}>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* 헤더 */}
        <div
          className="rounded-2xl p-5"
          style={{ background: LIB.deepRed, color: LIB.parchment }}
        >
          <h1 className="text-xl font-extrabold">⚠️ 칭호 시스템 임시 테스트 페이지</h1>
          <p className="text-xs mt-1 opacity-90">
            운영 환경 진입 전 본 페이지 + /title-test 라우트 제거. 누적 통계와 출석 일수를 강제 조작하고
            check_attendance 를 호출해 check_titles_for_user 임계치 평가를 트리거합니다.
          </p>
        </div>

        {/* 현재 상태 */}
        <div
          className="rounded-2xl p-5"
          style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">현재 상태</h2>
            <button
              onClick={fetchStats}
              className="text-xs px-3 py-1 rounded-full hover:opacity-80"
              style={{ background: LIB.wood, color: LIB.parchment }}
            >
              새로고침
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Stat label="책갈피" value={stats.bookmark} />
            <Stat label="누적 획득" value={stats.bookmark_total_earned} />
            <Stat label="누적 소모" value={stats.bookmark_total_spent} />
            <Stat label="출석 일수" value={stats.attendance_count} />
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold mb-2" style={{ color: LIB.inkMid }}>
              보유 칭호 ({owned.size}) · 활성: <b>{activeTitle ?? '없음'}</b>
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(TITLES).map((k) => (
                <TitleBadge key={k} titleKey={k} owned={owned.has(k)} active={activeTitle === k} />
              ))}
            </div>
          </div>
        </div>

        {/* 누적 획득 */}
        <Section title="누적 획득 (bookmark_total_earned)">
          {PRESET_EARNED.map((v) => (
            <PresetBtn key={v} v={v} disabled={busy} onClick={() => setTotalEarned(v)} suffix="개" />
          ))}
        </Section>

        {/* 누적 소모 */}
        <Section title="누적 소모 (bookmark_total_spent)">
          {PRESET_SPENT.map((v) => (
            <PresetBtn key={v} v={v} disabled={busy} onClick={() => setTotalSpent(v)} suffix="개" />
          ))}
        </Section>

        {/* 출석 */}
        <Section title="출석 일수 (attendance 강제 설정)">
          {PRESET_ATTEND.map((v) => (
            <PresetBtn key={v} v={v} disabled={busy} onClick={() => setAttendance(v)} suffix="일" />
          ))}
        </Section>

        {/* 일괄 동작 */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={triggerEvaluation}
            disabled={busy}
            className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: LIB.gold, color: LIB.ink }}
          >
            임계치 평가만 트리거
          </button>
          <button
            onClick={resetAll}
            disabled={busy}
            className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: LIB.deepRed, color: LIB.parchment }}
          >
            통계·출석 초기화
          </button>
        </div>

        {/* user_titles 리셋 가이드 */}
        <div
          className="rounded-2xl p-4 text-xs font-mono whitespace-pre-wrap"
          style={{ background: LIB.cream, border: `1px dashed ${LIB.shelfLine}`, color: LIB.inkMid }}
        >
          {`-- 보유 칭호 전체 삭제 (SQL Editor 에서 실행):
DELETE FROM public.user_titles WHERE user_id = '${user?.id ?? '<your-uuid>'}';

-- 활성 칭호 해제:
UPDATE public.users SET active_title = NULL WHERE id = '${user?.id ?? '<your-uuid>'}';`}
        </div>

        {/* 응답 로그 */}
        <div
          className="rounded-2xl p-4 text-xs font-mono whitespace-pre-wrap min-h-[120px]"
          style={{ background: '#1a1208', color: '#e8d5b7', border: `1px solid ${LIB.wood}` }}
        >
          {log || '응답 로그가 여기에 표시됩니다.'}
        </div>

        {/* 카테고리 미리보기 */}
        <div className="text-xs space-y-3" style={{ color: LIB.inkMid }}>
          {Object.entries(TITLES_BY_CATEGORY).map(([cat, keys]) => (
            <div key={cat}>
              <b>{cat}</b>: {keys.map((k) => `${TITLES[k].name}(${TITLES[k].tier}/${TITLES[k].threshold})`).join(', ')}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{ background: LIB.parchment, border: `1px solid ${LIB.shelfLine}` }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: LIB.inkLight }}>{label}</p>
      <p className="text-lg font-extrabold" style={{ color: LIB.ink }}>{value.toLocaleString()}</p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}
    >
      <h3 className="text-sm font-bold mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function PresetBtn({ v, disabled, onClick, suffix }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-full text-xs font-bold transition hover:opacity-80 disabled:opacity-40"
      style={{ background: LIB.wood, color: LIB.parchment }}
    >
      {v.toLocaleString()} {suffix}
    </button>
  )
}
