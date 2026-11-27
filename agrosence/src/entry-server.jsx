/* eslint-disable react-refresh/only-export-components -- server entry, never hot-reloaded */
/**
 * Build-time server entry (see scripts/prerender.mjs). Renders the public routes to static HTML with the SAME
 * component tree the browser hydrates (App.jsx -> AppContent), except pages are imported eagerly here instead of
 * React.lazy. To prerender another page: import it, add it to ROUTES below, give it an entry in src/seo/meta.js PAGES.
 */
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppContent } from './App'
import Home from './pages/Home'
import Feature from './pages/Feature'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'

const ROUTES = [
  { path: '/', component: Home, layout: 'public' },
  { path: '/Feature', component: Feature, layout: 'public' },
  { path: '/About', component: About, layout: 'public' },
  { path: '/ContactUs', component: Contact, layout: 'public' },
  { path: '/Login', component: Login, layout: 'auth' },
  { path: '/Signup', component: Signup, layout: 'auth' },
]

export const PRERENDER_PATHS = ROUTES.map((r) => r.path)

export function render(path) {
  return renderToString(
    <StaticRouter location={path}>
      <AppContent routes={ROUTES} NotFound={NotFound} />
    </StaticRouter>,
  )
}

export { headHtml, PAGES, INDEXABLE } from './seo/meta'
export { SITE_URL, CONTENT_UPDATED } from './seo/site'
export { llmsFullText } from './seo/llmsFull'
