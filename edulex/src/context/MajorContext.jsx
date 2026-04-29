import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from './AuthContext'

const MajorContext = createContext(null)

export function MajorProvider({ children }) {
  const { user } = useAuth()
  const [selectedMajors, setSelectedMajors] = useState([])

  const RENAME_MAP = { '컴퓨터공학': '컴퓨터과학' }
  const migrate = (majors) => majors.map(m => RENAME_MAP[m] ?? m)

  useEffect(() => {
    if (!user) return
    supabase
      .from('users')
      .select('major')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const raw = data?.major ?? []
        const migrated = migrate(raw)
        setSelectedMajors(migrated)
        // 이름이 바뀐 항목이 있으면 DB도 자동 업데이트
        if (migrated.some((m, i) => m !== raw[i])) {
          supabase.from('users').update({ major: migrated }).eq('id', user.id)
        }
      })
  }, [user])

  const updateMajors = async (majors) => {
    setSelectedMajors(majors)
    await supabase
      .from('users')
      .update({ major: majors })
      .eq('id', user.id)
  }

  return (
    <MajorContext.Provider value={{ selectedMajors, updateMajors }}>
      {children}
    </MajorContext.Provider>
  )
}

export const useMajor = () => useContext(MajorContext)
