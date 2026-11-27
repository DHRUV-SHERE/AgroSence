/**
 * Light / dark / system theme.
 *   const { theme, resolved, setTheme, toggle } = useTheme()   // theme: 'light'|'dark'|'system'
 * Persists to localStorage ("agro_theme") and sets <html data-theme>. index.html applies it before paint.
 */
import { useCallback, useEffect, useState } from 'react'

const KEY = 'agro_theme'
const read = () => { try { return localStorage.getItem(KEY) || 'system' } catch { return 'system' } }
const systemDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches

export function useTheme() {
  const [theme, setThemeState] = useState(read)
  const [dark, setDark] = useState(systemDark)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = (e) => setDark(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    try { next === 'system' ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, next) } catch { /* ignore */ }
    if (next === 'system') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', next)
  }, [])

  const resolved = theme === 'system' ? (dark ? 'dark' : 'light') : theme
  const toggle = useCallback(() => setTheme(resolved === 'dark' ? 'light' : 'dark'), [resolved, setTheme])
  return { theme, resolved, setTheme, toggle }
}
