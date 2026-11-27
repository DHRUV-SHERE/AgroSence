# AgroSence Admin Panel

Staff console for AgroSence: moderation of schemes, resources, contacts and marketplace crops, user management and audit logs.
Built with React 19, Vite, TypeScript, react-admin 5 and MUI 6 (charts via recharts).

## Setup

```bash
cd admin-panel
npm install
cp .env.example .env     # then edit VITE_API_URL
npm run dev
```

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend origin **without** `/api`, e.g. `http://localhost:5000`. The panel calls `${VITE_API_URL}/api/...` (see `docs/API_CONTRACT.md`). In dev it defaults to `http://localhost:5000`; in production builds set it explicitly (empty means same origin). |

`.env` is git-ignored; only `.env.example` is tracked.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run serve` | Preview the production build |
| `npm run type-check` | `tsc` against `tsconfig.app.json` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` | Prettier |

## Authentication

* Sign in with email or mobile + password (`POST /auth/login`). Accounts whose role is not `admin` or `moderator` are rejected and any issued session is revoked.
* Tokens live in `localStorage` under `agro_admin_access`, `agro_admin_refresh`, `agro_admin_user`.
* On a 401 the client refreshes once (`POST /auth/refresh`, single-flight, refresh token rotation) and replays the request. If refresh fails, the session is cleared and react-admin redirects to the login page.
* `authProvider.getPermissions` returns the role; `getIdentity` returns the signed-in user.

## Roles

| Area | admin | moderator |
|---|---|---|
| Dashboard / stats | yes | yes |
| Schemes, Resources (CRUD, bulk delete) | yes | yes |
| Contacts (view, delete) | yes | yes |
| Crops (view, moderate/delete) | yes | yes |
| Orders | read-only | read-only |
| Users | view, edit, change role, suspend/restore, delete | view only (no controls shown) |
| Audit logs | yes | hidden |
| My account / change password | yes | yes |

Controls the role cannot use are not rendered at all. The backend remains the authority: 403 responses surface as readable notifications and do not sign the user out.

## Layout

* `src/api/` - config, fetch client (auth headers, refresh, error mapping), shared types
* `src/authProvider.ts`, `src/dataProvider.ts` - react-admin providers for the contract (`meta.total`, `sort=-field`, `q`, multipart for image uploads, bulk delete fans out to `DELETE /:id`)
* `src/layout/` - AppBar, Menu, Layout; `src/theme.ts` - light and dark themes
* `src/pages/` - Login, Dashboard (lazy, holds the charts chunk), Profile
* `src/resources/` - one file per resource

## Deploy

`vercel.json` rewrites all routes to `index.html`. Set `VITE_API_URL` in the Vercel project settings.

### Security headers (`vercel.json`)

Every response carries a strict CSP (`script-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` and HSTS.
The CSP `connect-src` contains a **placeholder API origin**: `https://*.onrender.com`. Vercel cannot substitute env vars in `vercel.json`, so after you know your backend URL, replace it with the exact origin
(e.g. `connect-src 'self' https://agrosence-api.onrender.com`) and redeploy. If you use another API host/domain, change it too, otherwise the browser blocks API calls.

URL fields (scheme apply link, resource link) are rendered with `SafeUrlField`, which only produces links for `http(s)` URLs.
