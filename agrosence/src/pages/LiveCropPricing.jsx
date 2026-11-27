/**
 * Mandi price board (AppLayout).
 * The AgroSense API has no price endpoint. Data comes from the Government of India open data portal
 * (data.gov.in, "Current daily price of various commodities from various markets (mandis)"), called straight from
 * the browser. Override with VITE_MANDI_API_URL / VITE_DATAGOV_KEY. Prices are Rs per quintal and are as reported
 * by each market on the date shown; they are not live ticks.
 * Trend: the portal gives one day per record, so we remember the last price you saw for each
 * market + commodity + variety in localStorage and show the change since that earlier reading.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LuArrowDown, LuArrowUp, LuInfo, LuMinus, LuSearch, LuTrendingUp } from 'react-icons/lu'
import '../styles/pages-tools.css'
import { INDIAN_STATES } from '../lib/validate'
import { formatINR, formatNumber } from '../lib/format'
import { Alert, Button, EmptyState, ErrorState, Input, Select, SkeletonTableRow } from '../components/ui'

const MANDI_URL = import.meta.env.VITE_MANDI_API_URL || 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'
// data.gov.in publishes this sample key for public demos; set VITE_DATAGOV_KEY for a personal (higher limit) key.
const MANDI_KEY = import.meta.env.VITE_DATAGOV_KEY || '579b464db66ec23bdd000001c249d71a1de243177596a5b0ab5305b4'
const SNAP = 'agro_mandi_seen'
const PAGE = 25

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
const keyOf = (r) => [r.state, r.market, r.commodity, r.variety].join('|')
// Portal dates are dd/mm/yyyy
const dayOf = (s) => { const [d, m, y] = String(s || '').split('/').map(Number); return d && m && y ? new Date(y, m - 1, d) : null }

function readSeen() { try { return JSON.parse(localStorage.getItem(SNAP)) || {} } catch { return {} } }
function writeSeen(map) {
  try {
    const keys = Object.keys(map)
    if (keys.length > 3000) for (const k of keys.slice(0, keys.length - 3000)) delete map[k]
    localStorage.setItem(SNAP, JSON.stringify(map))
  } catch { /* storage unavailable */ }
}

const SORTS = [
  { value: 'commodity', label: 'Crop name, A to Z' },
  { value: 'high', label: 'Price, high to low' },
  { value: 'low', label: 'Price, low to high' },
  { value: 'rise', label: 'Biggest rise' },
  { value: 'fall', label: 'Biggest fall' },
]

function Trend({ change }) {
  if (change == null) return <span className="ag-trend ag-trend--none" title="No earlier reading on this device yet"><LuMinus aria-hidden="true" /><span className="ag-sr-only">No earlier reading</span><span aria-hidden="true">New</span></span>
  if (change === 0) return <span className="ag-trend ag-trend--flat"><LuMinus aria-hidden="true" />No change</span>
  const up = change > 0
  return (
    <span className={`ag-trend ${up ? 'ag-trend--up' : 'ag-trend--down'}`}>
      {up ? <LuArrowUp aria-hidden="true" /> : <LuArrowDown aria-hidden="true" />}
      <span className="ag-sr-only">{up ? 'Up' : 'Down'}</span>
      {formatINR(Math.abs(change))}
    </span>
  )
}

function Band({ min, max, modal }) {
  const span = Math.max(1, max - min)
  const pos = Math.min(100, Math.max(0, ((modal - min) / span) * 100))
  return (
    <span className="ag-range" title={`Low ${formatINR(min)}, high ${formatINR(max)}`}>
      <span className="ag-range__track"><i style={{ left: `${pos}%` }} /></span>
      <span className="ag-range__ends ag-num"><span>{formatNumber(min)}</span><span>{formatNumber(max)}</span></span>
    </span>
  )
}

