/**
 * App shell: providers, router, route-level code splitting, scroll restoration, document titles,
 * error boundary and the lazy chatbot. Routes live in src/routes.jsx (do not add routes here).
 */
import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, matchPath, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ErrorBoundary, PageLoader, ToastProvider } from './components/ui'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import { NotFoundPage, ROUTES } from './routes'
import { SITE } from './hooks/useDocumentTitle'

const Chatbot = lazy(() => import('./components/chatbot/Chatbot'))
const NO_CHAT = ['/login', '/signup', '/forgot-password']

/** Scroll to top on navigation, set the document title, and announce the page to screen readers. */
function RouteEffects() {
  const { pathname, hash } = useLocation()
  const [announce, setAnnounce] = useState('')

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  useEffect(() => {
    const match = ROUTES.find((r) => matchPath({ path: r.path, end: true }, pathname))
    const title = match ? match.title : 'Page not found'
    document.title = match?.path === '/' ? `${SITE} | ${title}` : `${title} | ${SITE}`
    setAnnounce(title)
  }, [pathname])

  return <div className="ag-sr-only" role="status" aria-live="polite">{announce}</div>
}

/** Mount the chatbot only after the page is idle so it never competes with first paint. */
function LazyChatbot() {
  const { pathname } = useLocation()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const go = () => setReady(true)
    if ('requestIdleCallback' in window) { const id = window.requestIdleCallback(go, { timeout: 3000 }); return () => window.cancelIdleCallback(id) }
    const t = setTimeout(go, 1500)
    return () => clearTimeout(t)
  }, [])
  if (!ready || NO_CHAT.includes(pathname.toLowerCase().replace(/\/$/, ''))) return null
  return <Suspense fallback={null}><Chatbot /></Suspense>
}

/** Error boundary that resets when the route changes. */
function RoutedBoundary({ children }) {
  const { pathname } = useLocation()
  return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>
}

const renderRoutes = (list) => list.map((r) => {
  const Page = r.component
  return <Route key={r.path} path={r.path} element={<Page />} />
})

function AppRoutes() {
  const by = (layout) => ROUTES.filter((r) => r.layout === layout)
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {renderRoutes(by('public'))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<GuestRoute />}>{renderRoutes(by('auth'))}</Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {by('app').map((r) => {
            const Page = r.component
            return (
              <Route key={r.path} element={r.roles ? <ProtectedRoute roles={r.roles} /> : undefined}>
                <Route path={r.path} element={<Page />} />
              </Route>
            )
          })}
        </Route>
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <RouteEffects />
          <RoutedBoundary>
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
          </RoutedBoundary>
          <LazyChatbot />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
