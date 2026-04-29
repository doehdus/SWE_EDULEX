import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

function ProgressBar({ percent }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div
        className="bg-[#7c3aed] h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [progressList, setProgressList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProgress() }, [user])

  const fetchProgress = async () => {
    // 공식 단어장 진행률
    const { data: officialWbs } = await supabase
      .from('official_wordbooks')
      .select('id, title, major')

    // 나만의 단어장
    const { data: myWbs } = await supabase
      .from('user_wordbooks')
      .select('id, title')
      .eq('user_id', user.id)

    const allWbs = [
      ...(officialWbs ?? []).map(w => ({ ...w, type: 'official' })),
      ...(myWbs ?? []).map(w => ({ ...w, type: 'user' })),
    ]

    // 각 단어장의 전체 단어 수 / 학습 완료 단어 수 계산 (SBI-U04)
    const results = await Promise.all(
      allWbs.map(async (wb) => {
        const table = wb.type === 'official' ? 'official_words' : 'user_words'
        const { count: total } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true })
          .eq('wordbook_id', wb.id)

        // 학습 완료 = 퀴즈에서 정답 처리된 단어
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
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">학습 진행률</h1>
      <p className="text-sm text-gray-400 mb-6">단어장별 학습 완료 현황</p>

      {loading ? (
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
                <span className="text-sm font-bold text-[#7c3aed]">{wb.percent}%</span>
              </div>
              <ProgressBar percent={wb.percent} />
              <p className="text-xs text-gray-400 mt-1.5">
                {wb.completed} / {wb.total} 단어 완료
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
