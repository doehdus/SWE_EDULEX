import { useRef, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

export default function PdfUploadBar({ onComplete, wordbookCount }) {
  const { user } = useAuth()
  const inputRef = useRef()
  const [status, setStatus] = useState('idle') // idle | uploading | processing | done | error
  const [errorMsg, setErrorMsg] = useState('')

  const isDisabled = wordbookCount >= 2

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setErrorMsg('PDF 파일만 업로드 가능합니다.')
      return
    }

    setStatus('uploading')
    setErrorMsg('')

    // 단어장 개수 서버 검증 (API 레벨 방어)
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

      // Supabase Edge Function 호출 (PDF 텍스트 추출 → OpenAI API → 단어장 저장)
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
      inputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <div
        onClick={() => !isDisabled && inputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer
          ${isDisabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
            : 'border-[#7c3aed] bg-purple-50 hover:bg-purple-100'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isDisabled}
        />

        {status === 'idle' && (
          <>
            <p className="text-2xl mb-1">📄</p>
            <p className="text-sm font-medium text-[#7c3aed]">
              {isDisabled ? '단어장 최대 2개 보유 중 (업로드 불가)' : 'PDF를 클릭하여 업로드'}
            </p>
            {!isDisabled && <p className="text-xs text-gray-400 mt-1">AI가 전공 핵심 단어를 자동 추출합니다</p>}
          </>
        )}

        {status === 'uploading' && (
          <div className="flex items-center justify-center gap-2 text-[#7c3aed]">
            <span className="animate-spin">⟳</span>
            <span className="text-sm">파일 업로드 중...</span>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex items-center justify-center gap-2 text-[#7c3aed]">
            <span className="animate-pulse text-xl">✨</span>
            <span className="text-sm">AI가 단어를 추출하고 있습니다...</span>
          </div>
        )}

        {status === 'done' && (
          <div className="text-green-600 text-sm font-medium">
            ✅ 단어장이 생성되었습니다!
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-500 text-sm">{errorMsg}</div>
        )}
      </div>

      {status === 'done' && (
        <button
          onClick={() => setStatus('idle')}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
        >
          다시 업로드
        </button>
      )}
    </div>
  )
}
