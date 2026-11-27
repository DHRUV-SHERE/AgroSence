/**
 * Farming report (AppLayout). Built only from the user's own data:
 *   GET /orders/mine (latest 100)  and  GET /crops/mine (latest 100).
 * Order: { id, quantity, totalPrice, status, createdAt, role:"buyer"|"seller", crop:{ cropName, cropCategory } }.
 * Charts are plain CSS/HTML so they print and need no library. Export = CSV of the orders in view.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LuDownload, LuPrinter, LuReceipt, LuSprout } from 'react-icons/lu'
import '../styles/pages-tools.css'
import { useFetch } from '../hooks/useFetch'
import { formatDate, formatINR, formatNumber } from '../lib/format'
import { Button, Card, EmptyState, ErrorState, Skeleton, SkeletonTableRow, Tabs } from '../components/ui'

const STATUSES = ['Accepted', 'Pending', 'Rejected', 'Cancelled']
// Position in the order doubles as the legend order. Colours come from tokens; labels carry the meaning.
const STATUS_COLOR = { Accepted: 'var(--leaf)', Pending: 'var(--turmeric)', Rejected: 'var(--danger)', Cancelled: 'var(--ink-3)' }

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
const monthLabel = (d) => d.toLocaleDateString('en-IN', { month: 'short' })

function lastMonths(n) {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1)
    return { key: monthKey(d), label: monthLabel(d), year: d.getFullYear(), value: 0, count: 0 }
  })
}

const norm = (o) => ({
  id: o.id,
  crop: o.crop?.cropName ?? 'Crop',
  category: o.crop?.cropCategory || 'Other',
  qty: Number(o.quantity) || 0,
  unit: o.crop?.cropUnit || '',
  total: Number(o.totalPrice) || 0,
  status: STATUSES.includes(o.status) ? o.status : 'Pending',
  role: o.role === 'buyer' ? 'buyer' : 'seller',
  at: o.createdAt,
})

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function downloadCsv(rows, name) {
  const head = ['Date', 'Crop', 'Category', 'Quantity', 'Unit', 'Total (INR)', 'Status', 'Role']
  const lines = [head, ...rows.map((r) => [formatDate(r.at), r.crop, r.category, r.qty, r.unit, r.total, r.status, r.role])]
  const blob = new Blob(['﻿', lines.map((l) => l.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Bars({ rows, label }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className="ag-bars" aria-label={label}>
      {rows.map((r) => (
        <li key={r.key} title={`${r.label}: ${formatINR(r.value)}`}>
          <span className="ag-bars__val ag-num">{r.value ? formatINR(r.value) : ''}</span>
          <span className="ag-bars__col"><span style={{ height: `${(r.value / max) * 100}%` }} /></span>
          <span className="ag-bars__lab">{r.label}</span>
        </li>
      ))}
    </ul>
  )
}

function RankBars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className="ag-rank">
      {rows.map((r) => (
        <li key={r.name}>
          <span className="ag-rank__name">{r.name}</span>
          <span className="ag-rank__track"><span style={{ width: `${(r.value / max) * 100}%` }} /></span>
          <span className="ag-rank__val ag-num">{formatINR(r.value)}</span>
        </li>
      ))}
    </ul>
  )
}

function Report({ orders, role, crops }) {
  const mine = useMemo(() => orders.filter((o) => o.role === role), [orders, role])
  const counted = mine.filter((o) => o.status === 'Accepted')
  const total = counted.reduce((s, o) => s + o.total, 0)

  const months = useMemo(() => {
    const m = lastMonths(6)
    const byKey = Object.fromEntries(m.map((x) => [x.key, x]))
    for (const o of counted) {
      const d = new Date(o.at)
      const slot = Number.isNaN(d.getTime()) ? null : byKey[monthKey(d)]
      if (slot) { slot.value += o.total; slot.count += 1 }
    }
    return m
  }, [counted])

  const categories = useMemo(() => {
    const map = new Map()
    for (const o of counted) map.set(o.category, (map.get(o.category) || 0) + o.total)
    return [...map].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6)
  }, [counted])

  const split = STATUSES.map((s) => ({ s, n: mine.filter((o) => o.status === s).length }))
  const all = mine.length

  const verb = role === 'seller' ? 'sold' : 'bought'
  if (!all) {
    return (
      <EmptyState
        icon={LuReceipt}
        title={role === 'seller' ? 'No sales yet' : 'No purchases yet'}
        message={role === 'seller' ? 'List a crop and your sales will be charted here.' : 'Place an order and your purchases will be charted here.'}
        action={role === 'seller'
          ? <Button as={Link} to="/CropSell" variant="primary" icon={<LuSprout aria-hidden="true" />}>List a crop</Button>
          : <Button as={Link} to="/features/MarketAccess" variant="primary">Browse the market</Button>}
      />
    )
  }

  const avg = counted.length ? total / counted.length : 0
  const listed = crops.length
  const soldOut = crops.filter((c) => c.cropStatus === 'Sold').length

  return (
    <div className="ag-report">
      <Card as="section" aria-labelledby="r-led">
        <h2 id="r-led" className="ag-card__title">Your ledger</h2>
        <ul className="ag-ledger">
          <li className="ag-ledger__row"><span className="ag-ledger__label">Value {verb} (accepted orders)</span><span className="ag-ledger__value">{formatINR(total)}</span></li>
          <li className="ag-ledger__row"><span className="ag-ledger__label">Accepted orders</span><span className="ag-ledger__value">{formatNumber(counted.length)}</span></li>
          <li className="ag-ledger__row"><span className="ag-ledger__label">Average per order</span><span className="ag-ledger__value">{formatINR(avg)}</span></li>
          <li className="ag-ledger__row"><span className="ag-ledger__label">Waiting for a reply</span><span className="ag-ledger__value">{split[1].n}</span></li>
          {role === 'seller' && <><li className="ag-ledger__row"><span className="ag-ledger__label">Listings</span><span className="ag-ledger__value">{listed}</span></li><li className="ag-ledger__row"><span className="ag-ledger__label">Sold out</span><span className="ag-ledger__value">{soldOut}</span></li></>}
        </ul>
      </Card>

      <Card as="section" aria-labelledby="r-split">
        <h2 id="r-split" className="ag-card__title">Order status</h2>
        <div className="ag-split" role="img" aria-label={split.map((x) => `${x.s} ${x.n}`).join(', ')}>
          {split.filter((x) => x.n).map((x) => <span key={x.s} style={{ flex: x.n, background: STATUS_COLOR[x.s] }} />)}
        </div>
        <ul className="ag-legend">
          {split.map((x) => (
            <li key={x.s}><i style={{ background: STATUS_COLOR[x.s] }} aria-hidden="true" />{x.s}<b className="ag-num">{x.n}</b></li>
          ))}
        </ul>
      </Card>

      <Card as="section" aria-labelledby="r-month" className="ag-report__wide">
        <h2 id="r-month" className="ag-card__title">Value {verb} each month</h2>
        <p className="ag-muted" style={{ margin: '0 0 var(--s-3)' }}>Accepted orders, last 6 months.</p>
        {counted.length ? <Bars rows={months} label={`Value ${verb} per month`} /> : <p className="ag-muted">No accepted orders yet, so there is nothing to chart.</p>}
      </Card>

      <Card as="section" aria-labelledby="r-cat" className="ag-report__wide">
        <h2 id="r-cat" className="ag-card__title">By crop category</h2>
        {categories.length ? <RankBars rows={categories} /> : <p className="ag-muted">Categories appear once an order is accepted.</p>}
      </Card>
    </div>
  )
}

export default function FarmingReport() {
  const orders = useFetch('/orders/mine', { params: { limit: 100, sort: '-createdAt' } })
  const crops = useFetch('/crops/mine', { params: { limit: 100 } })
  const [role, setRole] = useState('seller')

  const list = useMemo(() => (Array.isArray(orders.data) ? orders.data.map(norm) : []), [orders.data])
  const cropList = Array.isArray(crops.data) ? crops.data : []
  const inView = list.filter((o) => o.role === role)
  const truncated = (orders.meta?.total ?? 0) > list.length

  return (
    <>
      <div className="ag-pagehead ag-noprint-actions">
        <div>
          <h1>Your farming <span className="ag-em">report</span></h1>
          <p>Sales, purchases and listings, worked out from your own orders.</p>
        </div>
        <div className="ag-cluster ag-noprint">
          <Button icon={<LuDownload aria-hidden="true" />} disabled={!inView.length} onClick={() => downloadCsv(inView, `agrosense-${role === 'seller' ? 'sales' : 'purchases'}-${new Date().toISOString().slice(0, 10)}.csv`)}>Export CSV</Button>
          <Button icon={<LuPrinter aria-hidden="true" />} onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      {orders.loading || crops.loading ? (
        <div className="ag-report" aria-busy="true">
          <Card><Skeleton height={22} width="40%" /><SkeletonTableRow cols={2} rows={4} /></Card>
          <Card><Skeleton height={22} width="40%" /><Skeleton height={24} style={{ margin: 'var(--s-4) 0' }} /><SkeletonTableRow cols={2} rows={2} /></Card>
          <Card className="ag-report__wide"><Skeleton height={200} /></Card>
          <Card className="ag-report__wide"><Skeleton height={200} /></Card>
        </div>
      ) : orders.error ? (
        <ErrorState error={orders.error} onRetry={orders.refetch} title="Could not load your report" />
      ) : (
        <>
          <Tabs
            label="Report view"
            value={role}
            onChange={setRole}
            tabs={[
              { id: 'seller', label: 'As seller', content: <Report orders={list} role="seller" crops={cropList} /> },
              { id: 'buyer', label: 'As buyer', content: <Report orders={list} role="buyer" crops={cropList} /> },
            ]}
          />
          {truncated && <p className="ag-help" style={{ marginTop: 'var(--s-4)' }}>Based on your latest {list.length} orders of {orders.meta.total}.</p>}
          <p className="ag-help ag-printonly">Generated {formatDate(new Date())} from your AgroSense account.</p>
        </>
      )}
    </>
  )
}