export default function LiveCropPricing() {
  const [state, setState] = useState('Gujarat')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('commodity')
  const [shown, setShown] = useState(PAGE)
  const [load, setLoad] = useState({ status: 'loading', rows: [], error: null })
  const [nonce, setNonce] = useState(0)
  const seen = useRef(readSeen()) // earlier readings, read once so this visit does not compare with itself

  useEffect(() => {
    const ctrl = new AbortController()
    setLoad((l) => ({ ...l, status: 'loading', error: null }))
    const params = new URLSearchParams({ 'api-key': MANDI_KEY, format: 'json', limit: '300' })
    if (state) params.set('filters[state.keyword]', state)
    fetch(`${MANDI_URL}?${params}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status === 429 ? 'The price service is busy. Please try again shortly.' : 'The price service did not respond.'))))
      .then((d) => {
        const records = Array.isArray(d.records) ? d.records : []
        const rows = records.map((r, i) => {
          const row = { id: `${keyOf(r)}|${i}`, key: keyOf(r), state: r.state, district: r.district, market: r.market, commodity: r.commodity, variety: r.variety, min: num(r.min_price), max: num(r.max_price), modal: num(r.modal_price), date: r.arrival_date }
          const prev = seen.current[row.key]
          row.change = prev && prev.date !== row.date ? row.modal - prev.modal : null
          row.since = prev && prev.date !== row.date ? prev.date : null
          return row
        })
        const next = { ...seen.current }
        for (const r of rows) {
          if (r.modal) next[r.key] = { modal: r.modal, date: r.date }
        }
        // Keep the old reading in memory for this visit; persist the new one for the next.
        writeSeen(next)
        setLoad({ status: 'ok', rows, error: null })
      })
      .catch((e) => { if (e.name !== 'AbortError') setLoad({ status: 'error', rows: [], error: e.message === 'Failed to fetch' ? new Error('Cannot reach the price service. Check your connection.') : e }) })
    return () => ctrl.abort()
  }, [state, nonce])

  useEffect(() => setShown(PAGE), [state, q, sort])
  const retry = useCallback(() => setNonce((n) => n + 1), [])

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = load.rows.filter((r) => r.modal > 0 && (!needle || `${r.commodity} ${r.variety} ${r.market} ${r.district}`.toLowerCase().includes(needle)))
    const by = {
      commodity: (a, b) => a.commodity.localeCompare(b.commodity) || a.market.localeCompare(b.market),
      high: (a, b) => b.modal - a.modal,
      low: (a, b) => a.modal - b.modal,
      rise: (a, b) => (b.change ?? -Infinity) - (a.change ?? -Infinity),
      fall: (a, b) => (a.change ?? Infinity) - (b.change ?? Infinity),
    }
    return list.sort(by[sort])
  }, [load.rows, q, sort])

  const latest = useMemo(() => {
    const ds = load.rows.map((r) => dayOf(r.date)).filter(Boolean)
    return ds.length ? new Date(Math.max(...ds.map((d) => d.getTime()))).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  }, [load.rows])

  return (
    <>
      <div className="ag-pagehead">
        <div>
          <h1>Mandi <span className="ag-em">price board</span></h1>
          <p>What markets reported per quintal. Check before you set your own price.</p>
        </div>
      </div>

      <Alert tone="info" className="ag-source">
        <span>
          Source: Government of India open data (data.gov.in), reported by each market.
          {latest ? ` Latest market date in this list: ${latest}.` : ''} These are daily reports, not live ticks, and
          change shows the move since the last time you opened this board on this device.
        </span>
      </Alert>

      <form className="ag-filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <Select label="State" value={state} onChange={(e) => setState(e.target.value)} placeholder="All states" options={INDIAN_STATES} />
        <Input label="Search crop or market" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Wheat, Rajkot, Basmati" autoComplete="off" />
        <Select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} options={SORTS} />
      </form>

      <div className="ag-board" aria-busy={load.status === 'loading'}>
        {load.status === 'loading' ? (
          <SkeletonTableRow cols={4} rows={8} />
        ) : load.status === 'error' ? (
          <ErrorState error={load.error} onRetry={retry} title="Could not load prices" />
        ) : !rows.length ? (
          <EmptyState
            icon={LuTrendingUp}
            title={load.rows.length ? 'Nothing matches your search' : `No prices reported for ${state || 'this selection'}`}
            message={load.rows.length ? 'Try a different crop name or clear the search.' : 'Markets may not have reported today. Try another state.'}
            action={<Button onClick={() => { setQ(''); if (!load.rows.length) setState('') }}>{load.rows.length ? 'Clear search' : 'Show all states'}</Button>}
          />
        ) : (
          <>
            <p className="ag-help" role="status">{rows.length} price{rows.length === 1 ? '' : 's'} in {state || 'all states'}</p>
            <div className="ag-tablewrap">
              <table className="ag-table ag-pricetable">
                <caption className="ag-sr-only">Mandi prices in rupees per quintal</caption>
                <thead>
                  <tr>
                    <th scope="col">Crop</th>
                    <th scope="col">Market</th>
                    <th scope="col">Low to high</th>
                    <th scope="col" className="ag-right">Typical price</th>
                    <th scope="col">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, shown).map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.commodity}</strong>{r.variety && r.variety !== 'Other' && <><br /><small className="ag-muted">{r.variety}</small></>}</td>
                      <td>{r.market}<br /><small className="ag-muted">{r.district}{!state && r.state ? `, ${r.state}` : ''} · {r.date}</small></td>
                      <td><Band min={r.min} max={r.max} modal={r.modal} /></td>
                      <td className="ag-right ag-num"><strong>{formatINR(r.modal)}</strong><br /><small className="ag-muted">per quintal</small></td>
                      <td><Trend change={r.change} />{r.since && <><br /><small className="ag-muted">since {r.since}</small></>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {shown < rows.length && (
              <div className="ag-cluster" style={{ justifyContent: 'center', marginTop: 'var(--s-5)' }}>
                <Button onClick={() => setShown((n) => n + PAGE)} icon={<LuSearch aria-hidden="true" />}>Show more ({rows.length - shown} left)</Button>
              </div>
            )}
            <p className="ag-help" style={{ marginTop: 'var(--s-4)' }}><LuInfo aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px' }} /> The bar marks the typical price between the lowest and highest price reported that day.</p>
          </>
        )}
      </div>
    </>
  )
}
