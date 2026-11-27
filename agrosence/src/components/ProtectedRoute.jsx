/**
 * Route guards (used from the route table in App.jsx).
 *
 *   <ProtectedRoute>                      signed-in users only; guests go to /login (remembering where they were going)
 *   <ProtectedRoute roles={['admin']}>    also requires one of the roles; others see the 403 page
 *   <GuestRoute>                          login/signup/forgot: signed-in users are sent to /dashboard
 *
 * Both render `children` or, when used as a layout route, an <Outlet />.
 * While the stored session is being verified, a PageLoader is shown (no flash of the login page).
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from './ui'
import Forbidden from '../pages/Forbidden'

export function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, loading, hasRole } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader label="Checking your session" />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles?.length && !hasRole(...roles)) return <Forbidden />
  return children ?? <Outlet />
}

export function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />
  return children ?? <Outlet />
}

export default ProtectedRoute
