import { LIB } from '../constants/theme'
import { useDashboard } from '../hooks/useDashboard'
import AttendanceStreak from '../components/AttendanceStreak'
import { Toast } from '../components/ui/Toast'

function ProgressBar({ percent }) {
  return (
    <div
      className="w-full rounded-full h-2"
      style={{ background: LIB.parchmentDark }}
    >
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, background: LIB.gold }}
      />
    </div>
  )
}

export default function DashboardPage() {
  const {
    progressList,
    progressLoading,
    attendedDates,
    streak,
    checkedToday,
    attendanceLoading,
    checkingIn,
    toast,
    handleCheckIn,
    dismissToast,
    getGridStartDate,
  } = useDashboard()

  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(135deg, ${LIB.parchment}, ${LIB.cream})` }}
    >
      <div className="p-6 max-w-3xl mx-auto">
        {/* 페이지 타이틀 */}
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: LIB.ink }}
        >
          대시보드
        </h1>
        <p className="text-sm mb-6" style={{ color: LIB.inkLight }}>
          출석 현황 및 학습 진행률을 확인하세요
        </p>

        {/* 출석 스트릭 섹션 */}
        <section className="mb-8">
          <h2
            className="text-base font-semibold mb-3"
            style={{ color: LIB.wood }}
          >
            출석 현황
          </h2>
          <AttendanceStreak
            attendedDates={attendedDates}
            streak={streak}
            checkedToday={checkedToday}
            loading={attendanceLoading}
            checkingIn={checkingIn}
            getGridStartDate={getGridStartDate}
            onCheckIn={handleCheckIn}
          />
        </section>

        {/* 학습 진행률 섹션 */}
        <section>
          <h2
            className="text-base font-semibold mb-3"
            style={{ color: LIB.wood }}
          >
            학습 진행률
          </h2>
          <p className="text-xs mb-4" style={{ color: LIB.inkLight }}>
            단어장별 학습 완료 현황
          </p>

          {progressLoading ? (
            <div
              className="rounded-2xl p-10 text-center text-sm"
              style={{ background: LIB.cream, color: LIB.inkLight }}
            >
              불러오는 중...
            </div>
          ) : progressList.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}
            >
              <p className="text-sm" style={{ color: LIB.inkLight }}>
                단어장이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {progressList.map(wb => (
                <div
                  key={wb.id}
                  className="rounded-2xl p-5"
                  style={{
                    background: LIB.cream,
                    border: `1px solid ${LIB.shelfLine}`,
                    boxShadow: '0 2px 8px rgba(92,58,30,0.06)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: LIB.ink }}
                      >
                        {wb.title}
                      </span>
                      <span
                        className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={
                          wb.type === 'official'
                            ? { background: '#eff6ff', color: '#3b82f6' }
                            : { background: LIB.parchmentDark, color: LIB.inkMid }
                        }
                      >
                        {wb.type === 'official' ? (wb.major ?? '공식') : 'AI 생성'}
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: LIB.gold }}
                    >
                      {wb.percent}%
                    </span>
                  </div>
                  <ProgressBar percent={wb.percent} />
                  <p
                    className="text-xs mt-1.5"
                    style={{ color: LIB.inkLight }}
                  >
                    {wb.completed} / {wb.total} 단어 완료
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 책갈피 획득 토스트 */}
      {toast && (
        <Toast
          message={toast.message}
          onClose={dismissToast}
        />
      )}
    </div>
  )
}
