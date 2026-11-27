/**
 * Auth state for the whole app.
 *
 *   import { useAuth } from '../context/AuthContext'     // (also re-exported from '../hooks/useAuth')
 *   const { user, role, isAuthenticated, loading, login, signup, logout, updateProfile, changePassword, hasRole } = useAuth()
 *
 *   await login({ identifier, password, remember })   // identifier = 10-digit mobile OR email. Throws ApiError.
 *   await signup({ name, mobile, email, password, confirmPassword, state, address, language })
 *   await logout()                                    // revokes refresh token (best effort) and clears session
 *   await updateProfile({ name, email, mobile, state, address, language, avatar }, { currentPassword })  // whitelist per contract; currentPassword required when email/mobile change
 *   await changePassword(current, next)               // keeps this session, signs out the others
 *   hasRole('admin', 'moderator')                      // true if the user has ANY of these roles
 *
 * `loading` is true only while a stored session is being verified against GET /auth/me on first load.
 * Sessions end automatically when the API client cannot refresh a token (event "agro:logout").
 * <AuthProvider> must wrap the router (see App.jsx).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { http } from '../lib/api'
import { tokenStore } from '../lib/tokens'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (tokenStore.getAccess() ? tokenStore.getUser() : null))
  const [loading, setLoading] = useState(() => Boolean(tokenStore.getAccess()))

  // Verify the stored session once.
  useEffect(() => {
    let cancelled = false
    if (!tokenStore.getAccess()) { setLoading(false); return undefined }
    http.get('/auth/me')
      .then(({ data }) => {
        if (cancelled) return
        const fresh = data?.user ?? data
        tokenStore.setUser(fresh)
        setUser(fresh)
      })
      .catch((e) => {
        if (cancelled) return
        // 401 is handled by the api client (logout event). A network error keeps the cached session.
        if (e.status === 401 || e.status === 403 || e.status === 404) { tokenStore.clear(); setUser(null) }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // The api client announces an unrecoverable 401 here.
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('agro:logout', onLogout)
    return () => window.removeEventListener('agro:logout', onLogout)
  }, [])

  const startSession = useCallback((data) => {
    tokenStore.setSession(data)
    setUser(data.user)
    return data.user
  }, [])

  const login = useCallback(async ({ identifier, password, remember = false }) => {
    const { data } = await http.post('/auth/login', { identifier: identifier.trim(), password })
    try { // remember only the identifier (never the password)
      if (remember) localStorage.setItem('agro_remember_id', identifier.trim())
      else localStorage.removeItem('agro_remember_id')
    } catch { /* storage unavailable */ }
    return startSession(data)
  }, [startSession])

  const signup = useCallback(async (payload) => {
    const { data } = await http.post('/auth/signup', payload)
    return startSession(data)
  }, [startSession])

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefresh()
    try { if (refreshToken) await http.post('/auth/logout', { refreshToken }) } catch { /* already invalid */ }
    tokenStore.clear()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (patch, { currentPassword } = {}) => {
    // currentPassword is required by the API when email or mobile change.
    // The current refresh token is sent so the server can keep this session; any rotated pair it returns is stored.
    const body = currentPassword ? { ...patch, currentPassword, refreshToken: tokenStore.getRefresh() || undefined } : patch
    const { data } = await http.put('/auth/me', body)
    if (data?.accessToken) tokenStore.setTokens(data)
    const next = data?.user ?? data
    tokenStore.setUser(next)
    setUser(next)
    return next
  }, [])

  // Sends the current refresh token so this session survives (every other session is revoked). If the server
  // rotates tokens anyway (no refresh token sent / accepted) the new pair is stored.
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const res = await http.put('/auth/me/password', {
      currentPassword,
      newPassword,
      refreshToken: tokenStore.getRefresh() || undefined,
    })
    if (res.data?.accessToken) tokenStore.setTokens(res.data)
    return res
  }, [])

  const value = useMemo(() => {
    const role = user?.role ?? null
    return {
      user,
      role,
      isAuthenticated: Boolean(user),
      loading,
      login, signup, logout, updateProfile, changePassword,
      hasRole: (...roles) => Boolean(role) && roles.flat().includes(role),
    }
  }, [user, loading, login, signup, logout, updateProfile, changePassword])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
