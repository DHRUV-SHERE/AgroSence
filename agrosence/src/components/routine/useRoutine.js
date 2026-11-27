/**
 * Per-user task planner kept in localStorage ("agro_routine_<userId>"). No backend. Storage can be blocked,
 * so every read and write is wrapped and the planner still works in memory for the session.
 *
 * Task: { id, title, kind:'daily'|'season', when?:'morning'|'afternoon'|'evening', season?:'kharif'|'rabi'|'zaid',
 *         due?:'YYYY-MM-DD', doneOn?:'YYYY-MM-DD' (daily, resets each day), done?:boolean (season) }
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const read = (key) => {
  try {
    const v = JSON.parse(localStorage.getItem(key))
    return Array.isArray(v) ? v.filter((t) => t && typeof t.id === 'string' && typeof t.title === 'string') : []
  } catch { return [] }
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export function useRoutine(userId) {
  const key = `agro_routine_${userId || 'guest'}`
  const [tasks, setTasks] = useState(() => read(key))
  const [saveFailed, setSaveFailed] = useState(false)
  const keyRef = useRef(key)

  useEffect(() => {
    if (keyRef.current !== key) { keyRef.current = key; setTasks(read(key)) }
  }, [key])

  const commit = useCallback((updater) => {
    setTasks((prev) => {
      const next = updater(prev)
      try { localStorage.setItem(keyRef.current, JSON.stringify(next)); setSaveFailed(false) } catch { setSaveFailed(true) }
      return next
    })
  }, [])

  const add = useCallback((task) => commit((p) => [...p, { id: newId(), ...task }]), [commit])
  const addMany = useCallback((list) => commit((p) => [...p, ...list.map((t) => ({ id: newId(), ...t }))]), [commit])
  const remove = useCallback((id) => commit((p) => p.filter((t) => t.id !== id)), [commit])
  const toggle = useCallback((id) => commit((p) => p.map((t) => {
    if (t.id !== id) return t
    if (t.kind === 'daily') return { ...t, doneOn: t.doneOn === todayStr() ? undefined : todayStr() }
    return { ...t, done: !t.done }
  })), [commit])

  return { tasks, add, addMany, remove, toggle, saveFailed }
}
