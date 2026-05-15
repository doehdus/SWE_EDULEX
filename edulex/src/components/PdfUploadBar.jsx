import { useRef, useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle, Trash2, X, Sparkles, FileText, Upload } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { useMajor } from '../context/MajorContext'
import { LIB } from '../constants/theme'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  const maxPages = Math.min(pdf.numPages, 30)
  const pageTexts = []
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pageTexts.push(content.items.map(item => item.str).join(' '))
  }
  return pageTexts.join('\n').slice(0, 20000)
}

export default function PdfUploadBar({ onComplete, wordbookCount }) {
  const { user } = useAuth()
  const { selectedMajors } = useMajor()
  const inputRef = useRef()
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [extractedWords, setExtractedWords] = useState([])

  const isDisabled = wordbookCount >= 2

  const processFile = async (file) => {
    if (!file || file.type !== 'application/pdf') { setStatus('error'); setErrorMsg('PDF 파일만 업로드 가능합니다.'); return }
    setStatus('processing')
    try {
      const text = await extractTextFromPDF(file)
      if (text.trim().length < 50) throw new Error('PDF에서 텍스트를 읽을 수 없습니다.')
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-wordbook-from-pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, majors: selectedMajors }),
      })
      if (!response.ok) { const err = await response.json(); throw new Error(err.message) }
      const data = await response.json()
      setExtractedWords(data.words.map(w => ({ ...w, _excluded: false })))
      setStatus('reviewing')
    } catch (err) { setStatus('error'); setErrorMsg(err.message) }
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
      style={{ background: dragOver ? LIB.parchmentDark : LIB.cream, border: `1.5px dashed ${isDisabled ? LIB.parchmentDark : LIB.shelfLine}` }}
      onClick={() => { if (!isDisabled && status === 'idle') inputRef.current?.click() }}
      onDrop={(e) => { e.preventDefault(); if (!isDisabled) processFile(e.dataTransfer.files[0]) }}
      onDragOver={(e) => { e.preventDefault(); if (!isDisabled) setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}>
      <div className="px-6 py-5 flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: LIB.parchment, color: LIB.wood }}>
          {status === 'processing' ? <Loader2 size={22} className="animate-spin" /> : status === 'error' ? <AlertCircle size={22} /> : status === 'done' ? <CheckCircle2 size={22} /> : isDisabled ? <FileText size={22} /> : <Upload size={22} />}
        </div>
        <div className="flex-1 min-w-0">
          {status === 'idle' && <>
            <p className="text-sm font-bold" style={{ color: isDisabled ? LIB.inkLight : LIB.ink }}>{isDisabled ? '서가가 가득 찼습니다' : 'PDF로 단어장 만들기'}</p>
            <p className="text-xs mt-0.5" style={{ color: LIB.inkLight }}>{isDisabled ? '기존 단어장을 삭제하면 새로 추가할 수 있습니다.' : `클릭하거나 PDF를 드래그하세요 · 서가 공간 ${2 - wordbookCount}칸 남음`}</p>
          </>}
          {status === 'processing' && <p className="text-sm font-bold" style={{ color: LIB.ink }}>AI가 단어를 분석하는 중...</p>}
          {status === 'error' && <>
            <p className="text-sm font-bold" style={{ color: '#dc2626' }}>{errorMsg}</p>
            <button onClick={e => { e.stopPropagation(); setStatus('idle') }} className="text-xs mt-0.5 underline" style={{ color: LIB.inkLight }}>다시 시도</button>
          </>}
          {status === 'done' && <p className="text-sm font-bold" style={{ color: '#16a34a' }}>단어장이 서가에 꽂혔습니다!</p>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={e => processFile(e.target.files[0])} disabled={isDisabled} />
    </div>
  )
}