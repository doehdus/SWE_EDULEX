import { useState } from 'react'
import { Bookmark, ShoppingBag, GraduationCap, Check } from 'lucide-react'
import { useMajor } from '../context/MajorContext'
import { useAuth } from '../context/AuthContext'
import { useStarDust } from '../hooks/useStarDust'
import { supabase } from '../utils/supabase'
import { LIB } from '../constants/theme'

const MAJORS = ['컴퓨터과학', '경영학', '역사학', '의학', '법학', '심리학']

const TITLES = [
  '단어 사냥꾼',
  '어휘의 주인',
  '암기 대장',
  '언어 술사',
  '지식 창고',
  '단어 수집가',
  '어원 탐험가',
  '언어의 고수',
  '불멸의 노력파',
]

export default function CharacterPreview() {
  const { profile } = useAuth()
  const { selectedMajors, updateMajors } = useMajor()
  const starDust = useStarDust()
  const [showMajorModal, setShowMajorModal] = useState(false)
  const [showTitleModal, setShowTitleModal] = useState(false)
  const [tempMajors, setTempMajors] = useState([])

  const openMajorModal = () => {
    setTempMajors([...selectedMajors])
    setShowMajorModal(true)
  }

  const toggleMajor = (major) => {
    if (tempMajors.includes(major)) {
      setTempMajors(tempMajors.filter(m => m !== major))
    } else if (tempMajors.length < 2) {
      setTempMajors([...tempMajors, major])
    }
  }

  const saveMajors = async () => {
    await updateMajors(tempMajors)
    setShowMajorModal(false)
  }

  const saveTitle = async (title) => {
    await supabase.from('users').update({ active_title: title }).eq('id', profile.id)
    profile.active_title = title
    setShowTitleModal(false)
  }

  return (
    <>
      {/* 책 표지 형태의 캐릭터 카드 */}
      <div
        className="rounded-2xl flex flex-col h-full overflow-hidden relative"
        style={{
          background: `linear-gradient(160deg, ${LIB.wood} 0%, ${LIB.woodLight} 60%, ${LIB.woodMid} 100%)`,
          boxShadow: '4px 4px 20px rgba(92,58,30,0.4), inset -4px 0 12px rgba(0,0,0,0.25)',
        }}
      >
        {/* 책 질감 세로선 */}
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 48px, rgba(255,255,255,0.08) 48px, rgba(255,255,255,0.08) 50px)' }}
        />

        {/* 책등 왼쪽 라인 */}
        <div className="absolute left-0 top-0 bottom-0 w-5 rounded-l-2xl"
          style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }}
        />

        {/* 상단: LV + 칭호 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 relative">
          <span
            className="text-xs font-extrabold px-3 py-1 rounded-full"
            style={{ background: LIB.gold, color: LIB.ink }}
          >
            LV. {profile?.level ?? 1}
          </span>
          <button
            onClick={() => setShowTitleModal(true)}
            className="text-xs font-semibold px-3 py-1 rounded-full border transition hover:opacity-70"
            style={{ color: LIB.parchment, borderColor: 'rgba(245,237,224,0.35)', background: 'rgba(245,237,224,0.12)' }}
          >
            {profile?.active_title ?? '칭호 없음'}
          </button>
        </div>

        {/* 중앙: 캐릭터 */}
        <div
          className="flex-1 flex items-center justify-center my-3 mx-5 rounded-xl relative"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          {/* 장식 테두리 */}
          <div
            className="absolute inset-2 rounded-xl pointer-events-none"
            style={{ border: `1px solid ${LIB.gold}`, opacity: 0.4 }}
          />
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl"
            style={{
              background: LIB.parchment,
              border: `3px solid ${LIB.gold}`,
              boxShadow: `0 0 20px rgba(201,168,76,0.4)`,
            }}
          >
            <GraduationCap size={64} strokeWidth={1.2} style={{ color: LIB.wood }} />
          </div>
        </div>

        {/* 하단: 닉네임, 책갈피, 전공, 상점 */}
        <div
          className="mx-4 mb-4 rounded-xl overflow-hidden relative"
          style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(2px)', border: '1px solid rgba(196,168,130,0.18)' }}
        >
          {/* 2×2 그리드 */}
          <div className="grid grid-cols-2">

            {/* 닉네임 */}
            <div
              className="px-4 py-3"
              style={{ borderRight: '1px solid rgba(196,168,130,0.2)', borderBottom: '1px solid rgba(196,168,130,0.2)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: LIB.shelfLine }}>닉네임</p>
              <p className="text-sm font-extrabold truncate leading-tight" style={{ color: LIB.parchment }}>{profile?.nickname ?? '익명'}</p>
            </div>

            {/* 보유 책갈피 */}
            <div
              className="px-4 py-3"
              style={{ borderBottom: '1px solid rgba(196,168,130,0.2)' }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: LIB.shelfLine }}>보유 책갈피</p>
              <p className="text-sm font-extrabold flex items-center gap-1 leading-tight" style={{ color: LIB.gold }}>
                <Bookmark size={12} fill="currentColor" className="animate-float" />
                {starDust ?? '—'}
              </p>
            </div>

            {/* 선택 전공 */}
            <div
              className="px-4 py-3"
              style={{ borderRight: '1px solid rgba(196,168,130,0.2)' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: LIB.shelfLine }}>전공</p>
                <button onClick={openMajorModal} className="text-xs font-bold hover:opacity-70 transition" style={{ color: LIB.shelfLine }}>
                  변경
                </button>
              </div>
              {selectedMajors.length === 0 ? (
                <button onClick={openMajorModal} className="text-[10px] hover:opacity-70 transition" style={{ color: LIB.shelfLine }}>
                  + 선택
                </button>
              ) : (
                <div className="flex flex-row gap-1 mt-0.5 flex-wrap">
                  {selectedMajors.map(m => (
                    <span
                      key={m}
                      className="text-xs font-bold px-2 py-1 rounded-lg flex-1 text-center"
                      style={{ background: 'rgba(201,168,76,0.2)', color: LIB.parchment, border: '1px solid rgba(201,168,76,0.35)' }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 상점 */}
            <div className="px-4 py-3 flex items-center justify-center">
              <button
                className="w-full text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition hover:opacity-70"
                style={{ background: 'rgba(245,237,224,0.12)', color: LIB.parchment, border: '1px solid rgba(245,237,224,0.25)' }}
              >
                <ShoppingBag size={12} strokeWidth={2} /> 상점
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 칭호 선택 모달 */}
      {showTitleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="rounded-2xl p-6 w-80 shadow-2xl"
            style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}
          >
            <h3 className="text-lg font-bold mb-1" style={{ color: LIB.ink }}>칭호 선택</h3>
            <p className="text-xs mb-4" style={{ color: LIB.inkLight }}>사용할 칭호를 선택하세요.</p>
            <div className="space-y-2">
              {TITLES.map(title => (
                <button
                  key={title}
                  onClick={() => saveTitle(title)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition"
                  style={profile?.active_title === title
                    ? { background: LIB.wood, color: LIB.parchment, borderColor: LIB.wood }
                    : { background: 'white', color: LIB.ink, borderColor: LIB.shelfLine }
                  }
                >
                  {profile?.active_title === title && <Bookmark size={12} fill="currentColor" className="inline mr-1" style={{ color: LIB.goldLight }} />}{title}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTitleModal(false)}
              className="w-full mt-4 py-2.5 text-sm rounded-xl border transition hover:opacity-70"
              style={{ color: LIB.inkLight, borderColor: LIB.shelfLine }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 전공 선택 모달 */}
      {showMajorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="rounded-2xl p-6 w-80 shadow-2xl"
            style={{ background: LIB.cream, border: `1px solid ${LIB.shelfLine}` }}
          >
            <h3 className="text-lg font-bold mb-1" style={{ color: LIB.ink }}>전공 선택</h3>
            <p className="text-xs mb-4" style={{ color: LIB.inkLight }}>최대 2개까지 선택할 수 있습니다.</p>
            <div className="space-y-2">
              {MAJORS.map(major => {
                const selected = tempMajors.includes(major)
                const disabled = !selected && tempMajors.length >= 2
                return (
                  <button
                    key={major}
                    onClick={() => toggleMajor(major)}
                    disabled={disabled}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition"
                    style={selected
                      ? { background: LIB.wood, color: LIB.parchment, borderColor: LIB.wood }
                      : disabled
                        ? { background: '#f5f5f5', color: '#ccc', borderColor: '#eee', cursor: 'not-allowed' }
                        : { background: 'white', color: LIB.ink, borderColor: LIB.shelfLine }
                    }
                  >
                    {selected && <Check size={13} strokeWidth={2.5} className="inline mr-1" />}{major}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowMajorModal(false)}
                className="flex-1 py-2.5 text-sm rounded-xl border transition hover:opacity-70"
                style={{ color: LIB.inkLight, borderColor: LIB.shelfLine }}
              >
                취소
              </button>
              <button
                onClick={saveMajors}
                className="flex-1 py-2.5 text-sm rounded-xl font-bold transition hover:opacity-80"
                style={{ background: LIB.wood, color: LIB.parchment }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
