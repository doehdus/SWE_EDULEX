import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { useStudyTime } from '../hooks/useStudyTime'
import { COLOR, LIB } from '../constants/theme'

function ProgressBar({ percent }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div
        className="h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, background: COLOR.purple }}
      />
    </div>
  )
}

function formatMinutes(seconds) {
  const total = Math.floor(seconds / 60)
  if (total < 60) return `${total}분`
  return `${Math.floor(total / 60)}시간 ${total % 60}분`
}

function StudyTimeChart({ dailyData }) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const found = dailyData.find(r => r.study_date === dateStr)
    return {
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      quizSec: Number(found?.quiz_seconds ?? 0),
      wbSec: Number(found?.wordbook_seconds ?? 0),
    }
  })

  const MAX_H = 100
  const maxSec = Math.max(...days.map(d => d.quizSec + d.wbSec), 1)

  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: `${MAX_H}px` }}>
        {days.map((day, i) => {
          const total = day.quizSec + day.wbSec
          const totalH = (total / maxSec) * MAX_H
          const quizH  = (day.quizSec / maxSec) * MAX_H
          const wbH    = totalH - quizH
          return (
            <div key={i} className="flex-1 flex flex-col justify-end" style={{ height: `${MAX_H}px` }}>
              <div className="relative w-full" style={{ height: `${totalH}px` }}>
                {/* 단어장(청록) 상단 */}
                <div
                  className="absolute left-0 right-0 top-0 rounded-t-sm"
                  style={{ height: `${wbH}px`, background: COLOR.teal }}
                />
                {/* 퀴즈(보라) 하단 */}
                <div
                  className="absolute left-0 right-0 bottom-0 rounded-b-sm"
                  style={{ height: `${quizH}px`, background: COLOR.purple, borderRadius: wbH === 0 ? '4px 4px 4px 4px' : '0 0 4px 4px' }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {days.map((day, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-gray-400">{day.label}</div>
        ))}
      </div>
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLOR.purple }} />
          퀴즈
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLOR.teal }} />
          단어장
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [progressList, setProgressList] = useState([])
  const [progressLoading, setProgressLoading] = useState(true)
  const { dailyData, loading: timeLoading, fetchDailyStudyTime } = useStudyTime(user?.id)

  const fetchProgress = async () => {
    const { data: officialWbs } = await supabase
      .from('official_wordbooks')
      .select('id, title, major')

    const { data: myWbs } = await supabase
      .from('user_wordbooks')
      .select('id, title')
      .eq('user_id', user.id)

    const allWbs = [
      ...(officialWbs ?? []).map(w => ({ ...w, type: 'official' })),
      ...(myWbs ?? []).map(w => ({ ...w, type: 'user' })),
    ]

    const results = await Promise.all(
      allWbs.map(async (wb) => {
        const table = wb.type === 'official' ? 'official_words' : 'user_words'
        const { count: total } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true })
          .eq('wordbook_id', wb.id)

        const { count: completed } = await supabase
          .from('word_progress')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('wordbook_id', wb.id)
          .eq('is_completed', true)

        const percent = total > 0 ? Math.round(((completed ?? 0) / total) * 100) : 0
        return { ...wb, total: total ?? 0, completed: completed ?? 0, percent }
      })
    )

    setProgressList(results)
    setProgressLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { fetchProgress() }, [user])
  useEffect(() => { fetchDailyStudyTime() }, [fetchDailyStudyTime])

  const todayStr = new Date().toISOString().split('T')[0]
  const todayRow = dailyData.find(r => r.study_date === todayStr)
  const todaySec = Number(todayRow?.quiz_seconds ?? 0) + Number(todayRow?.wordbook_seconds ?? 0)
  const weekSec  = dailyData.reduce((acc, r) => acc + Number(r.quiz_seconds) + Number(r.wordbook_seconds), 0)

  return (
    <div className="px-6 py-8" style={{ background: LIB.parchment, minHeight: 'calc(100vh - 72px)' }}>
      <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: LIB.wood }}>대시보드</h1>
      <p className="text-sm mb-6" style={{ color: LIB.inkLight }}>학습 현황 한눈에 보기</p>

      {/* 학습 시간 섹션 */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3" style={{ color: LIB.inkMid }}>학습 시간</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">오늘</p>
            <p className="text-xl font-bold" style={{ color: COLOR.purple }}>
              {timeLoading ? '—' : formatMinutes(todaySec)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">이번 주 (7일)</p>
            <p className="text-xl font-bold" style={{ color: COLOR.teal }}>
              {timeLoading ? '—' : formatMinutes(weekSec)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          {timeLoading ? (
            <p className="text-gray-400 text-sm">불러오는 중...</p>
          ) : (
            <StudyTimeChart dailyData={dailyData} />
          )}
        </div>
      </section>

      {/* 학습 진행률 섹션 */}
      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: LIB.inkMid }}>학습 진행률</h2>
        <p className="text-xs mb-4" style={{ color: LIB.inkLight }}>단어장별 학습 완료 현황</p>
        {progressLoading ? (
          <p className="text-gray-400 text-sm">불러오는 중...</p>
        ) : progressList.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm">단어장이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {progressList.map(wb => (
              <div key={wb.id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-800">{wb.title}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${wb.type === 'official' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'}`}>
                      {wb.type === 'official' ? (wb.major ?? '공식') : 'AI 생성'}
                    </span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: COLOR.purple }}>{wb.percent}%</span>
                </div>
                <ProgressBar percent={wb.percent} />
                <p className="text-xs text-gray-400 mt-1.5">
                  {wb.completed} / {wb.total} 단어 완료
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  )
}

