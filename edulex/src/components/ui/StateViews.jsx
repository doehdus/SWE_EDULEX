// ── 로딩 / 빈 상태 공통 컴포넌트 ─────────────────────────────────

export function LoadingState({ message = '불러오는 중...' }) {
  return (
    <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
      {message}
    </div>
  )
}

export function EmptyState({ icon, message, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
      {icon && <p className="text-5xl mb-3">{icon}</p>}
      <p className="text-sm">{message}</p>
      {sub && <p className="text-xs mt-1 text-gray-300">{sub}</p>}
    </div>
  )
}
