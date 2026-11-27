/**
 * Market (AppLayout). GET /crops with q, category, organic, minPrice, maxPrice, state, sort, page, limit.
 * All filter state lives in the URL so a filtered view can be shared and the back button works.
 */
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import MarketHead from '../components/marketaccess/MarketHead'
import MarketFilters from '../components/marketaccess/MarketFilters'
import MarketResults from '../components/marketaccess/MarketResults'
import { cropView } from '../components/marketaccess/cropMeta'
import { formatNumber } from '../lib/format'
import '../styles/pages-market.css'

const LIMIT = 12

export default function MarketAccess() {
  const { user } = useAuth()
  const [sp, setSp] = useSearchParams()

  const values = {
    q: sp.get('q') || '',
    category: sp.get('category') || '',
    state: sp.get('state') || '',
    organic: sp.get('organic') === 'true',
    minPrice: sp.get('minPrice') || '',
    maxPrice: sp.get('maxPrice') || '',
    sort: sp.get('sort') || '-createdAt',
  }
  const page = Math.max(1, Number(sp.get('page')) || 1)

  const update = (patch) => {
    const next = new URLSearchParams(sp)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === false || v == null || (k === 'sort' && v === '-createdAt')) next.delete(k)
      else next.set(k, String(v))
    })
    next.delete('page')
    setSp(next, { replace: true })
  }
  const setPage = (p) => {
    const next = new URLSearchParams(sp)
    if (p > 1) next.set('page', String(p)); else next.delete('page')
    setSp(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const reset = () => setSp(new URLSearchParams(), { replace: true })

  const priceOk = !(values.minPrice && values.maxPrice && Number(values.minPrice) > Number(values.maxPrice))
  const params = useMemo(() => {
    const p = { page, limit: LIMIT, sort: values.sort }
    if (values.q) p.q = values.q
    if (values.category) p.category = values.category
    if (values.state) p.state = values.state
    if (values.organic) p.organic = true
    if (priceOk && values.minPrice) p.minPrice = values.minPrice
    if (priceOk && values.maxPrice) p.maxPrice = values.maxPrice
    return p
  }, [page, values.q, values.category, values.state, values.organic, values.minPrice, values.maxPrice, values.sort, priceOk])

  const { data, meta, loading, refreshing, error, refetch } = useFetch('/crops', { params })
  const crops = (Array.isArray(data) ? data : []).map(cropView)
  const activeCount = [values.q, values.category, values.state, values.organic, values.minPrice, values.maxPrice].filter(Boolean).length

  return (
    <>
      <MarketHead />
      <MarketFilters values={values} onChange={update} onReset={reset} activeCount={activeCount} />
      <div className="ag-mfilters__count" aria-live="polite">
        <span>{loading ? 'Loading crops…' : error ? '' : `${formatNumber(meta?.total ?? crops.length)} ${(meta?.total ?? crops.length) === 1 ? 'crop' : 'crops'} for sale`}{refreshing && ' · updating'}</span>
      </div>
      <div style={{ marginTop: 'var(--s-4)' }}>
        <MarketResults crops={crops} meta={meta} loading={loading} error={error} refetch={refetch} filtered={activeCount > 0} onReset={reset} onPage={setPage} userId={user?.id} />
      </div>
    </>
  )
}
