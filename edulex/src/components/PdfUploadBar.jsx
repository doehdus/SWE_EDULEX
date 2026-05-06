import { useRef, useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { LIB, BOOK_COLORS } from '../constants/theme'

// 이미 꽂혀있는 책 슬롯
function BookSlot({ index, filled, color }) {
  if (filled) {
    return (
      <div
        className="relative flex flex-col rounded-sm overflow-hidden"
        style={{
          width: 48,
          height: 80,
          background: `linear-gradient(180deg, ${color.cover} 0%, ${color.spine} 100%)`,
          boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.25), 2px 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        {/* 책 상단 하이라이트 */}
        <div className="h-1.5 w-full" style={{ background: color.accent, opacity: 0.6 }} />
        {/* 책 질감 줄 */}
        <div
          className="flex-1"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(255,255,255,0.07) 7px, rgba(255,255,255,0.07) 8px)',
          }}
        />
        {/* 책 번호 */}
        <div
          className="absolute bottom-2 left-0 right-0 flex justify-center"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 700 }}
        >
          {index + 1}
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-sm"
      style={{
        width: 48,
        height: 80,
        background: 'rgba(0,0,0,0.08)',
        border: '2px dashed rgba(0,0,0,0.12)',
      }}
    >
      <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: 10, fontWeight: 700 }}>{index + 1}</span>
    </div>
  )
}

export default function PdfUploadBar({ onComplete, wordbookCount }) {
  const { user } = useAuth()
  const inputRef = useRef()
  const [status, setStatus] = useState('idle') // idle | uploading | processing | done | error
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const isDisabled = wordbookCount >= 2

  const processFile = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setStatus('error')
      setErrorMsg('PDF 파일만 업로드 가능합니다.')
      return
    }

    setStatus('uploading')
    setErrorMsg('')

    const { count } = await supabase
      .from('user_wordbooks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count >= 2) {
      setStatus('error')
      setErrorMsg('단어장은 최대 2개까지만 생성할 수 있습니다.')
      return
    }

    const formData = new FormData()
    formData.append('pdf', file)
    formData.append('userId', user.id)

    try {
      setStatus('processing')
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-wordbook-from-pdf`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        }
      )

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || '단어장 생성에 실패했습니다.')
      }

      setStatus('done')
      onComplete?.()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleFileChange = (e) => processFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (isDisabled) return
    processFile(e.dataTransfer.files[0])
  }

  const handleDragOver = (e) => { e.preventDefault(); if (!isDisabled) setDragOver(true) }
  const handleDragLeave = () => setDragOver(false)

  const slotColors = [BOOK_COLORS[4], BOOK_COLORS[0]] // 빨강, 보라

  const isActive = status === 'uploading' || status === 'processing'

  return (
    <div
      className="w-full rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: dragOver
          ? `linear-gradient(135deg, ${LIB.parchmentDark} 0%, ${LIB.parchment} 100%)`
          : LIB.cream,
        border: `1.5px solid ${dragOver ? LIB.gold : LIB.shelfLine}`,
        boxShadow: dragOver ? `0 0 0 3px ${LIB.gold}33` : 'none',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* 서가 상단 선반 */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${LIB.wood}, ${LIB.woodLight})` }} />

      <div className="px-5 py-4 flex items-center gap-5">

        {/* 책 슬롯 2개 */}
        <div
          className="flex items-end gap-1.5 px-3 pt-2 pb-1 rounded-lg shrink-0 relative"
          style={{ background: 'rgba(0,0,0,0.05)' }}
        >
          {[0, 1].map(i => (
            <BookSlot
              key={i}
              index={i}
              filled={i < wordbookCount}
              color={slotColors[i]}
            />
          ))}
          {/* 선반 바닥 */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg"
            style={{ background: LIB.woodMid }}
          />
        </div>

        {/* 우측 텍스트 + 버튼 */}
        <div className="flex-1 min-w-0">
          {status === 'idle' && (
            <>
              <p className="text-xs font-bold mb-0.5" style={{ color: LIB.inkMid }}>
                {isDisabled ? '서가가 가득 찼습니다 (최대 2권)' : `서가 공간 ${2 - wordbookCount}칸 남음`}
              </p>
              <p className="text-[11px] mb-3" style={{ color: LIB.inkLight }}>
                {isDisabled ? '기존 단어장을 삭제하면 새로 추가할 수 있습니다.' : 'PDF를 업로드하면 AI가 핵심 단어를 추출해 서가에 꽂아드립니다.'}
              </p>
              {!isDisabled && (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                  style={{
                    background: `linear-gradient(135deg, ${LIB.wood} 0%, ${LIB.woodLight} 100%)`,
                    color: LIB.parchment,
                    boxShadow: '0 2px 8px rgba(92,58,30,0.3)',
                  }}
                >
                  <Plus size={13} strokeWidth={2.5} /> PDF 업로드
                </button>
              )}
            </>
          )}

          {isActive && (
            <div className="flex items-center gap-2" style={{ color: LIB.woodLight }}>
              <Loader2 size={16} strokeWidth={2} className="animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold" style={{ color: LIB.ink }}>
                  {status === 'uploading' ? '파일 업로드 중...' : 'AI가 단어를 추출하는 중...'}
                </p>
                <p className="text-[11px]" style={{ color: LIB.inkLight }}>
                  {status === 'processing' ? '잠시만 기다려주세요 (30초~1분 소요)' : ''}
                </p>
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} strokeWidth={2} style={{ color: '#16a34a' }} className="shrink-0" />
              <div>
                <p className="text-xs font-bold" style={{ color: '#16a34a' }}>서가에 꽂혔습니다!</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-[11px] underline mt-0.5"
                  style={{ color: LIB.inkLight }}
                >
                  다시 업로드
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-start gap-2">
              <AlertCircle size={16} strokeWidth={2} style={{ color: '#dc2626' }} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold" style={{ color: '#dc2626' }}>{errorMsg}</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-[11px] underline mt-0.5"
                  style={{ color: LIB.inkLight }}
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={isDisabled}
      />
    </div>
  )
}
