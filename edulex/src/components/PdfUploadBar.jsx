import { useRef, useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle, Trash2, X, Sparkles, FileText, Upload } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { useMajor } from '../context/MajorContext'
import { LIB, BOOK_COLORS } from '../constants/theme'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href

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

async function callEdge(endpoint, body, token) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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

function WordReviewModal({ words, majors, onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState('')
  const [rows, setRows] = useState(words)
  const [newWord, setNewWord] = useState('')
  const [addingStatus, setAddingStatus] = useState('idle')
  const [addError, setAddError] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState(null)

  const toggleRow = (idx) =>
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, _excluded: !r._excluded } : r))

  const removeRow = (idx) =>
    setRows(prev => prev.filter((_, i) => i !== idx))

  const handleAddWord = async () => {
    const word = newWord.trim()
    if (!word) return
    if (rows.some(r => r.english.toLowerCase() === word.toLowerCase())) {
      setAddError('이미 목록에 있는 단어입니다.')
      return
    }
    setAddingStatus('loading')
    setAddError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const result = await callEdge('generate-word-info', { word, majors }, session.access_token)
      setRows(prev => [...prev, { ...result, _excluded: false }])
      setNewWord('')
      setAddingStatus('idle')
    } catch (err) {
      setAddingStatus('error')
      setAddError(err.message)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('단어장 제목을 입력해주세요.')
      return
    }
    setTitleError('')
    const included = rows.filter(r => !r._excluded)
    if (included.length === 0) {
      setTitleError('포함할 단어를 최소 1개 이상 선택해주세요.')
      return
    }
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await callEdge(
        'save-wordbook',
        {
          title: title.trim(),
          words: included.map(({ english, general_meaning, major_meaning, general_example, major_example }) => ({
            english, general_meaning, major_meaning, general_example, major_example,
          })),
        },
        session.access_token
      )
      onSave()
    } catch (err) {
      setTitleError(err.message)
      setSaving(false)
    }
  }

  const includedCount = rows.filter(r => !r._excluded).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(20,10,5,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: '88vh' }}>

        {/* 헤더 */}
        <div className="shrink-0 px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${LIB.parchmentDark}` }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: LIB.inkLight }}>단어장 만들기</p>
              <input
                value={title}
                onChange={e => { setTitle(e.target.value); setTitleError('') }}
                placeholder="단어장 제목을 입력하세요"
                maxLength={50}
                className="w-full text-lg font-bold bg-transparent outline-none placeholder:font-normal"
                style={{
                  color: LIB.ink,
                  borderBottom: `2px solid ${titleError ? '#ef4444' : title ? LIB.wood : LIB.shelfLine}`,
                  paddingBottom: 4,
                  transition: 'border-color 0.15s',
                }}
              />
              {titleError && <p className="text-xs text-red-500 mt-1">{titleError}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 mt-1 p-1.5 rounded-lg transition hover:bg-gray-100"
              style={{ color: LIB.inkLight }}
            >
              <X size={16} />
            </button>
          </div>

          {/* 선택 카운터 */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs" style={{ color: LIB.inkLight }}>
              전체 <strong style={{ color: LIB.ink }}>{rows.length}</strong>개 중
              <strong style={{ color: LIB.wood }}> {includedCount}개</strong> 선택됨
            </span>
            {rows.length > 0 && (
              <>
                <span style={{ color: LIB.shelfLine }}>·</span>
                <button
                  onClick={() => setRows(prev => prev.map(r => ({ ...r, _excluded: false })))}
                  className="text-xs transition hover:underline"
                  style={{ color: LIB.inkLight }}
                >
                  전체 선택
                </button>
                <span style={{ color: LIB.shelfLine }}>·</span>
                <button
                  onClick={() => setRows(prev => prev.map(r => ({ ...r, _excluded: true })))}
                  className="text-xs transition hover:underline"
                  style={{ color: LIB.inkLight }}
                >
                  전체 해제
                </button>
              </>
            )}
          </div>
        </div>

        {/* 단어 목록 */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1.5" style={{ background: LIB.cream }}>
          {rows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <FileText size={28} style={{ color: LIB.shelfLine }} />
              <p className="text-sm" style={{ color: LIB.inkLight }}>단어를 추가해주세요.</p>
            </div>
          )}
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="rounded-xl transition-all"
              style={{
                background: row._excluded ? 'transparent' : 'white',
                border: `1px solid ${row._excluded ? LIB.parchmentDark : LIB.shelfLine}`,
                opacity: row._excluded ? 0.45 : 1,
              }}
            >
              {/* 메인 행 */}
              <div className="flex items-center gap-3 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={!row._excluded}
                  onChange={() => toggleRow(idx)}
                  className="shrink-0 w-4 h-4 rounded accent-violet-600 cursor-pointer"
                />
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                >
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-bold text-sm truncate" style={{ color: LIB.ink }}>{row.english}</span>
                    <span className="text-xs truncate" style={{ color: LIB.inkMid }}>{row.general_meaning}</span>
                    {row.major_meaning && row.major_meaning !== row.general_meaning && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: LIB.parchment, color: LIB.inkMid }}
                      >
                        {row.major_meaning}
                      </span>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                    className="text-[10px] px-2 py-1 rounded-lg transition"
                    style={{ color: LIB.inkLight, background: expandedIdx === idx ? LIB.parchment : 'transparent' }}
                  >
                    예문 {expandedIdx === idx ? '▲' : '▼'}
                  </button>
                  <button
                    onClick={() => removeRow(idx)}
                    className="p-1 rounded-lg transition hover:bg-red-50"
                    style={{ color: LIB.shelfLine }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = LIB.shelfLine}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* 예문 펼치기 */}
              {expandedIdx === idx && (
                <div
                  className="px-4 pb-3 pt-1 space-y-2 text-xs"
                  style={{ borderTop: `1px solid ${LIB.parchmentDark}` }}
                >
                  {row.general_example && (
                    <div>
                      <span className="font-semibold" style={{ color: LIB.inkLight }}>일반  </span>
                      <span className="italic" style={{ color: LIB.inkMid }}>{row.general_example}</span>
                    </div>
                  )}
                  {row.major_example && (
                    <div>
                      <span className="font-semibold" style={{ color: LIB.inkLight }}>전공  </span>
                      <span className="italic" style={{ color: LIB.inkMid }}>{row.major_example}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 단어 직접 추가 */}
        <div className="shrink-0 px-6 py-3" style={{ borderTop: `1px solid ${LIB.parchmentDark}` }}>
          <div className="flex gap-2">
            <input
              value={newWord}
              onChange={e => { setNewWord(e.target.value); setAddError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAddWord()}
              placeholder="단어 직접 추가 (예: algorithm)"
              disabled={addingStatus === 'loading'}
              className="flex-1 text-sm border rounded-xl px-3 py-2 outline-none transition disabled:bg-gray-50"
              style={{ borderColor: addError ? '#ef4444' : LIB.shelfLine }}
              onFocus={e => { if (!addError) e.currentTarget.style.borderColor = LIB.wood }}
              onBlur={e => { if (!addError) e.currentTarget.style.borderColor = LIB.shelfLine }}
            />
            <button
              onClick={handleAddWord}
              disabled={addingStatus === 'loading' || !newWord.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: LIB.wood, color: LIB.parchment }}
            >
              {addingStatus === 'loading'
                ? <><Loader2 size={12} className="animate-spin" /> 생성 중</>
                : <><Sparkles size={12} /> AI 추가</>
              }
            </button>
          </div>
          {addError && <p className="text-xs text-red-500 mt-1.5">{addError}</p>}
        </div>

        {/* 저장 버튼 */}
        <div className="shrink-0 px-6 py-4" style={{ borderTop: `1px solid ${LIB.parchmentDark}` }}>
          <button
            onClick={handleSave}
            disabled={saving || includedCount === 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${LIB.wood} 0%, ${LIB.woodLight} 100%)`, color: LIB.parchment }}
          >
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> 저장 중...</>
              : `단어장 저장  (${includedCount}개)`
            }
          </button>
        </div>
      </div>
    </div>
  )
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
    if (!file) return
    if (file.type !== 'application/pdf') {
      setStatus('error')
      setErrorMsg('PDF 파일만 업로드 가능합니다.')
      return
    }
    setStatus('processing')
    setErrorMsg('')
    try {
      const text = await extractTextFromPDF(file)
      if (text.trim().length < 50) {
        throw new Error('PDF에서 텍스트를 읽을 수 없습니다. 텍스트가 선택되는 PDF만 지원됩니다.')
      }
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-wordbook-from-pdf`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, majors: selectedMajors }),
        }
      )
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || '단어 추출에 실패했습니다.')
      }
      const data = await response.json()
      setExtractedWords(data.words.map(w => ({ ...w, _excluded: false })))
      setStatus('reviewing')
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
  const handleSaved = () => {
    setStatus('done')
    setExtractedWords([])
    onComplete?.()
  }

  return (
    <>
      <div
        className="w-full rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
        style={{
          background: dragOver ? LIB.parchmentDark : LIB.cream,
          border: `1.5px dashed ${dragOver ? LIB.wood : isDisabled ? LIB.parchmentDark : LIB.shelfLine}`,
          boxShadow: dragOver ? `0 0 0 3px ${LIB.gold}44` : 'none',
        }}
        onClick={() => { if (!isDisabled && status === 'idle') inputRef.current?.click() }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="px-6 py-5 flex items-center gap-4">

          {/* 아이콘 영역 */}
          <div
            className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: status === 'error'
                ? '#fee2e2'
                : status === 'done'
                  ? '#dcfce7'
                  : LIB.parchment,
              color: status === 'error'
                ? '#dc2626'
                : status === 'done'
                  ? '#16a34a'
                  : LIB.wood,
            }}
          >
            {status === 'processing' && <Loader2 size={22} className="animate-spin" strokeWidth={2} />}
            {status === 'error' && <AlertCircle size={22} strokeWidth={2} />}
            {status === 'done' && <CheckCircle2 size={22} strokeWidth={2} />}
            {(status === 'idle' || status === 'reviewing') && (
              isDisabled ? <FileText size={22} strokeWidth={2} /> : <Upload size={22} strokeWidth={2} />
            )}
          </div>

          {/* 텍스트 영역 */}
          <div className="flex-1 min-w-0">
            {status === 'idle' && (
              <>
                <p className="text-sm font-bold" style={{ color: isDisabled ? LIB.inkLight : LIB.ink }}>
                  {isDisabled ? '서가가 가득 찼습니다' : 'PDF로 단어장 만들기'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: LIB.inkLight }}>
                  {isDisabled
                    ? '기존 단어장을 삭제하면 새로 추가할 수 있습니다.'
                    : `클릭하거나 PDF를 드래그하세요 · 서가 공간 ${2 - wordbookCount}칸 남음`}
                </p>
              </>
            )}
            {status === 'processing' && (
              <>
                <p className="text-sm font-bold" style={{ color: LIB.ink }}>AI가 단어를 분석하는 중...</p>
                <p className="text-xs mt-0.5" style={{ color: LIB.inkLight }}>30초~1분 정도 소요됩니다</p>
              </>
            )}
            {status === 'reviewing' && (
              <>
                <p className="text-sm font-bold" style={{ color: LIB.ink }}>
                  단어 {extractedWords.length}개 추출 완료
                </p>
                <p className="text-xs mt-0.5" style={{ color: LIB.inkLight }}>검토 후 저장하세요</p>
              </>
            )}
            {status === 'done' && (
              <>
                <p className="text-sm font-bold" style={{ color: '#16a34a' }}>단어장이 서가에 꽂혔습니다!</p>
                <button
                  onClick={e => { e.stopPropagation(); setStatus('idle') }}
                  className="text-xs mt-0.5 underline"
                  style={{ color: LIB.inkLight }}
                >
                  다시 업로드
                </button>
              </>
            )}
            {status === 'error' && (
              <>
                <p className="text-sm font-bold" style={{ color: '#dc2626' }}>{errorMsg}</p>
                <button
                  onClick={e => { e.stopPropagation(); setStatus('idle') }}
                  className="text-xs mt-0.5 underline"
                  style={{ color: LIB.inkLight }}
                >
                  다시 시도
                </button>
              </>
            )}
          </div>

          {/* 우측 액션 */}
          {status === 'reviewing' && (
            <button
              onClick={e => { e.stopPropagation(); setStatus('reviewing') }}
              className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition hover:opacity-80"
              style={{ background: LIB.wood, color: LIB.parchment }}
            >
              검토하기
            </button>
          )}
          {status === 'idle' && !isDisabled && (
            <div
              className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold pointer-events-none"
              style={{ background: LIB.parchment, color: LIB.inkMid, border: `1px solid ${LIB.shelfLine}` }}
            >
              PDF
            </div>
          )}
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

      {status === 'reviewing' && (
        <WordReviewModal
          words={extractedWords}
          majors={selectedMajors}
          onSave={handleSaved}
          onClose={() => setStatus('idle')}
        />
      )}
    </>
  )
}
