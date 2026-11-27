/**
 * Token + session storage (contract keys: agro_access, agro_refresh, agro_user).
 *
 * Usage:  import { tokenStore } from '../lib/tokens'
 *         tokenStore.getAccess() / getRefresh() / getUser() / setSession({accessToken, refreshToken, user}) / clear()
 *
 * Normally you never call this directly: use useAuth() and the api helpers.
 */
const ACCESS = 'agro_access'
const REFRESH = 'agro_refresh'
const USER = 'agro_user'

const safe = (fn, fallback = null) => {
  try { return fn() } catch { return fallback }
}

export const tokenStore = {
  getAccess: () => safe(() => localStorage.getItem(ACCESS)),
  getRefresh: () => safe(() => localStorage.getItem(REFRESH)),
  getUser: () => safe(() => JSON.parse(localStorage.getItem(USER) || 'null')),
  setTokens({ accessToken, refreshToken }) {
    safe(() => {
      if (accessToken) {
        localStorage.setItem(ACCESS, accessToken)
      }
      if (refreshToken) localStorage.setItem(REFRESH, refreshToken)
    })
  },
  setUser(user) {
    safe(() => {
      localStorage.setItem(USER, JSON.stringify(user))
    })
  },
  setSession({ accessToken, refreshToken, user }) {
    this.setTokens({ accessToken, refreshToken })
    if (user) this.setUser(user)
  },
  clear() {
    safe(() => {
      ;[ACCESS, REFRESH, USER].forEach((k) => localStorage.removeItem(k))
    })
  },
}
