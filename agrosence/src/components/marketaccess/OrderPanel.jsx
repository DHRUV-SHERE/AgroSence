/** Order request panel on the crop detail page. POST /orders { cropId, quantity }; the server computes the total. */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LuSend } from 'react-icons/lu'
import { Alert, Button, Card, Input, useToast } from '../ui'
import { http } from '../../lib/api'
import { invalidate } from '../../hooks/useFetch'
import { formatINR, formatNumber } from '../../lib/format'
import '../../styles/pages-market.css'

export default function OrderPanel({ crop, isOwner }) {
  const toast = useToast()
  const [qty, setQty] = useState('1')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [placed, setPlaced] = useState(false)

  if (isOwner) {
    return (
      <Card className="ag-buy">
        <h2>This is your listing</h2>
        <p className="ag-muted" style={{ margin: 0 }}>Buyers send you order requests. You can accept or reject each one in your orders.</p>
        <Button as={Link} to="/product">Manage my listings</Button>
      </Card>
    )
  }
  if (crop.status !== 'Available' || crop.quantity <= 0) {
    return <Alert tone="info">This crop is sold out. Check the market for similar crops.</Alert>
  }

  const n = Number(qty)
  const total = Number.isFinite(n) && n > 0 ? n * crop.price : 0

  const submit = async (e) => {
    e.preventDefault()
    if (!Number.isFinite(n) || n <= 0) return setError('Enter how much you want to buy.')
    if (n > crop.quantity) return setError(`Only ${formatNumber(crop.quantity)} ${crop.unit} available.`)
    setError('')
    setBusy(true)
    try {
      await http.post('/orders', { cropId: crop.id, quantity: n })
      invalidate('/orders'); invalidate('/notifications')
      setPlaced(true)
      toast.success('The seller has been notified. You will hear back soon.', { title: 'Order request sent' })
    } catch (err) {
      setError(err.fieldErrors?.quantity || err.message)
      if (err.status === 409) invalidate('/crops')
    } finally {
      setBusy(false)
    }
  }

  if (placed) {
    return (
      <Card className="ag-buy">
        <Alert tone="success">Order request sent for {formatNumber(n)} {crop.unit}, {formatINR(total)}. The seller will accept or reject it.</Alert>
        <Button as={Link} to="/OrderHistory" variant="primary">View my orders</Button>
        <Button variant="ghost" onClick={() => setPlaced(false)}>Order more</Button>
      </Card>
    )
  }

  return (
    <Card as="form" className="ag-buy" onSubmit={submit} noValidate>
      <h2>Request this crop</h2>
      <Input
        label={`Quantity (${crop.unit})`}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        max={crop.quantity}
        value={qty}
        onChange={(e) => { setQty(e.target.value); setError('') }}
        error={error}
        help={`${formatNumber(crop.quantity)} ${crop.unit} available`}
        required
      />
      <div className="ag-buy__total"><span>Total</span><strong>{formatINR(total, { decimals: total % 1 ? 2 : 0 })}</strong></div>
      <Button type="submit" variant="primary" size="lg" block loading={busy} icon={<LuSend aria-hidden="true" />}>Send order request</Button>
      <small className="ag-muted">No payment is taken here. Agree delivery and payment with the seller once they accept.</small>
    </Card>
  )
}
