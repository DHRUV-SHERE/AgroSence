/**
 * EmptyState and ErrorState.
 *   <EmptyState icon={LuSprout} title="No crops listed yet" message="List your first crop to reach buyers." action={<Button as={Link} to="/CropSell" variant="primary">List a crop</Button>} />
 *   <ErrorState error={error} onRetry={refetch} />          // uses error.message; hides retry if onRetry missing
 *   <ErrorState title="Could not load orders" message="..." />
 */
import { LuInbox, LuRefreshCw, LuTriangleAlert } from 'react-icons/lu'
import { Button } from './Button'

export function EmptyState({ icon: Icon = LuInbox, title, message, action }) {
  return (
    <div className="ag-state">
      <span className="ag-state__icon"><Icon aria-hidden="true" /></span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <div className="ag-state__actions">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="ag-state ag-state--error" role="alert">
      <span className="ag-state__icon"><LuTriangleAlert aria-hidden="true" /></span>
      <h3>{title}</h3>
      <p>{message || error?.message || 'Please try again in a moment.'}</p>
      {onRetry && (
        <div className="ag-state__actions">
          <Button variant="primary" icon={<LuRefreshCw aria-hidden="true" />} onClick={onRetry}>Try again</Button>
        </div>
      )}
    </div>
  )
}
