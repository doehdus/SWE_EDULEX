import { useEffect, useState } from 'react'
import { RefreshCw, Database, HardDrive, Zap, Clock } from 'lucide-react'
import { useDbUsage } from '../hooks/useDbUsage'
import { BOOK_COLORS, COLOR } from '../constants/theme'

// ── 단위 변환 헬퍼 ────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes == null) return '—'
  if (bytes < 1024)            return `${bytes} B`
  if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3)       return `${(bytes / 1024 ** 2).toFixed(2)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

function formatNumber(n) {
  if (n == null) return '—'
  return n.toLocaleString('ko-KR')
}

// ── SVG 게이지 차트 (반원형) ──────────────────────────────────────

// ratio: 0~1, color: hex
function GaugeChart({ ratio, label, color = BOOK_COLORS[0].spine, size = 160 }) {
  const safeRatio = Math.min(Math.max(ratio ?? 0, 0), 1)
  const r  = size * 0.38
  const cx = size / 2
  const cy = size * 0.58
  // 반원: -180deg(왼쪽) → 0deg(오른쪽)
  const circumference = Math.PI * r  // 반원 둘레
  const offset = circumference * (1 - safeRatio)

  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      {/* 배경 반원 */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#e5e7eb" /* SVG attribute — Tailwind 미지원 영역 */
        strokeWidth={size * 0.08}
        strokeLinecap="round"
      />
      {/* 진행 반원 */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.08}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* 퍼센트 텍스트 */}
      {/* SVG text fill — Tailwind 미지원 영역. gray-800(#1f2937), gray-500(#6b7280) 사용 */}
      <text x={cx} y={cy - size * 0.03} textAnchor="middle" fontSize={size * 0.16} fontWeight="bold" fill="#1f2937">
        {(safeRatio * 100).toFixed(1)}%
      </text>
      <text x={cx} y={cy + size * 0.08} textAnchor="middle" fontSize={size * 0.09} fill="#6b7280">
        {label}
      </text>
    </svg>
  )
}

// ── SVG 수평 바 차트 (테이블별 row 수) ───────────────────────────

// BOOK_COLORS spine 값 순서로 바 차트 색상 재사용
const BAR_COLORS = BOOK_COLORS.map(c => c.spine)

function HorizontalBarChart({ data, maxValue }) {
  // data: [{ label, value }]
  const max = maxValue > 0 ? maxValue : 1
  return (
    <div className="space-y-2.5">
      {data.map(({ label, value }, i) => {
        const pct = Math.min((value / max) * 100, 100)
        return (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-36 shrink-0 truncate">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full"
                style={{
                  width: `${pct}%`,
                  background: BAR_COLORS[i % BAR_COLORS.length],
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-16 text-right shrink-0">
              {formatNumber(value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── 요약 카드 ─────────────────────────────────────────────────────

function MetricCard({ icon: Icon, title, value, sub, color = BOOK_COLORS[0].spine }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + '18' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{title}</p>
        <p className="text-xl font-bold text-gray-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── DB 사용량 패널 (A05) ──────────────────────────────────────────

// Supabase 무료 플랜 한도 (참고용 기준값)
const FREE_PLAN_DB_BYTES    = 500 * 1024 * 1024  // 500 MB
const FREE_PLAN_STORAGE_BYTES = 1 * 1024 * 1024 * 1024  // 1 GB

export default function DbUsagePanel() {
  const { metrics, loading, error, fetchedAt, fetchMetrics } = useDbUsage()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { fetchMetrics() }, [fetchMetrics])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMetrics()
    setRefreshing(false)
  }

  // ── 파생 데이터 ─────────────────────────────────────────────────

  const dbSizeBytes  = metrics?.db?.size_bytes ?? 0
  const storageSizeBytes = metrics?.storage?.size_bytes ?? 0
  const edgeToday    = metrics?.edge_functions?.invocations_today ?? 0
  const edgeTotal    = metrics?.edge_functions?.invocations_total ?? 0
  const fileCount    = metrics?.storage?.file_count ?? 0

  const dbRatio      = dbSizeBytes / FREE_PLAN_DB_BYTES
  const storageRatio = storageSizeBytes / FREE_PLAN_STORAGE_BYTES

  const rowCounts = metrics?.db?.row_counts
    ? Object.entries(metrics.db.row_counts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
    : []

  const maxRowCount = rowCounts.length > 0 ? rowCounts[0].value : 0

  const lastUpdated = fetchedAt
    ? fetchedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  // ── 렌더 ────────────────────────────────────────────────────────

  return (
    <div className="flex-1 overflow-y-auto p-6">

      {/* 상단 헤더 바 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-800">DB 사용량 모니터링</h2>
          {lastUpdated && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Clock size={11} />
              마지막 갱신: {lastUpdated}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="flex items-center gap-1.5 text-xs text-violet-600 border border-violet-200 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={13} className={(loading || refreshing) ? 'animate-spin' : ''} />
          새로고침
        </button>
      </div>

      {/* 에러 상태 */}
      {error && !loading && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-red-600 mb-1">데이터를 불러오지 못했습니다</p>
          <p className="text-xs text-red-400">{error}</p>
          <p className="text-xs text-red-300 mt-1">resource-monitor Edge Function이 배포되어 있는지 확인하세요.</p>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-56 gap-3 text-gray-300">
          <RefreshCw size={28} className="animate-spin" />
          <span className="text-sm">지표를 불러오는 중...</span>
        </div>
      )}

      {/* 메트릭 데이터 */}
      {!loading && metrics && (
        <div className="space-y-6">

          {/* 요약 카드 3개 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={Database}
              title="DB 사용량"
              value={formatBytes(dbSizeBytes)}
              sub={`한도 ${formatBytes(FREE_PLAN_DB_BYTES)} 중`}
              color={BOOK_COLORS[0].spine}
            />
            <MetricCard
              icon={HardDrive}
              title="Storage 사용량"
              value={formatBytes(storageSizeBytes)}
              sub={`파일 ${formatNumber(fileCount)}개 · 한도 ${formatBytes(FREE_PLAN_STORAGE_BYTES)} 중`}
              color={BOOK_COLORS[1].spine}
            />
            <MetricCard
              icon={Zap}
              title="Edge Function 호출"
              value={formatNumber(edgeToday)}
              sub={`오늘 · 누적 ${formatNumber(edgeTotal)}회`}
              color={BOOK_COLORS[2].spine}
            />
          </div>

          {/* 게이지 차트 (DB / Storage 사용률) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center">
              <p className="text-sm font-semibold text-gray-700 mb-3">DB 사용률 (무료 플랜 기준)</p>
              <GaugeChart ratio={dbRatio} label="DB" color={BOOK_COLORS[0].spine} size={180} />
              <p className="text-xs text-gray-400 mt-2">
                {formatBytes(dbSizeBytes)} / {formatBytes(FREE_PLAN_DB_BYTES)}
              </p>
              {dbRatio >= 0.8 && (
                <p className="text-xs font-semibold text-red-500 mt-1">한도 80% 초과 — 플랜 업그레이드를 고려하세요</p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center">
              <p className="text-sm font-semibold text-gray-700 mb-3">Storage 사용률 (무료 플랜 기준)</p>
              <GaugeChart ratio={storageRatio} label="Storage" color={BOOK_COLORS[1].spine} size={180} />
              <p className="text-xs text-gray-400 mt-2">
                {formatBytes(storageSizeBytes)} / {formatBytes(FREE_PLAN_STORAGE_BYTES)}
              </p>
              {storageRatio >= 0.8 && (
                <p className="text-xs font-semibold text-red-500 mt-1">한도 80% 초과 — 스토리지 정리가 필요합니다</p>
              )}
            </div>
          </div>

          {/* 테이블별 Row 수 바 차트 */}
          {rowCounts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">테이블별 Row 수</p>
              <HorizontalBarChart data={rowCounts} maxValue={maxRowCount} />
              <p className="text-xs text-gray-300 mt-4 text-right">
                총 {rowCounts.length}개 테이블 · 전체 {formatNumber(rowCounts.reduce((s, d) => s + d.value, 0))} rows
              </p>
            </div>
          )}

        </div>
      )}

      {/* 데이터 없음 (에러 아닌 경우) */}
      {!loading && !metrics && !error && (
        <div className="flex flex-col items-center justify-center h-56 gap-2 text-gray-300">
          <Database size={36} />
          <p className="text-sm">데이터가 없습니다. 새로고침을 눌러보세요.</p>
        </div>
      )}
    </div>
  )
}
