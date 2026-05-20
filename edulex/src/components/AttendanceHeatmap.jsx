import { useState } from 'react'
import { LIB } from '../constants/theme'

// 요일 레이블 (일~토)
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

// 월 레이블 계산: 각 주(col)의 첫 날이 속한 월 반환
function buildMonthLabels(startDate) {
  const labels = []
  let lastMonth = -1

  for (let col = 0; col < 53; col++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + col * 7)
    const month = d.getMonth()
    if (month !== lastMonth) {
      labels.push({ col, label: `${month + 1}월` })
      lastMonth = month
    } else {
      labels.push(null)
    }
  }
  return labels
}

// 색상: 출석 여부에 따른 셀 색상
const CELL_ATTENDED = '#c9a84c'   // LIB.gold
const CELL_ATTENDED_HOVER = '#f0d080' // LIB.goldLight
const CELL_EMPTY = '#e8d5b7'      // LIB.parchmentDark (미출석 — 밝은 배경 위에 자연스러운 대비)
const CELL_EMPTY_HOVER = '#d4bc96' // 약간 어두운 parchment (호버)
const CELL_FUTURE = 'transparent'

export default function AttendanceHeatmap({ attendedDates, startDate }) {
  const [hoveredCell, setHoveredCell] = useState(null)

  const attendedSet = new Set(attendedDates)
  const today = new Date().toISOString().split('T')[0]
  const monthLabels = buildMonthLabels(startDate)

  // 53주 × 7일 그리드 데이터 생성
  const grid = []
  for (let col = 0; col < 53; col++) {
    const week = []
    for (let row = 0; row < 7; row++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + col * 7 + row)
      const dateStr = d.toISOString().split('T')[0]
      week.push({
        date: dateStr,
        attended: attendedSet.has(dateStr),
        isFuture: dateStr > today,
        isToday: dateStr === today,
      })
    }
    grid.push(week)
  }

  const getCellColor = (cell, isHovered) => {
    if (cell.isFuture) return CELL_FUTURE
    if (cell.attended) return isHovered ? CELL_ATTENDED_HOVER : CELL_ATTENDED
    return isHovered ? CELL_EMPTY_HOVER : CELL_EMPTY
  }

  const formatTooltip = (cell) => {
    if (cell.isFuture) return ''
    const label = cell.attended ? '출석' : '미출석'
    return `${cell.date} (${label})`
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* 월 레이블 행 */}
      <div style={{ display: 'flex', paddingLeft: '24px', marginBottom: '4px' }}>
        {monthLabels.map((item, i) =>
          item ? (
            <div
              key={i}
              style={{
                width: '13px',
                marginRight: '2px',
                fontSize: '10px',
                color: LIB.inkLight,
                whiteSpace: 'nowrap',
                minWidth: '13px',
              }}
            >
              {item.label}
            </div>
          ) : (
            <div key={i} style={{ width: '13px', marginRight: '2px', minWidth: '13px' }} />
          )
        )}
      </div>

      {/* 그리드 본체 */}
      <div style={{ display: 'flex', gap: '0' }}>
        {/* 요일 레이블 열 */}
        <div style={{ display: 'flex', flexDirection: 'column', marginRight: '4px' }}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              style={{
                height: '11px',
                marginBottom: '2px',
                fontSize: '9px',
                color: LIB.inkLight,
                lineHeight: '11px',
                width: '16px',
                textAlign: 'right',
                // 짝수 요일만 표시 (월, 수, 금)
                visibility: i % 2 === 1 ? 'visible' : 'hidden',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 주(열) × 요일(행) */}
        {grid.map((week, col) => (
          <div
            key={col}
            style={{ display: 'flex', flexDirection: 'column', marginRight: '2px' }}
          >
            {week.map((cell, row) => {
              const cellKey = `${col}-${row}`
              const isHovered = hoveredCell === cellKey
              return (
                <div
                  key={row}
                  title={formatTooltip(cell)}
                  onMouseEnter={() => setHoveredCell(cellKey)}
                  onMouseLeave={() => setHoveredCell(null)}
                  style={{
                    width: '11px',
                    height: '11px',
                    borderRadius: '2px',
                    marginBottom: '2px',
                    backgroundColor: getCellColor(cell, isHovered),
                    // 오늘 셀에 테두리 강조
                    outline: cell.isToday ? `2px solid ${LIB.gold}` : 'none',
                    outlineOffset: '1px',
                    cursor: cell.isFuture ? 'default' : 'pointer',
                    transition: 'background-color 0.12s ease',
                    flexShrink: 0,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '8px',
          paddingLeft: '24px',
          fontSize: '10px',
          color: LIB.inkLight,
        }}
      >
        <span>미출석</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[0.2, 0.5, 0.75, 1].map((opacity, i) => (
            <div
              key={i}
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '2px',
                backgroundColor: i === 0 ? CELL_EMPTY : CELL_ATTENDED,
                opacity: i === 0 ? 1 : opacity,
              }}
            />
          ))}
        </div>
        <span>출석</span>
      </div>
    </div>
  )
}
