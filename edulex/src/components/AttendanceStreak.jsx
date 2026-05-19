import { useState } from 'react'
import { Flame } from 'lucide-react'
import { LIB } from '../constants/theme'
import AttendanceHeatmap from './AttendanceHeatmap'

export default function AttendanceStreak({
  attendedDates,
  streak,
  checkedToday,
  loading,
  checkingIn,
  getGridStartDate,
  onCheckIn,
}) {
  const [btnHover, setBtnHover] = useState(false)
  const [btnPress, setBtnPress] = useState(false)

  const startDate = getGridStartDate()

  const btnStyle = checkedToday
    ? {
        background: '#d1fae5',
        color: '#059669',
        cursor: 'default',
      }
    : {
        background: btnPress ? LIB.wood : btnHover ? LIB.gold : LIB.goldLight,
        color: btnPress || btnHover ? '#fff' : LIB.ink,
        transform: btnPress ? 'scale(0.96)' : btnHover ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 0.15s cubic-bezier(.34,1.56,.64,1), background 0.15s ease, color 0.15s ease',
        cursor: checkingIn ? 'wait' : 'pointer',
      }

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: LIB.cream,
        border: `1px solid ${LIB.shelfLine}`,
        boxShadow: '0 2px 8px rgba(92,58,30,0.08)',
      }}
    >
      {/* 헤더: 연속 일수 + 출석 버튼 */}
      <div className="flex items-center justify-between mb-5">
        {/* 좌측: 연속 출석 일수 */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: '48px',
              height: '48px',
              background: streak > 0
                ? `linear-gradient(135deg, ${LIB.gold}, ${LIB.goldLight})`
                : LIB.parchmentDark,
            }}
          >
            <Flame
              size={24}
              color={streak > 0 ? LIB.wood : LIB.inkLight}
              strokeWidth={2}
            />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span
                className="font-bold"
                style={{ fontSize: '32px', lineHeight: 1, color: streak > 0 ? LIB.gold : LIB.inkLight }}
              >
                {streak}
              </span>
              <span
                className="text-base font-semibold"
                style={{ color: LIB.inkMid }}
              >
                일 연속
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: LIB.inkLight }}>
              연속 출석 중
            </p>
          </div>
        </div>

        {/* 우측: 출석 버튼 */}
        <button
          onClick={onCheckIn}
          disabled={checkedToday || checkingIn}
          onMouseEnter={() => !checkedToday && setBtnHover(true)}
          onMouseLeave={() => { setBtnHover(false); setBtnPress(false) }}
          onMouseDown={() => !checkedToday && setBtnPress(true)}
          onMouseUp={() => setBtnPress(false)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={btnStyle}
        >
          {checkingIn
            ? '처리 중...'
            : checkedToday
            ? '출석 완료'
            : '출석하기'}
        </button>
      </div>

      {/* 잔디 그리드 */}
      <div
        className="rounded-xl p-4"
        style={{
          background: LIB.parchment,
          border: `1px solid ${LIB.parchmentDark}`,
        }}
      >
        <p className="text-xs font-semibold mb-3" style={{ color: LIB.inkMid }}>
          연간 출석 현황
        </p>
        {loading ? (
          <div className="flex items-center gap-2 py-4" style={{ color: LIB.inkLight }}>
            <span className="text-sm">불러오는 중...</span>
          </div>
        ) : (
          <AttendanceHeatmap
            attendedDates={attendedDates}
            startDate={startDate}
          />
        )}
      </div>

      {/* 총 출석일 뱃지 */}
      <div className="flex items-center gap-2 mt-3">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: LIB.parchmentDark, color: LIB.inkMid }}
        >
          총 {attendedDates.length}일 출석
        </span>
        {checkedToday && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#d1fae5', color: '#059669' }}
          >
            오늘 출석 완료
          </span>
        )}
      </div>
    </div>
  )
}
