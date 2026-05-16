// ── 공통 모달 컴포넌트 ────────────────────────────────────────────

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmModal({ title, description, warning, onConfirm, onCancel, confirmLabel = '삭제', confirmClass = 'bg-red-500 hover:bg-red-600' }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-500 mb-1">{description}</p>}
        {warning && <p className="text-xs text-red-400 mb-5">{warning}</p>}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-sm text-white rounded-xl transition ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
