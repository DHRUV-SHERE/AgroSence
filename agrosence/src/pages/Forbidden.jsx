/** 403 page. Shown by <ProtectedRoute roles=[...]> when the signed-in user lacks the role. Also routable at /403. */
import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export default function Forbidden() {
  return (
    <div className="ag-status">
      <p className="ag-status__code" aria-hidden="true">403</p>
      <h1>This area is not open to your account</h1>
      <p>You are signed in, but your role does not have access to this page. If you think this is a mistake, contact the AgroSense team.</p>
      <div className="ag-cluster" style={{ justifyContent: 'center' }}>
        <Button as={Link} to="/dashboard" variant="primary">Go to dashboard</Button>
        <Button as={Link} to="/ContactUs">Contact us</Button>
      </div>
    </div>
  )
}
