import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/ui.css'
import './styles/layout.css'
import './styles/pages.css'
import './styles/seo.css'
import App from './App.jsx'
import { warmUpApi } from './lib/api'

// Wake the API (Render free tier cold-starts in ~50s) while the visitor reads the page. Non-blocking.
warmUpApi()
// Hindi/Gujarati font faces (230KB, unicode-range): only worth loading when a page shows real Indic text (a few words fall back to system fonts).
window.addEventListener('load', () => {
  setTimeout(() => {
    const indic = (document.body.innerText.match(/[ऀ-૿]/g) || []).length
    if (indic > 40) import('./styles/fonts-indic.css')
  }, 3000)
}, { once: true })

const container = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Public pages are prerendered (scripts/prerender.mjs) and tagged with data-prerender="<path>". Hydrate them for
// guests; signed-in users (whose first render differs: dashboard buttons, etc.) and every other URL render fresh.
const served = container.dataset.prerender
const here = location.pathname.replace(/\/+$/, '') || '/'
let signedIn = false
try { signedIn = Boolean(localStorage.getItem('agro_access')) } catch { /* storage unavailable */ }

if (served && served.toLowerCase() === here.toLowerCase() && !signedIn) hydrateRoot(container, app)
else createRoot(container).render(app)
