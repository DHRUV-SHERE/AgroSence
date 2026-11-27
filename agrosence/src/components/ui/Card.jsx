/**
 * Card, Badge, Alert.
 *   <Card as="article" interactive flush>...</Card>
 *   <Badge tone="success|warning|danger|info|brand|neutral">Available</Badge>
 *   <Alert tone="info|danger|success">Message</Alert>   // role="alert" for danger
 * Use `statusTone(status)` to map order/crop statuses to a Badge tone.
 */
import { LuCircleAlert, LuCircleCheck, LuInfo } from 'react-icons/lu'
import { cx } from '../../lib/cx'

export function Card({ as: Tag = 'div', interactive, flush, flat, className, children, ...rest }) {
  return (
    <Tag className={cx('ag-card', interactive && 'ag-card--interactive', flush && 'ag-card--flush', flat && 'ag-card--flat', className)} {...rest}>
      {children}
    </Tag>
  )
}

export function Badge({ tone = 'neutral', className, children, ...rest }) {
  return <span className={cx('ag-badge', tone !== 'neutral' && `ag-badge--${tone}`, className)} {...rest}>{children}</span>
}

// eslint-disable-next-line react-refresh/only-export-components
export function statusTone(status = '') {
  const s = String(status).toLowerCase()
  if (['accepted', 'available', 'completed', 'delivered', 'active'].includes(s)) return 'success'
  if (['pending', 'processing', 'in progress'].includes(s)) return 'warning'
  if (['rejected', 'cancelled', 'canceled', 'failed', 'suspended'].includes(s)) return 'danger'
  if (s === 'sold') return 'info'
  return 'neutral'
}

export function Alert({ tone = 'info', className, children }) {
  const Icon = tone === 'danger' ? LuCircleAlert : tone === 'success' ? LuCircleCheck : LuInfo
  return (
    <div className={cx('ag-alert', `ag-alert--${tone}`, className)} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
