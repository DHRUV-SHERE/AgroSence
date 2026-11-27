/**
 * Toasts. <ToastProvider> wraps the app (see App.jsx). In any component:
 *   const toast = useToast()
 *   toast.success('Listing published')            toast.error(err.message)            toast.info('Saved as draft')
 *   toast.success('Saved', { title: 'Profile', duration: 4000 })   // duration 0 = sticky
 * Rendered in a polite aria-live region; errors use role="alert".
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { LuCircleAlert, LuCircleCheck, LuInfo, LuX } from 'react-icons/lu'

const ToastContext = createContext(null)
const ICONS = { success: LuCircleCheck, error: LuCircleAlert, info: LuInfo }

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => setItems((l) => l.filter((t) => t.id !== id)), [])
  const push = useCallback((tone, message, { title, duration = 5000 } = {}) => {
    const id = ++idRef.current
    setItems((l) => [...l.slice(-3), { id, tone, message, title }])
    if (duration) setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  const api = useMemo(() => ({
    success: (m, o) => push('success', m, o),
    error: (m, o) => push('error', m, { duration: 7000, ...o }),
    info: (m, o) => push('info', m, o),
    dismiss,
  }), [push, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="ag-toasts" aria-live="polite" aria-relevant="additions">
        {items.map((t) => {
          const Icon = ICONS[t.tone]
          return (
            <div key={t.id} className={`ag-toast ag-toast--${t.tone}`} role={t.tone === 'error' ? 'alert' : 'status'}>
              <Icon aria-hidden="true" />
              <div className="ag-toast__body">{t.title && <strong>{t.title}</strong>}{t.message}</div>
              <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}><LuX /></button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
