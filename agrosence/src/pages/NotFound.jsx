/** 404 page. Rendered by the catch-all route inside PublicLayout. */
import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export default function NotFound() {
  return (
    <div className="ag-status">
      <p className="ag-status__code" aria-hidden="true">404</p>
      <h1>This field is empty</h1>
      <p>We could not find the page you were looking for. It may have moved, or the link may be mistyped.</p>
      <div className="ag-cluster" style={{ justifyContent: 'center' }}>
        <Button as={Link} to="/" variant="primary">Back to home</Button>
        <Button as={Link} to="/dashboard">Go to dashboard</Button>
      </div>
    </div>
  )
}
