/**
 * Tiny data hooks. No library needed.
 *
 *   import { useFetch, useMutation, invalidate } from '../hooks/useFetch'
 *
 *   const { data, meta, loading, refreshing, error, refetch } =
 *     useFetch('/crops', { params: { page, limit: 12, q } })
 *   if (loading) return <ProductGridSkeleton />          // first load only
 *   if (error)   return <ErrorState error={error} onRetry={refetch} />
 *   if (!data.length) return <EmptyState ... />
 *
 * Options: params, enabled (default true; pass false until you have the id), ttl (ms, default 30000:
 *   cached results show instantly and revalidate in the background), select (fn data -> data),
 *   initialData.
 * Behaviour: identical requests in flight are shared (dedupe); a request is aborted when the last
 *   component using it unmounts; changing url/params refetches.
 *
 *   const { run, loading, error } = useMutation((vars) => http.post('/orders', vars))
 *   await run({ cropId, quantity }); invalidate('/orders')   // drop cached GETs whose key starts with '/orders'
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { http } from '../lib/api'

const cache = new Map() // key -> { ts, value, promise, controller, subs }

export function invalidate(prefix = '') {
  for (const k of [...cache.keys()]) if (k.startsWith(prefix)) cache.delete(k)
}

const keyOf = (url, params) => `${url}?${params ? JSON.stringify(params, Object.keys(params).sort()) : ''}`

function load(key, url, params) {
  const hit = cache.get(key)
  if (hit?.promise) return hit
  const entry = hit || { subs: 0, value: undefined, ts: 0 }
  const controller = new AbortController()
  const p = http
    .get(url, { params, signal: controller.signal })
    .then((res) => { entry.value = res; entry.ts = Date.now(); return res })
  entry.controller = controller
  entry.promise = p
  const clear = () => { if (entry.promise === p) { entry.promise = null; entry.controller = null } }
  p.then(clear, clear)
  cache.set(key, entry)
  return entry
}

export function useFetch(url, { params, enabled = true, ttl = 30000, select, initialData } = {}) {
  const key = url ? keyOf(url, params) : null
  const paramsRef = useRef(params)
  paramsRef.current = params
  const selectRef = useRef(select)
  selectRef.current = select

  const [state, setState] = useState(() => {
    const hit = key && cache.get(key)
    return hit?.value
      ? { res: hit.value, error: null, loading: false }
      : { res: initialData !== undefined ? { data: initialData } : null, error: null, loading: Boolean(enabled && url) }
  })
  const [refreshing, setRefreshing] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    if (!enabled || !key) return undefined
    let active = true
    const existing = cache.get(key)
    const fresh = existing?.value && Date.now() - existing.ts < ttl && nonce === 0
    if (existing?.value) setState({ res: existing.value, error: null, loading: false })
    else setState((s) => ({ ...s, error: null, loading: true }))
    if (fresh) return undefined

    const entry = load(key, url, paramsRef.current)
    entry.subs += 1
    setRefreshing(Boolean(existing?.value))
    entry.promise
      ?.then((res) => { if (active) setState({ res, error: null, loading: false }) })
      .catch((error) => { if (active && !error.cancelled) setState((s) => ({ ...s, error, loading: false })) })
      .finally(() => { if (active) setRefreshing(false) })
    return () => {
      active = false
      entry.subs -= 1
      if (entry.subs <= 0 && entry.promise) {
        entry.controller?.abort()
        entry.promise = null
        entry.controller = null
        if (!entry.value) cache.delete(key)
      }
    }
  }, [key, url, enabled, ttl, nonce])

  const refetch = useCallback(() => {
    if (key) cache.delete(key)
    setNonce((n) => n + 1)
  }, [key])

  const raw = state.res?.data
  return {
    data: selectRef.current && raw !== undefined ? selectRef.current(raw) : raw,
    meta: state.res?.meta,
    error: state.error,
    loading: state.loading,
    refreshing,
    refetch,
  }
}

export function useMutation(fn) {
  const [state, setState] = useState({ loading: false, error: null, data: null })
  const fnRef = useRef(fn)
  fnRef.current = fn
  const run = useCallback(async (...args) => {
    setState({ loading: true, error: null, data: null })
    try {
      const res = await fnRef.current(...args)
      setState({ loading: false, error: null, data: res })
      return res
    } catch (error) {
      setState({ loading: false, error, data: null })
      throw error
    }
  }, [])
  return { run, ...state }
}
