import { useRef, useState } from 'react'
import { supabase } from '../utils/supabase'
import * as pdfjsLib from 'pdfjs-dist'
import * as XLSX from 'xlsx'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

// 브라우저에서 PDF 텍스트 추출 (최대 20페이지, 15000자)
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const maxPages = Math.min(pdf.numPages, 20)
  let text = ''
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + '\n'
    if (text.length >= 15000) break
  }
  return text.slice(0, 15000)
}

// 단어 목록으로 Excel 파일 생성 후 다운로드
function downloadExcel(words) {
  const data = words.map(w => ({
    '영어 단어': w.english,
    '일반 뜻': w.general_meaning ?? '',
    '전공 뜻': w.major_meaning ?? '',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '단어 목록')
  XLSX.writeFile(wb, 'wordbook.xlsx')
}

// Excel 파일에서 단어 목록 파싱
async function readWordsFromExcel(file) {
  const arrayBuffer = await file.arrayBuffer()
  const wb = XLSX.read(arrayBuffer)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws)

  if (!rows.length || !('영어 단어' in rows[0]) || !('전공 뜻' in rows[0])) {
    throw new Error("올바른 형식이 아닙니다. '영어 단어', '일반 뜻', '전공 뜻' 컬럼이 필요합니다.")
  }

  return rows
    .map(row => ({
      english: row['영어 단어'],
      general_meaning: row['일반 뜻'] || '',
      major_meaning: row['전공 뜻'],
    }))
    .filter(w => w.english && w.major_meaning)
}

async function callEdge(endpoint, body) {
  const { data: { session } } = await supabase.auth.getSession()
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || '요청에 실패했습니다.')
  }
  return response.json()
}

