import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Modal, ConfirmModal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/StateViews'
import { MAJORS } from '../constants/theme'

// ── 상수 ──────────────────────────────────────────────────────────

const EMPTY_WORD = { english: '', general_meaning: '', major_meaning: '', general_example: '', major_example: '' }

const NAV_SECTIONS = [
  {
    section: '단어장',
    items: [{ id: 'wordbook',    label: '공식 단어장 관리',  icon: '📚', badge: 'A01' }],
  },
  {
    section: '사용자',
    items: [
      { id: 'users',       label: '유저 목록 조회',   icon: '👥', badge: 'A02' },
      { id: 'user-detail', label: '유저 상세 정보',   icon: '🪪', badge: 'A03' },
    ],
  },
  {
    section: '커뮤니티',
    items: [{ id: 'qna',      label: 'Q&A 게시판 답변',    icon: '💬', badge: 'A04' }],
  },
  {
    section: '모니터링',
    items: [
      { id: 'db-usage', label: 'DB 사용량',         icon: '🗄️', badge: 'A05' },
      { id: 'stats',    label: '전공별 사용자 현황', icon: '📊', badge: 'A06' },
    ],
  },
]

const WORD_FIELDS = [
  { key: 'english',         label: '영어 단어',        required: true,  placeholder: 'e.g. Algorithm' },
  { key: 'general_meaning', label: '일반 뜻 (선택)',   required: false, placeholder: 'e.g. 알고리즘' },
  { key: 'major_meaning',   label: '전공 뜻',          required: true,  placeholder: '전공 맥락에서의 의미' },
  { key: 'general_example', label: '일반 예문 (선택)', required: false, placeholder: '일반 예문' },
  { key: 'major_example',   label: '전공 예문',        required: true,  placeholder: '전공 예문' },
]

// ── 단어 폼 ───────────────────────────────────────────────────────

function WordForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ?? EMPTY_WORD)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-3">
      {WORD_FIELDS.map(({ key, label, required, placeholder }) => (
        <div key={key}>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            {label}{required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          <input
            value={form[key]}
            onChange={e => set(key, e.target.value)}
            required={required}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">취소</button>
        <button type="submit" className="flex-1 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700">저장</button>
      </div>
    </form>
  )
}

// ── 단어장 폼 (추가/수정 통합) ────────────────────────────────────

function WordbookFormModal({ title, form, onChangeTitle, onChangeMajor, onSubmit, onClose, submitLabel = '저장' }) {
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">단어장 제목 *</label>
          <input
            value={form.title}
            onChange={e => onChangeTitle(e.target.value)}
            required
            placeholder="e.g. 컴퓨터과학 심화 어휘"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">전공 *</label>
          <select
            value={form.major}
            onChange={e => onChangeMajor(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            {MAJORS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">취소</button>
          <button type="submit" className="flex-1 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700">{submitLabel}</button>
        </div>
      </form>
    </Modal>
  )
}

// ── 준비 중 플레이스홀더 ──────────────────────────────────────────

function ComingSoon({ icon, title, badge, description }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12">
      <span className="text-6xl">{icon}</span>
      <div>
        <span className="inline-block bg-violet-100 text-violet-600 text-xs font-bold px-2.5 py-1 rounded-full mb-2">{badge}</span>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
      <div className="mt-2 px-6 py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium">구현 예정</div>
    </div>
  )
}

// ── 공식 단어장 관리 패널 (A01) ───────────────────────────────────

function WordbookPanel() {
  const [activeMajor, setActiveMajor] = useState(null)
  const [wordbooks, setWordbooks]     = useState([])
  const [activeWb, setActiveWb]       = useState(null)
  const [words, setWords]             = useState([])
  const [wbCounts, setWbCounts]       = useState({})
  const [modal, setModal]             = useState(null) // 'addWb' | 'editWb' | 'deleteWb' | 'addWord' | 'editWord' | 'deleteWord'
  const [modalTarget, setModalTarget] = useState(null)
  const [wbForm, setWbForm]           = useState({ title: '', major: '' })

  useEffect(() => { fetchWbCounts() }, [])

  // ── 데이터 패치 ─────────────────────────────────────────────────

  const fetchWbCounts = async () => {
    const { data } = await supabase.from('official_wordbooks').select('major')
    const counts = Object.fromEntries(MAJORS.map(m => [m, 0]))
    data?.forEach(({ major }) => { if (counts[major] !== undefined) counts[major]++ })
    setWbCounts(counts)
  }

  const fetchWordbooks = async (major) => {
    const { data } = await supabase.from('official_wordbooks').select('*')
      .eq('major', major).order('created_at', { ascending: false })
    setWordbooks(data ?? [])
    setActiveWb(null)
    setWords([])
  }

  const fetchWords = async (wordbookId) => {
    const { data } = await supabase.from('official_words').select('*')
      .eq('wordbook_id', wordbookId).order('created_at', { ascending: true })
    setWords(data ?? [])
  }

  // ── 단어장 CRUD ─────────────────────────────────────────────────

  const selectMajor = (major) => { setActiveMajor(major); fetchWordbooks(major) }

  const openAddWb  = ()   => { setWbForm({ title: '', major: activeMajor }); setModalTarget(null); setModal('addWb') }
  const openEditWb = (wb) => { setWbForm({ title: wb.title, major: wb.major }); setModalTarget(wb); setModal('editWb') }

  const submitWb = async (e) => {
    e.preventDefault()
    if (modal === 'addWb') {
      await supabase.from('official_wordbooks').insert(wbForm)
    } else {
      await supabase.from('official_wordbooks').update(wbForm).eq('id', modalTarget.id)
      if (activeWb?.id === modalTarget.id) setActiveWb(prev => ({ ...prev, ...wbForm }))
    }
    setModal(null)
    fetchWordbooks(activeMajor)
    fetchWbCounts()
  }

  const deleteWb = async () => {
    await supabase.from('official_wordbooks').delete().eq('id', modalTarget.id)
    if (activeWb?.id === modalTarget.id) { setActiveWb(null); setWords([]) }
    setModal(null)
    fetchWordbooks(activeMajor)
    fetchWbCounts()
  }

  // ── 단어 CRUD ───────────────────────────────────────────────────

  const openAddWord  = ()     => { setModalTarget(null); setModal('addWord') }
  const openEditWord = (word) => { setModalTarget(word); setModal('editWord') }

  const saveWord = async (form) => {
    if (modal === 'addWord') {
      await supabase.from('official_words').insert({ ...form, wordbook_id: activeWb.id })
    } else {
      await supabase.from('official_words').update(form).eq('id', modalTarget.id)
    }
    setModal(null)
    fetchWords(activeWb.id)
  }

  const deleteWord = async () => {
    await supabase.from('official_words').delete().eq('id', modalTarget.id)
    setModal(null)
    fetchWords(activeWb.id)
  }

  const setWbField = (key) => (val) => setWbForm(f => ({ ...f, [key]: val }))

  return (
    <div className="flex flex-1 min-h-0">

      {/* 전공 카테고리 */}
      <nav className="w-48 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">전공</p>
        </div>
        <ul className="flex-1 overflow-y-auto py-2">
          {MAJORS.map(major => (
            <li key={major}>
              <button
                onClick={() => selectMajor(major)}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition
                  ${activeMajor === major
                    ? 'bg-violet-50 text-violet-700 font-semibold border-r-2 border-violet-600'
                    : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>{major}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                  ${activeMajor === major ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-400'}`}>
                  {wbCounts[major] ?? 0}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 단어장 목록 */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {!activeMajor ? (
          <EmptyState message="전공을 선택하세요" />
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">{activeMajor}</p>
              <button onClick={openAddWb} className="text-xs bg-violet-600 text-white px-2.5 py-1 rounded-lg hover:bg-violet-700 transition">
                + 추가
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto py-2">
              {wordbooks.length === 0 ? (
                <li className="px-4 py-6 text-center text-gray-300 text-xs">단어장이 없습니다</li>
              ) : wordbooks.map(wb => (
                <li key={wb.id}>
                  <div
                    onClick={() => { setActiveWb(wb); fetchWords(wb.id) }}
                    className={`px-4 py-3 cursor-pointer flex items-start justify-between group transition
                      ${activeWb?.id === wb.id ? 'bg-violet-50 border-r-2 border-violet-600' : 'hover:bg-gray-50'}`}
                  >
                    <p className={`text-sm font-medium truncate ${activeWb?.id === wb.id ? 'text-violet-700' : 'text-gray-700'}`}>
                      {wb.title}
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEditWb(wb)} className="text-xs text-violet-500 hover:text-violet-700 px-1" title="수정">✎</button>
                      <button onClick={() => { setModalTarget(wb); setModal('deleteWb') }} className="text-xs text-red-400 hover:text-red-600 px-1" title="삭제">✕</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>

      {/* 단어 목록 */}
      <main className="flex-1 overflow-y-auto p-6">
        {!activeWb ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <EmptyState icon="📖" message={activeMajor ? '단어장을 선택하세요' : '전공 카테고리를 먼저 선택하세요'} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeWb.title}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{activeWb.major} · 단어 {words.length}개</p>
              </div>
              <button onClick={openAddWord} className="bg-violet-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-violet-700 transition">
                + 단어 추가
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-32">영어</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-28">일반 뜻</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">전공 뜻</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">전공 예문</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 w-20">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {words.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-300 text-sm">
                        단어가 없습니다. <strong>+ 단어 추가</strong> 버튼을 눌러 추가하세요.
                      </td>
                    </tr>
                  ) : words.map(word => (
                    <tr key={word.id} className="hover:bg-gray-50 group">
                      <td className="px-4 py-3 font-semibold text-violet-600">{word.english}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{word.general_meaning || '—'}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs">{word.major_meaning}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-xs"><span className="line-clamp-2">{word.major_example}</span></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => openEditWord(word)} className="text-xs text-violet-500 hover:text-violet-700 font-medium">수정</button>
                          <button onClick={() => { setModalTarget(word); setModal('deleteWord') }} className="text-xs text-red-400 hover:text-red-600 font-medium">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* ── 모달 ── */}

      {(modal === 'addWb' || modal === 'editWb') && (
        <WordbookFormModal
          title={modal === 'addWb' ? '단어장 추가' : '단어장 수정'}
          form={wbForm}
          onChangeTitle={setWbField('title')}
          onChangeMajor={setWbField('major')}
          onSubmit={submitWb}
          onClose={() => setModal(null)}
          submitLabel={modal === 'addWb' ? '저장' : '수정 완료'}
        />
      )}

      {modal === 'deleteWb' && (
        <ConfirmModal
          title="단어장 삭제"
          description={<><strong className="text-gray-900">"{modalTarget?.title}"</strong> 단어장을 삭제하시겠습니까?</>}
          warning="단어장 안의 모든 단어도 함께 삭제됩니다."
          onConfirm={deleteWb}
          onCancel={() => setModal(null)}
        />
      )}

      {modal === 'addWord' && (
        <Modal title="단어 추가" onClose={() => setModal(null)}>
          <WordForm onSave={saveWord} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal === 'editWord' && (
        <Modal title="단어 수정" onClose={() => setModal(null)}>
          <WordForm initial={modalTarget} onSave={saveWord} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal === 'deleteWord' && (
        <ConfirmModal
          title="단어 삭제"
          description={<><strong className="text-gray-900">"{modalTarget?.english}"</strong> 단어를 삭제하시겠습니까?</>}
          onConfirm={deleteWord}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  )
}

// ── 유저 목록 조회 패널 (A02) ─────────────────────────────────────

function UsersPanel() {
  const [users, setUsers]             = useState([])
  const [search, setSearch]           = useState('')
  const [majorFilter, setMajorFilter] = useState('')
  const [loading, setLoading]         = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchUsers = async (s, m) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_users_for_admin', {
      p_search: s,
      p_major: m,
    })
    if (error) { console.error(error); setLoading(false); return }
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers(search, majorFilter) }, [search, majorFilter])

  const handleSearchChange = (e) => { setSearch(e.target.value) }
  const handleMajorChange  = (e) => { setMajorFilter(e.target.value) }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.functions.invoke('delete-user', {
      body: { userId: deleteTarget.id },
    })
    if (error) { console.error(error) }
    setDeleteTarget(null)
    fetchUsers(search, majorFilter)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* 검색 필터 영역 */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="닉네임 또는 이메일 검색"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <select
          value={majorFilter}
          onChange={handleMajorChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="">전체 전공</option>
          {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* 유저 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">닉네임</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">이메일</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">전공</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-16">레벨</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-20">북마크</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-28">가입일</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 w-16">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-300 text-sm">불러오는 중...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-300 text-sm">검색 결과가 없습니다.</td>
              </tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 group">
                <td className="px-4 py-3 font-semibold text-gray-800">{u.nickname ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{Array.isArray(u.major) ? u.major.join(', ') : (u.major ?? '—')}</td>
                <td className="px-4 py-3 text-gray-700 text-center">{u.level ?? 0}</td>
                <td className="px-4 py-3 text-gray-700 text-center">{u.bookmark ?? 0}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('ko-KR') : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setDeleteTarget(u)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium opacity-0 group-hover:opacity-100 transition"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 총 유저 수 */}
      {!loading && (
        <p className="mt-3 text-xs text-gray-400 text-right">총 {users.length}명</p>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <ConfirmModal
          title="유저 삭제"
          description={<><strong className="text-gray-900">"{deleteTarget.nickname ?? deleteTarget.email}"</strong> 유저를 삭제하시겠습니까?</>}
          warning="삭제된 유저 데이터는 복구할 수 없습니다."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

// ── 파이차트 SVG 헬퍼 ─────────────────────────────────────────────

const MAJOR_COLORS = ['#7c3aed', '#0369a1', '#059669', '#b45309', '#be123c', '#0f766e']

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function buildSlicePath(cx, cy, r, startAngle, endAngle) {
  const start  = polarToCartesian(cx, cy, r, startAngle)
  const end    = polarToCartesian(cx, cy, r, endAngle)
  const large  = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`
}

// ── 전공별 사용자 현황 패널 (A06) ────────────────────────────────

function MajorStatsPanel() {
  const [distribution, setDistribution] = useState([])
  const [loading, setLoading]           = useState(false)

  useEffect(() => { fetchDistribution() }, [])

  const fetchDistribution = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_major_distribution')
    if (error) { console.error(error); setLoading(false); return }
    setDistribution(data ?? [])
    setLoading(false)
  }

  const total = distribution.reduce((sum, d) => sum + (d.user_count ?? 0), 0)

  // 파이차트 슬라이스 계산
  const cx = 160
  const cy = 160
  const r  = 120

  let currentAngle = 0
  const slices = distribution.map((d, i) => {
    const pct   = total > 0 ? (d.user_count / total) : 0
    const sweep = pct * 360
    const slice = { ...d, startAngle: currentAngle, endAngle: currentAngle + sweep, color: MAJOR_COLORS[i % MAJOR_COLORS.length], pct }
    currentAngle += sweep
    return slice
  })

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-300 text-sm">불러오는 중...</div>
      ) : distribution.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-300 text-sm">데이터가 없습니다.</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* 파이차트 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center shrink-0">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">전공별 분포</h2>
            <svg width={320} height={320} viewBox="0 0 320 320">
              {slices.map((s, i) => (
                s.pct > 0 && (
                  <path
                    key={s.major ?? i}
                    d={buildSlicePath(cx, cy, r, s.startAngle, s.endAngle)}
                    fill={s.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )
              ))}
              {/* 중앙 총계 */}
              <circle cx={cx} cy={cy} r={52} fill="#ffffff" />
              <text x={cx} y={cy - 8} textAnchor="middle" fontSize={12} fill="#6b7280">총 유저</text>
              <text x={cx} y={cy + 12} textAnchor="middle" fontSize={20} fontWeight="bold" fill="#111827">{total}</text>
              <text x={cx} y={cy + 28} textAnchor="middle" fontSize={11} fill="#9ca3af">명</text>
            </svg>
          </div>

          {/* 범례 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex-1">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">전공별 상세</h2>
            <div className="space-y-3">
              {slices.map((s, i) => (
                <div key={s.major ?? i} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-sm text-gray-700 w-24 shrink-0">{s.major}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${(s.pct * 100).toFixed(1)}%`, background: s.color }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right shrink-0">{s.user_count}명</span>
                  <span className="text-xs font-semibold w-12 text-right shrink-0" style={{ color: s.color }}>
                    {total > 0 ? (s.pct * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
              <span>전체 전공 수: {distribution.length}개</span>
              <span>총 유저: {total}명</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 관리자 페이지 레이아웃 ────────────────────────────────────────

export default function AdminWordbookPage() {
  const { signOut, profile } = useAuth()
  const navigate             = useNavigate()
  const [activeMenu, setActiveMenu] = useState('wordbook')

  const allItems = NAV_SECTIONS.flatMap(s => s.items)
  const activeItem = allItems.find(i => i.id === activeMenu)

  const renderContent = () => {
    switch (activeMenu) {
      case 'wordbook':    return <WordbookPanel />
      case 'users':       return <UsersPanel />
      case 'user-detail': return <ComingSoon icon="🪪" title="유저 상세 정보"     badge="A03" description="가입 정보(닉네임, 이메일 등) 상세 확인 및 관리." />
      case 'qna':         return <ComingSoon icon="💬" title="Q&A 게시판 답변"    badge="A04" description="사용자 문의에 답변을 작성하고 완료 상태를 관리합니다." />
      case 'db-usage':    return <ComingSoon icon="🗄️" title="DB 사용량 모니터링" badge="A05" description="Supabase DB 사용량 지표를 실시간으로 확인합니다." />
      case 'stats':       return <MajorStatsPanel />
      default:            return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">A</div>
          <div>
            <p className="font-bold text-gray-900 leading-none text-sm">EduLex 관리자</p>
            <p className="text-xs text-gray-400">{profile?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={async () => { await signOut(); navigate('/admin/login') }}
          className="text-sm text-gray-400 hover:text-gray-700 border border-gray-200 px-4 py-1.5 rounded-lg hover:border-gray-400 transition"
        >
          로그아웃
        </button>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* 사이드바 */}
        <nav className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto py-3">
            {NAV_SECTIONS.map(({ section, items }) => (
              <div key={section} className="mb-1">
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{section}</p>
                {items.map(({ id, label, icon, badge }) => (
                  <button
                    key={id}
                    onClick={() => setActiveMenu(id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition
                      ${activeMenu === id
                        ? 'bg-violet-50 text-violet-700 font-semibold border-r-2 border-violet-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <span className="text-base">{icon}</span>
                    <span className="flex-1 text-left leading-tight">{label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded
                      ${activeMenu === id ? 'bg-violet-100 text-violet-500' : 'bg-gray-100 text-gray-400'}`}>
                      {badge}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-300 text-center">EduLex Admin v1.0</p>
          </div>
        </nav>

        {/* 콘텐츠 영역 */}
        <div className="flex flex-1 min-h-0 flex-col">
          {/* 페이지 제목 바 */}
          {activeItem && (
            <div className="bg-white border-b border-gray-100 px-6 py-3 shrink-0 flex items-center gap-2">
              <span className="text-lg">{activeItem.icon}</span>
              <h1 className="font-bold text-gray-800">{activeItem.label}</h1>
              <span className="ml-1 text-xs bg-violet-100 text-violet-600 font-bold px-2 py-0.5 rounded-full">{activeItem.badge}</span>
            </div>
          )}

          <div className="flex flex-1 min-h-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
