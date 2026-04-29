import { useState } from 'react'
import { useMajor } from '../context/MajorContext'
import { useAuth } from '../context/AuthContext'
import { useStarDust } from '../hooks/useStarDust'
import { supabase } from '../utils/supabase'

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
      <div className="bg-white rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">

        {/* 상단 행: LV(좌) + 칭호(우) */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <span className="bg-[#1a3a5c] text-white text-xs font-extrabold px-3 py-1 rounded-full">
            LV. {profile?.level ?? 1}
          </span>
          <button
            onClick={() => setShowTitleModal(true)}
            className="text-xs font-semibold text-[#0d9488] bg-[#f0fdfa] border border-[#0d9488] px-3 py-1 rounded-full hover:bg-[#0d9488] hover:text-white transition"
          >
            {profile?.active_title ?? '칭호 없음'}
          </button>
        </div>

        {/* 중앙: 캐릭터 (flex-1로 남은 공간 채움) */}
        <div className="flex-1 flex items-center justify-center bg-[#f0fdfa] my-3 mx-4 rounded-xl">
          <div className="w-36 h-36 rounded-full bg-white border-4 border-[#0d9488] shadow-xl flex items-center justify-center text-7xl">
            🧑‍🎓
          </div>
        </div>

        {/* 하단 그리드: 닉네임(좌상) 별가루(우상) / 전공(좌하) 상점(우하) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 pb-5 pt-3">

          {/* 닉네임 */}
          <div>
            <p className="text-[10px] text-gray-400 font-semibold mb-0.5">닉네임</p>
            <p className="text-base font-extrabold text-[#1a3a5c] truncate">{profile?.nickname ?? '익명'}</p>
          </div>

          {/* 보유 별가루 */}
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-semibold mb-0.5">보유 별가루</p>
            <p className="text-base font-extrabold text-yellow-600">⭐ {starDust ?? '—'}</p>
          </div>

          {/* 선택 전공 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] text-gray-400 font-semibold">선택 전공</p>
              <button onClick={openMajorModal} className="text-[10px] text-[#0d9488] font-bold hover:underline">
                변경
              </button>
            </div>
            {selectedMajors.length === 0 ? (
              <button
                onClick={openMajorModal}
                className="text-xs text-gray-400 hover:text-[#0d9488] transition"
              >
                + 전공 선택
              </button>
            ) : (
              <div className="flex flex-col gap-1">
                {selectedMajors.map(m => (
                  <span key={m} className="bg-[#1a3a5c] text-white text-xs font-bold px-2.5 py-1 rounded-full w-fit">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 상점 이동 */}
          <div className="flex items-end justify-end">
            <button className="bg-[#f0fdfa] border border-[#0d9488] text-[#0d9488] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#0d9488] hover:text-white transition">
              🛒 상점 이동
            </button>
          </div>

        </div>
      </div>

      {/* 칭호 선택 모달 */}
      {showTitleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold text-[#1a3a5c] mb-1">칭호 선택</h3>
            <p className="text-xs text-gray-400 mb-4">사용할 칭호를 선택하세요.</p>
            <div className="space-y-2">
              {TITLES.map(title => (
                <button
                  key={title}
                  onClick={() => saveTitle(title)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition
                    ${profile?.active_title === title
                      ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#0d9488] hover:text-[#0d9488]'
                    }`}
                >
                  {profile?.active_title === title ? '✓ ' : ''}{title}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTitleModal(false)}
              className="w-full mt-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 전공 선택 모달 */}
      {showMajorModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold text-[#1a3a5c] mb-1">전공 선택</h3>
            <p className="text-xs text-gray-400 mb-4">최대 2개까지 선택할 수 있습니다.</p>
            <div className="space-y-2">
              {MAJORS.map(major => {
                const selected = tempMajors.includes(major)
                const disabled = !selected && tempMajors.length >= 2
                return (
                  <button
                    key={major}
                    onClick={() => toggleMajor(major)}
                    disabled={disabled}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition
                      ${selected
                        ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]'
                        : disabled
                          ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#0d9488]'
                      }`}
                  >
                    {selected ? '✓ ' : ''}{major}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowMajorModal(false)}
                className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={saveMajors}
                className="flex-1 py-2.5 text-sm text-white bg-[#1a3a5c] rounded-xl hover:bg-[#0d9488]"
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