export default function PdfUploadBar({ onComplete, wordbookCount }) {
  const pdfInputRef = useRef()
  const xlsInputRef = useRef()

  const [pdfStatus, setPdfStatus] = useState('idle') // idle | extracting | done | error
  const [pdfError, setPdfError] = useState('')
  const [extractedWords, setExtractedWords] = useState(null)

  const [xlsStatus, setXlsStatus] = useState('idle') // idle | generating | done | error
  const [xlsError, setXlsError] = useState('')
  const [xlsInfo, setXlsInfo] = useState('')

  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState('')

  const isXlsDisabled = wordbookCount >= 2

  // Button 1: PDF → 텍스트 추출(브라우저) → Edge(TF-IDF + Groq) → Excel 다운로드
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    pdfInputRef.current.value = ''

    if (file.type !== 'application/pdf') {
      setPdfStatus('error')
      setPdfError('PDF 파일만 업로드 가능합니다.')
      return
    }

    setPdfStatus('extracting')
    setPdfError('')

    try {
      const text = await extractTextFromPDF(file)
      if (!text.trim()) throw new Error('텍스트를 추출할 수 없습니다. 스캔(이미지) PDF는 지원되지 않습니다.')

      const data = await callEdge('extract-words-from-pdf', { text })
      setExtractedWords(data.words)
      setPdfStatus('done')
    } catch (err) {
      setPdfStatus('error')
      setPdfError(err.message)
    }
  }

  // Button 2: Excel 파싱(브라우저) → Edge(중복 제거 + Groq 예문 + DB 저장)
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    xlsInputRef.current.value = ''

    if (!title.trim()) {
      setTitleError('단어장 제목을 입력해주세요.')
      return
    }
    setTitleError('')
    setXlsStatus('generating')
    setXlsError('')
    setXlsInfo('')

    try {
      const words = await readWordsFromExcel(file)
      if (words.length === 0) throw new Error('단어를 찾을 수 없습니다. 파일 형식을 확인해주세요.')

      const result = await callEdge('create-wordbook-from-excel', { title: title.trim(), words })
      setXlsStatus('done')
      setTitle('')
      if (result.skipped_count > 0) {
        setXlsInfo(`${result.skipped_count}개의 중복 단어는 건너뛰었습니다.`)
      }
      onComplete?.()
    } catch (err) {
      setXlsStatus('error')
      setXlsError(err.message)
    }
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
      <input ref={xlsInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />

      {/* Button 1: PDF → Excel */}
      <div className="border-2 border-dashed border-[#7c3aed] rounded-xl p-4 bg-purple-50">
        <p className="text-xs font-bold text-[#7c3aed] mb-1">1단계 — 단어 추출</p>
        <p className="text-xs text-gray-400 mb-3">⚠ 스캔(이미지) PDF는 지원되지 않습니다. 텍스트 선택이 되는 PDF만 가능합니다.</p>

        {pdfStatus === 'idle' && (
          <button
            onClick={() => pdfInputRef.current?.click()}
            className="w-full py-2 text-xs font-medium bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition"
          >
            📄 PDF 업로드
          </button>
        )}

        {pdfStatus === 'extracting' && (
          <div className="text-center text-xs text-[#7c3aed] py-2">
            <span className="animate-pulse mr-1">✨</span> AI가 핵심 단어를 추출하고 있습니다...
          </div>
        )}

        {pdfStatus === 'done' && extractedWords && (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-green-600 font-medium">✅ {extractedWords.length}개 추출 완료</span>
            <div className="flex gap-2">
              <button
                onClick={() => downloadExcel(extractedWords)}
                className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
              >
                📥 Excel 다운로드
              </button>
              <button
                onClick={() => { setPdfStatus('idle'); setPdfError(''); setExtractedWords(null) }}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                다시 추출
              </button>
            </div>
          </div>
        )}

        {pdfStatus === 'error' && (
          <div>
            <div className="text-xs text-red-500 mb-2">{pdfError}</div>
            <button
              onClick={() => { setPdfStatus('idle'); setPdfError('') }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>

      {/* Button 2: Excel → 단어장 */}
      <div className={`border-2 border-dashed rounded-xl p-4 transition
        ${isXlsDisabled ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-indigo-400 bg-indigo-50'}`}
      >
        <p className="text-xs font-bold text-indigo-600 mb-1">2단계 — 예문 생성 및 단어장 저장</p>
        <p className="text-xs text-gray-400 mb-1">
          필수 컬럼: <span className="font-medium text-gray-500">'영어 단어'</span>, <span className="font-medium text-gray-500">'일반 뜻'</span>, <span className="font-medium text-gray-500">'전공 뜻'</span>
        </p>
        <p className="text-xs text-gray-400 mb-3">⚠ 단어장은 최대 2개까지 생성 가능합니다.</p>

        {!isXlsDisabled && xlsStatus === 'idle' && (
          <div className="mb-2">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="단어장 제목 입력 (예: 컴퓨터과학 핵심어)"
              maxLength={50}
              className={`w-full text-xs border rounded-lg px-3 py-2 outline-none bg-white mb-1
                ${titleError ? 'border-red-400' : 'border-gray-200 focus:border-indigo-400'}`}
            />
            {titleError && <p className="text-xs text-red-500">{titleError}</p>}
          </div>
        )}

        {xlsStatus === 'idle' && (
          <button
            onClick={() => !isXlsDisabled && xlsInputRef.current?.click()}
            disabled={isXlsDisabled}
            className={`w-full py-2 text-xs font-medium rounded-lg transition
              ${isXlsDisabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {isXlsDisabled ? '단어장 최대 2개 보유 중 (생성 불가)' : '📊 Excel 업로드'}
          </button>
        )}

        {xlsStatus === 'generating' && (
          <div className="text-center text-xs text-indigo-600 py-2">
            <span className="animate-pulse mr-1">✨</span> AI가 예문을 생성하고 있습니다...
          </div>
        )}

        {xlsStatus === 'done' && (
          <div>
            <div className="text-xs text-green-600 font-medium mb-1">✅ 단어장이 생성되었습니다!</div>
            {xlsInfo && <div className="text-xs text-amber-500 mb-2">{xlsInfo}</div>}
            <button
              onClick={() => { setXlsStatus('idle'); setXlsError(''); setXlsInfo('') }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              다시 생성
            </button>
          </div>
        )}

        {xlsStatus === 'error' && (
          <div>
            <div className="text-xs text-red-500 mb-2">{xlsError}</div>
            <button
              onClick={() => { setXlsStatus('idle'); setXlsError('') }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
