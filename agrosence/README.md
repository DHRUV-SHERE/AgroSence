# AgroSense web app (React 18 + Vite)

```
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm install
npm run dev              # http://localhost:5173
npm run build
```
Backend: `agrosence_backend` (`npm run dev:memory` runs it on an in-memory MongoDB). API contract: `../docs/API_CONTRACT.md`.
Design system: [DESIGN.md](DESIGN.md).

## Structure
```
src/
  App.jsx            providers, router, lazy routes, error boundary, scroll/title handling
  routes.jsx         THE route table (path, lazy component, title, layout, roles, legacy flag)
  lib/               api.js (http client), tokens.js, format.js, imageUrl.js, validate.js, navigation.js, cx.js
  context/           AuthContext.jsx  (useAuth)
  hooks/             useFetch (+useMutation, invalidate), useNotifications, useTheme, useDocumentTitle
  layouts/           PublicLayout (+Header, Footer), AppLayout (sidebar/topbar), Popover
  components/ui/     design-system primitives (import from '../components/ui')
  components/        ProtectedRoute, AuthShell, chatbot/, and legacy feature components
  pages/             one file per route
  styles/            tokens.css, base.css, ui.css, layout.css, pages.css, legacy.* (Bootstrap, legacy pages only)
```

## Building a page
```jsx
import { http } from '../lib/api'
import { useFetch } from '../hooks/useFetch'
import { Card, ProductGridSkeleton, ErrorState, EmptyState, Pagination } from '../components/ui'

const { data, meta, loading, error, refetch } = useFetch('/crops', { params: { page, limit: 12 } })
```
Register it in `src/routes.jsx` with `layout: 'app'` (authenticated shell) or `'public'`. Do not import Header/Footer/Layout
in a page; the layout provides them. Read the header comment at the top of each module in `lib/`, `hooks/`, `context/`,
`components/ui/` for usage.

## Legacy pages
Pages flagged `legacy: true` in `routes.jsx` still use Bootstrap/react-bootstrap and the old axios calls with
`localStorage.authToken`. `components/Header.jsx`, `Footer.jsx`, `dashboard/Layout.jsx` are shims over the new layouts so
they look consistent meanwhile. `src/resource.js` is the old asset map. When a page is migrated, delete its legacy
imports; once none remain, delete `src/styles/legacy.*`, the shims, `src/resource.js`, and the `bootstrap`,
`react-bootstrap`, `framer-motion` dependencies.
