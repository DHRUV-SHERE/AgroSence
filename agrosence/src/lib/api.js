/**
 * API client for the AgroSense backend (contract: docs/API_CONTRACT.md).
 *
 * Base URL: `${VITE_API_URL}/api` (dev default: port 5000 on the current host; production default: same origin). Never hard-code a host elsewhere.
 *
 * Usage (preferred, envelope unwrapped for you):
 *   import { http } from '../lib/api'
 *   const { data, meta } = await http.get('/crops', { params: { page: 1, limit: 12, q: 'wheat' } })
 *   const { data: order } = await http.post('/orders', { cropId, quantity })
 *   const form = new FormData(); form.append('cropImages', file)
 *   await http.post('/crops', form)          // multipart: just pass FormData
 *   await http.put(`/crops/${id}`, body); await http.patch(...); await http.delete(...)
 *
 * Every helper resolves to `{ data, meta, message }` from the success envelope.
 * Every failure rejects with an `ApiError` (an Error whose `.message` is human readable) carrying:
 *   .status       HTTP status (0 for network errors)
 *   .errors       [{ field, message }] from the server, if any
 *   .fieldErrors  { field: message } convenience map for forms
 *   .isNetwork    true when the server could not be reached
 *
 * Auth: attaches `Authorization: Bearer <agro_access>`. On a 401 it does ONE refresh-token call
 * (single-flight: parallel 401s share it), retries the request, and if refresh fails it clears the
 * session and dispatches `window` event "agro:logout" (AuthContext listens and ProtectedRoute redirects to /login).
 *
 * Raw axios instance is exported as `api` for edge cases (blob downloads, onUploadProgress, etc.).
 */
import axios from 'axios'
import { tokenStore } from './tokens'

const DEV_ORIGIN = import.meta.env.DEV ? `http://${window.location.hostname}:5000` : ''
export const API_ORIGIN = (import.meta.env.VITE_API_URL ?? DEV_ORIGIN).replace(/\/+$/, '')
export const API_BASE = `${API_ORIGIN}/api`

export class ApiError extends Error {
  constructor(message, { status = 0, errors = [], isNetwork = false, data } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.isNetwork = isNetwork
    this.data = data
    this.fieldErrors = Object.fromEntries(errors.filter((e) => e?.field).map((e) => [e.field, e.message]))
  }
}

export const api = axios.create({ baseURL: API_BASE, timeout: 30000 })
const bare = axios.create({ baseURL: API_BASE, timeout: 30000 }) // no interceptors: used for refresh

const AUTH_FREE = ['/auth/login', '/auth/signup', '/auth/refresh', '/auth/send-otp', '/auth/reset-password']

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = null
function refreshTokens() {
  if (!refreshing) {
    const refreshToken = tokenStore.getRefresh()
    if (!refreshToken) return Promise.reject(new Error('No refresh token'))
    refreshing = bare
      .post('/auth/refresh', { refreshToken })
      .then((res) => {
        const d = res.data?.data ?? res.data
        tokenStore.setTokens(d)
        return d.accessToken
      })
      .finally(() => { refreshing = null })
  }
  return refreshing
}

export function forceLogout() {
  tokenStore.clear()
  window.dispatchEvent(new Event('agro:logout'))
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const isAuthFree = AUTH_FREE.some((p) => original?.url?.startsWith(p))
    if (status === 401 && original && !original._retried && !isAuthFree) {
      original._retried = true
      try {
        const token = await refreshTokens()
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        forceLogout()
      }
    }
    return Promise.reject(error)
  },
)

function normalise(error) {
  if (error instanceof ApiError) return error
  if (axios.isCancel?.(error) || error?.code === 'ERR_CANCELED') {
    const e = new ApiError('Request cancelled', { status: 0 })
    e.cancelled = true
    return e
  }
  if (error.response) {
    const { status, data } = error.response
    const fallback = {
      400: 'Please check the details you entered.',
      401: 'Please sign in to continue.',
      403: 'You do not have permission to do that.',
      404: 'We could not find what you were looking for.',
      409: 'That already exists.',
      413: 'That file is too large.',
      429: 'Too many attempts. Please wait a moment and try again.',
    }[status] || 'Something went wrong on our side. Please try again.'
    return new ApiError(data?.message || fallback, { status, errors: data?.errors || [], data })
  }
  return new ApiError(
    error.code === 'ECONNABORTED'
      ? 'The server took too long to respond. Please try again.'
      : 'Cannot reach the server. Check your connection and try again.',
    { isNetwork: true },
  )
}

async function request(config) {
  try {
    const res = await api.request(config)
    const body = res.data
    if (body && typeof body === 'object' && 'success' in body) {
      return { data: body.data, meta: body.meta, message: body.message }
    }
    return { data: body, meta: undefined, message: undefined }
  } catch (e) {
    throw normalise(e)
  }
}

export const http = {
  get: (url, config) => request({ ...config, url, method: 'get' }),
  delete: (url, config) => request({ ...config, url, method: 'delete' }),
  post: (url, data, config) => request({ ...config, url, data, method: 'post' }),
  put: (url, data, config) => request({ ...config, url, data, method: 'put' }),
  patch: (url, data, config) => request({ ...config, url, data, method: 'patch' }),
}

export default http
