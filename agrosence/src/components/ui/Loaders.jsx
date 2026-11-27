/**
 * Spinner (inline) and PageLoader (fills a page/route while loading).
 *   <Spinner />  <Spinner large />      <PageLoader label="Loading your orders" />
 */
import { cx } from '../../lib/cx'

export function Spinner({ large, className, label }) {
  return <span className={cx('ag-spinner', large && 'ag-spinner--lg', className)} role={label ? 'status' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />
}

export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="ag-pageloader" role="status" aria-live="polite">
      <Spinner large />
      <span>{label}…</span>
    </div>
  )
}
