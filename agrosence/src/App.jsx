/**
 * App shell: providers, router, route-level code splitting, scroll restoration, document titles,
 * error boundary and the lazy chatbot. Routes live in src/routes.jsx (do not add routes here).
 */
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes, matchPath, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ErrorBoundary, NetworkStatus, RouteFallback, ToastProvider } from './components/ui'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import { NotFoundPage, ROUTES } from './routes'
import { SITE } from './hooks/useDocumentTitle'
import Seo from './seo/Seo'
import { pageKey } from './seo/meta'

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

  // Move focus to the new page (skip the very first render) so keyboard and screen-reader users start at the top.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (hash) return
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname, hash])

  useEffect(() => {
    const match = ROUTES.find((r) => matchPath({ path: r.path, end: true }, pathname))
    const title = match ? match.title : 'Page not found'
    // Public pages get their title (and the rest of the head) from <Seo />.
    if (!pageKey(pathname)) document.title = match?.path === '/' ? `${SITE} | ${title}` : `${title} | ${SITE}`
    setAnnounce(title)
  }, [pathname])

  return <div className="ag-sr-only" role="status" aria-live="polite">{announce}</div>
}

/** Prefetch a route's chunk when the user shows intent (hover, focus, touch) and a few likely ones when idle. */
function RoutePrefetch() {
  useEffect(() => {
    const warm = (href) => {
      let path
      try { const u = new URL(href, window.location.origin); if (u.origin !== window.location.origin) return; path = u.pathname } catch { return }
      ROUTES.find((r) => matchPath({ path: r.path, end: true }, path))?.component?.preload?.()
    }
    const onIntent = (e) => { const a = e.target?.closest?.('a[href]'); if (a) warm(a.getAttribute('href')) }
    document.addEventListener('pointerover', onIntent, { passive: true })
    document.addEventListener('focusin', onIntent)
    document.addEventListener('touchstart', onIntent, { passive: true })
    let timer
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 2500))
    const id = idle(() => { timer = setTimeout(() => ['/Login', '/Signup', '/Feature'].forEach(warm), 5000) }, { timeout: 6000 })
    return () => {
      document.removeEventListener('pointerover', onIntent)
      document.removeEventListener('focusin', onIntent)
      document.removeEventListener('touchstart', onIntent)
      clearTimeout(timer)
      if (window.cancelIdleCallback && window.requestIdleCallback) window.cancelIdleCallback(id)
    }
  }, [])
  return null
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

function AppRoutes({ routes, NotFound }) {
  const by = (layout) => routes.filter((r) => r.layout === layout)
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {renderRoutes(by('public'))}
        <Route path="*" element={<NotFound />} />
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

/**
 * Everything inside the router. The build-time prerenderer (src/entry-server.jsx) renders this same tree inside a
 * StaticRouter with eagerly imported pages (`routes`), so the HTML it emits matches what the client hydrates.
 */
export function AppContent({ routes = ROUTES, NotFound = NotFoundPage }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouteEffects />
        <RoutePrefetch />
        <NetworkStatus />
        <Seo />
        <RoutedBoundary>
          <Suspense fallback={<RouteFallback />}>
            <AppRoutes routes={routes} NotFound={NotFound} />
          </Suspense>
        </RoutedBoundary>
        <LazyChatbot />
      </ToastProvider>
    </AuthProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
