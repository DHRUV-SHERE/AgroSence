/**
 * Orders (AppLayout). GET /orders/mine (both roles), PUT /orders/:id/status.
 * Seller: Accept / Reject a Pending order. Buyer: Cancel while Pending. Updates are optimistic (rolled back
 * with a toast on failure) and every change is confirmed in a dialog first. New order requests surface as a
 * toast (useNotifications polling) and the list refreshes quietly.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LuCheck, LuPhone, LuReceipt, LuX } from 'react-icons/lu'
import { useAuth } from '../context/AuthContext'
import { invalidate, useFetch } from '../hooks/useFetch'
import { useNotifications } from '../hooks/useNotifications'
import { http } from '../lib/api'
import { formatDateTime, formatINR, formatNumber } from '../lib/format'
import { imageUrl } from '../lib/imageUrl'
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, SkeletonTableRow, Tabs, statusTone, useToast } from '../components/ui'
import '../styles/pages-market.css'

const FILTERS = ['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled']
const idOf = (v) => (v && typeof v === 'object' ? v.id : v)

const COPY = {
  Accepted: { title: 'Accept this order?', confirm: 'Accept order', danger: false, msg: (o) => `${formatNumber(o.quantity)} ${o.crop?.cropUnit ?? ''} of ${o.crop?.cropName ?? 'this crop'} will be taken out of your stock. The buyer is told straight away.`, done: 'Order accepted. The buyer has been notified.' },
  Rejected: { title: 'Reject this order?', confirm: 'Reject order', danger: true, msg: () => 'The buyer is told it was declined. This cannot be undone.', done: 'Order rejected.' },
  Cancelled: { title: 'Cancel your request?', confirm: 'Cancel request', danger: true, msg: () => 'The seller is told you no longer want this crop.', done: 'Your order request was cancelled.' },
}

function OrderRow({ o, role, isNew, onAct }) {
  const other = role === 'seller' ? o.buyer : o.seller
  const unit = o.crop?.cropUnit ?? ''
  return (
    <li className="ag-row" data-new={isNew || undefined}>
      <img className="ag-row__img" src={imageUrl(o.crop?.cropImages?.[0], { width: 160 })} width="88" height="88" alt="" loading="lazy" decoding="async" />
      <div className="ag-row__main">
        <h3>{o.crop?.id ? <Link to={`/features/MarketAccess/product/${o.crop.id}`}>{o.crop.cropName}</Link> : (o.crop?.cropName ?? 'Crop no longer listed')}</h3>
        <span className="ag-row__sub">{formatNumber(o.quantity)} {unit}{other?.name ? ` · ${role === 'seller' ? 'from' : 'sold by'} ${other.name}` : ''}{other?.state ? `, ${other.state}` : ''}</span>
        <small className="ag-muted">{formatDateTime(o.createdAt)}</small>
      </div>
      <div className="ag-row__side">
        <strong className="ag-num">{formatINR(o.totalPrice, { decimals: o.totalPrice % 1 ? 2 : 0 })}</strong>
        <Badge tone={statusTone(o.status)}>{isNew && o.status === 'Pending' ? 'New request' : o.status}</Badge>
      </div>
      {o.status === 'Pending' && (
        <div className="ag-row__actions">
          {role === 'seller' ? (
            <>
              <Button size="sm" variant="primary" icon={<LuCheck aria-hidden="true" />} onClick={() => onAct(o, 'Accepted')}>Accept</Button>
              <Button size="sm" variant="danger" icon={<LuX aria-hidden="true" />} onClick={() => onAct(o, 'Rejected')}>Reject</Button>
            </>
          ) : (
            <Button size="sm" variant="danger" onClick={() => onAct(o, 'Cancelled')}>Cancel request</Button>
          )}
        </div>
      )}
      {o.status === 'Accepted' && other?.mobile && (
        <p className="ag-row__note"><LuPhone aria-hidden="true" style={{ verticalAlign: '-2px' }} /> Contact {other.name ?? 'them'} on <a href={`tel:${other.mobile}`}>{other.mobile}</a> to agree delivery and payment.</p>
      )}
    </li>
  )
}

export default function OrderHistory() {
  const { user } = useAuth()
  const toast = useToast()
  const [sp, setSp] = useSearchParams()
  const { data, loading, error, refetch } = useFetch('/orders/mine', { params: { limit: 100, sort: '-createdAt' }, ttl: 0 })
  const { items: noteItems, loading: notesLoading, isUnread, markRead } = useNotifications({ poll: 30000 })

  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('All')
  const [pending, setPending] = useState(null) // { order, status }
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (Array.isArray(data)) setOrders(data) }, [data])

  const roleOf = useCallback((o) => o.role || (idOf(o.sellerId ?? o.seller) === user.id ? 'seller' : 'buyer'), [user.id])
  const mineRole = (r) => orders.filter((o) => roleOf(o) === r)
  const buying = mineRole('buyer')
  const selling = mineRole('seller')
  const tab = sp.get('tab') === 'selling' ? 'selling' : sp.get('tab') === 'buying' ? 'buying' : null
  const activeTab = tab ?? (selling.some((o) => o.status === 'Pending') ? 'selling' : 'buying')
  const waiting = selling.filter((o) => o.status === 'Pending').length

  // Quietly pull fresh orders when a new notification arrives (no skeleton flash).
  const reload = useCallback(async () => {
    try { const { data: d } = await http.get('/orders/mine', { params: { limit: 100, sort: '-createdAt' } }); setOrders(d) } catch { /* keep what we have */ }
  }, [])
  const seen = useRef(null)
  useEffect(() => {
    const unreadOrders = noteItems.filter((n) => isUnread(n) && n.orderId)
    if (seen.current === null) { if (!notesLoading) seen.current = new Set(noteItems.map((n) => n.id)); return }
    const fresh = unreadOrders.filter((n) => !seen.current.has(n.id))
    if (!fresh.length) return
    fresh.forEach((n) => seen.current.add(n.id))
    toast.info(fresh[0].message || 'You have a new order update.', { title: fresh.length > 1 ? `${fresh.length} order updates` : 'Order update' })
    reload()
  }, [noteItems, notesLoading, isUnread, reload, toast])

  const newIds = useMemo(() => new Set(noteItems.filter((n) => isUnread(n) && n.orderId).map((n) => n.orderId)), [noteItems, isUnread])

  // Viewing the list counts as reading the order notifications.
  const cleared = useRef(false)
  useEffect(() => {
    if (cleared.current || loading || notesLoading || !noteItems.length) return
    const t = setTimeout(() => {
      cleared.current = true
      noteItems.filter((n) => isUnread(n) && n.orderId).forEach((n) => markRead(n.id))
    }, 4000)
    return () => clearTimeout(t)
  }, [loading, notesLoading, noteItems, isUnread, markRead])

  const act = (order, status) => setPending({ order, status })

  const confirm = async () => {
    const { order, status } = pending
    const previous = orders
    setBusy(true)
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status } : o))) // optimistic
    try {
      const { data: updated } = await http.put(`/orders/${order.id}/status`, { status })
      if (updated?.status) setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, ...updated, crop: updated.crop ?? o.crop, buyer: updated.buyer ?? o.buyer, seller: updated.seller ?? o.seller } : o)))
      invalidate('/orders'); invalidate('/crops'); invalidate('/notifications')
      toast.success(COPY[status].done)
      setPending(null)
    } catch (e) {
      setOrders(previous)
      toast.error(e.message || 'Could not update the order.')
      setPending(null)
      reload()
    } finally { setBusy(false) }
  }

  const panel = (role, list) => {
    const shown = filter === 'All' ? list : list.filter((o) => o.status === filter)
    return (
      <>
        {role === 'seller' && waiting > 0 && (
          <div className="ag-callout" role="status">
            <p>{waiting} {waiting === 1 ? 'buyer is' : 'buyers are'} waiting for your reply.</p>
            {filter !== 'Pending' && <Button size="sm" onClick={() => setFilter('Pending')}>Show requests</Button>}
          </div>
        )}
        <div className="ag-chips" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => <button key={f} type="button" className="ag-chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}
        </div>
        {!list.length ? (
          role === 'seller'
            ? <EmptyState icon={LuReceipt} title="No order requests yet" message="When a buyer asks for one of your crops, it shows up here and in your notifications." action={<Button as={Link} to="/CropSell" variant="primary">List a crop</Button>} />
            : <EmptyState icon={LuReceipt} title="You have not ordered anything" message="Find a crop you need and send the seller an order request." action={<Button as={Link} to="/features/MarketAccess" variant="primary">Browse the market</Button>} />
        ) : !shown.length ? (
          <EmptyState icon={LuReceipt} title={`No ${filter.toLowerCase()} orders`} action={<Button onClick={() => setFilter('All')}>Show all orders</Button>} />
        ) : (
          <ul className="ag-rows">
            {shown.map((o) => <OrderRow key={o.id} o={o} role={role} isNew={newIds.has(o.id)} onAct={act} />)}
          </ul>
        )}
      </>
    )
  }

  const copy = pending && COPY[pending.status]

  return (
    <>
      <div className="ag-pagehead">
        <div>
          <h1>My <span className="ag-em">orders</span></h1>
          <p>Crops you have asked for, and requests from buyers for your crops.</p>
        </div>
      </div>

      {loading ? <SkeletonTableRow cols={3} rows={6} />
        : error ? <ErrorState error={error} title="Could not load your orders" onRetry={refetch} />
          : (
            <Tabs
              label="Order type"
              value={activeTab}
              onChange={(id) => { setFilter('All'); setSp({ tab: id }, { replace: true }) }}
              tabs={[
                { id: 'buying', label: `Buying (${buying.length})`, content: panel('buyer', buying) },
                { id: 'selling', label: `Selling (${selling.length})${waiting ? ` · ${waiting} new` : ''}`, content: panel('seller', selling) },
              ]}
            />
          )}

      <ConfirmDialog
        open={Boolean(pending)}
        danger={copy?.danger}
        title={copy?.title}
        message={pending ? copy.msg(pending.order) : ''}
        confirmLabel={copy?.confirm}
        cancelLabel="Go back"
        loading={busy}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </>
  )
}
