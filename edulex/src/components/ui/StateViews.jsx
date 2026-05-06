import { BookOpen, FolderOpen, Loader2 } from 'lucide-react'

export function LoadingState({ message = '불러오는 중...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400 text-sm">
      <Loader2 size={24} strokeWidth={1.8} className="animate-spin" />
      {message}
    </div>
  )
}

export function EmptyState({ icon, message, sub }) {
  const DefaultIcon = icon === 'folder' ? FolderOpen : BookOpen
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
      {icon && typeof icon === 'string'
        ? null
        : icon
          ? <div className="mb-3 opacity-40">{icon}</div>
          : <DefaultIcon size={48} strokeWidth={1} className="mb-3 opacity-30" />
      }
      <p className="text-sm">{message}</p>
      {sub && <p className="text-xs mt-1 text-gray-300">{sub}</p>}
    </div>
  )
}
