/**
 * Dashboard landing (AppLayout). Data: GET /orders/mine, GET /crops/mine, GET /notifications,
 * plus keyless weather from Open-Meteo. Every block has its own loading / error / empty state.
 * Order/crop field names are read defensively so small backend naming differences do not break the page.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LuArrowRight, LuCloudSun, LuLandmark, LuScanSearch, LuSprout, LuStore, LuTrendingUp, LuGraduationCap, LuReceipt } from 'react-icons/lu'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { useNotifications } from '../hooks/useNotifications'
import { formatDate, formatINR, timeAgo } from '../lib/format'
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton, SkeletonTableRow, statusTone } from '../components/ui'

const QUICK = [
  { to: '/CropSell', label: 'Sell a crop', icon: LuSprout },
  { to: '/features/MarketAccess', label: 'Browse the market', icon: LuStore },
  { to: '/features/crop-detection', label: 'Check a crop', icon: LuScanSearch },
  { to: '/LiveCropPricing', label: 'Live prices', icon: LuTrendingUp },
  { to: '/features/government-schemes', label: 'Govt. schemes', icon: LuLandmark },
  { to: '/features/expert', label: 'Ask an expert', icon: LuGraduationCap },
]

const idOf = (v) => (v && typeof v === 'object' ? v.id ?? v._id : v)
const view = (o, userId) => {
  const sellerId = idOf(o.seller ?? o.sellerId)
  const mine = sellerId === userId
  const other = mine ? (o.buyer ?? o.buyerId) : (o.seller ?? o.sellerId)
  return {
    id: o.id,
    crop: o.crop?.name ?? o.cropName ?? o.cropId?.cropName ?? o.cropId?.name ?? 'Crop',
    status: o.status || 'Pending',
    total: Number(o.totalPrice ?? o.total ?? 0),
    mine, // I am the seller
    who: typeof other === 'object' ? other?.name : undefined,
    at: o.createdAt,
  }
}

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const WMO = (c) => (c === 0 ? 'Clear sky' : c <= 3 ? 'Partly cloudy' : c <= 48 ? 'Fog' : c <= 67 ? 'Rain' : c <= 77 ? 'Snow' : c <= 82 ? 'Rain showers' : 'Thunderstorm')

function Weather() {
  const [state, setState] = useState({ status: 'loading' })
  useEffect(() => {
    const ctrl = new AbortController()
    // Ahmedabad by default; no location prompt unless the user asks.
    fetch('https://api.open-meteo.com/v1/forecast?latitude=23.02&longitude=72.57&current=temperature_2m,relative_humidity_2m,weather_code', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('weather'))))
      .then((d) => setState({ status: 'ok', ...d.current }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ status: 'error' }) })
    return () => ctrl.abort()
  }, [])
  return (
    <Card>
      <h2>Weather</h2>
      {state.status === 'loading' && <Skeleton height={44} />}
      {state.status === 'error' && <p className="ag-muted" style={{ margin: 0 }}>Weather is unavailable right now.</p>}
      {state.status === 'ok' && (
        <div className="ag-weather">
          <LuCloudSun aria-hidden="true" />
          <div>
            <strong className="ag-num">{Math.round(state.temperature_2m)}°C</strong>
            <div className="ag-muted">{WMO(state.weather_code)}, humidity {state.relative_humidity_2m}%</div>
            <small className="ag-muted">Ahmedabad</small>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const orders = useFetch('/orders/mine', { params: { limit: 50, sort: '-createdAt' } })
  const crops = useFetch('/crops/mine', { params: { limit: 1 } })
  const notes = useNotifications({ poll: 0 })

  const list = (Array.isArray(orders.data) ? orders.data : []).map((o) => view(o, user.id))
  const pending = list.filter((o) => o.status.toLowerCase() === 'pending').length
  const earned = list.filter((o) => o.mine && o.status.toLowerCase() === 'accepted').reduce((s, o) => s + o.total, 0)
  const listings = crops.meta?.total ?? (Array.isArray(crops.data) ? crops.data.length : 0)

  return (
    <>
      <div className="ag-greeting">
        <div>
          <h1>{greeting()}, {user.name?.split(' ')[0]}</h1>
          <p>{[user.state, user.language].filter(Boolean).join(' · ')}</p>
        </div>
        <Button as={Link} to="/CropSell" variant="primary" icon={<LuSprout aria-hidden="true" />}>List a crop</Button>
      </div>

      <div className="ag-dash">
        <section className="ag-dash__wide" aria-labelledby="q-h">
          <h2 id="q-h">Quick actions</h2>
          <div className="ag-quick">
            {QUICK.map((q) => <Link key={q.to} to={q.to}><q.icon aria-hidden="true" />{q.label}</Link>)}
          </div>
        </section>

        <section className="ag-dash__narrow" aria-label="Weather"><Weather /></section>

        <section className="ag-dash__narrow" aria-labelledby="l-h">
          <Card>
            <h2 id="l-h">Your ledger</h2>
            {orders.loading || crops.loading ? (
              <SkeletonTableRow cols={2} rows={4} />
            ) : orders.error ? (
              <ErrorState error={orders.error} onRetry={orders.refetch} title="Could not load your figures" />
            ) : (
              <ul className="ag-ledger">
                <li className="ag-ledger__row"><span className="ag-ledger__label">Active listings</span><span className="ag-ledger__value">{listings}</span></li>
                <li className="ag-ledger__row"><span className="ag-ledger__label">Orders</span><span className="ag-ledger__value">{list.length}</span></li>
                <li className="ag-ledger__row"><span className="ag-ledger__label">Waiting for a reply</span><span className="ag-ledger__value">{pending}</span></li>
                <li className="ag-ledger__row"><span className="ag-ledger__label">Sales accepted</span><span className="ag-ledger__value">{formatINR(earned)}</span></li>
              </ul>
            )}
          </Card>
        </section>

        <section className="ag-dash__wide" aria-labelledby="o-h">
          <Card>
            <div className="ag-rowbetween" style={{ marginBottom: 'var(--s-3)' }}>
              <h2 id="o-h" style={{ margin: 0 }}>Recent orders</h2>
              <Link to="/OrderHistory" className="ag-tap" style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>View all <LuArrowRight aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px' }} /></Link>
            </div>
            {orders.loading ? <SkeletonTableRow cols={3} rows={4} />
              : orders.error ? <ErrorState error={orders.error} onRetry={orders.refetch} title="Could not load orders" />
                : !list.length ? (
                  <EmptyState icon={LuReceipt} title="No orders yet" message="When you buy or sell a crop, the order appears here." action={<Button as={Link} to="/features/MarketAccess">Browse the market</Button>} />
                ) : (
                  <ul className="ag-orderlist">
                    {list.slice(0, 5).map((o) => (
                      <li key={o.id}>
                        <div><strong>{o.crop}</strong><br /><small>{o.mine ? 'Sold' : 'Bought'}{o.who ? ` · ${o.who}` : ''} · {formatDate(o.at)}</small></div>
                        <div style={{ textAlign: 'right' }}><div className="ag-num"><strong>{formatINR(o.total)}</strong></div><Badge tone={statusTone(o.status)}>{o.status}</Badge></div>
                      </li>
                    ))}
                  </ul>
                )}
          </Card>
        </section>

        <section className="ag-dash__narrow" aria-labelledby="n-h">
          <Card>
            <h2 id="n-h">Notifications</h2>
            {notes.loading && !notes.items.length ? <SkeletonTableRow cols={1} rows={3} />
              : notes.error ? <p className="ag-muted" style={{ margin: 0 }}>Could not load notifications.</p>
                : !notes.items.length ? <p className="ag-muted" style={{ margin: 0 }}>You are all caught up.</p>
                  : (
                    <ul className="ag-orderlist">
                      {notes.items.slice(0, 4).map((n) => (
                        <li key={n.id} style={{ gridTemplateColumns: '1fr' }}>
                          <span>{n.message || n.title}</span>
                          <small>{timeAgo(n.createdAt)}</small>
                        </li>
                      ))}
                    </ul>
                  )}
          </Card>
        </section>
      </div>
    </>
  )
}
