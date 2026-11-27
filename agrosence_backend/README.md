# AgroSence Backend

Express 4 + MongoDB (Mongoose) REST API for the AgroSence marketplace. Implements `docs/API_CONTRACT.md`.

## Quick start

```bash
npm install
cp .env.example .env        # fill in the values (see below)
npm run dev                 # nodemon, uses MONGO_URI from .env
```

### Try everything locally without any database

```bash
npm run dev:memory
```

Starts an **in-memory MongoDB** (downloaded once by `mongodb-memory-server`, ~100-700 MB cached in `node_modules/.cache`), ignores `.env`
(so it can never touch Atlas), seeds sample data and prints demo logins:

| role | login | password |
|---|---|---|
| admin | admin@agrosence.local | Admin@12345 |
| moderator | moderator@agrosence.local | Mod@12345 |
| user (4 crops) | farmer@agrosence.local | Farmer@123 |
| user | buyer@agrosence.local | Buyer@1234 |

OTP emails are printed to the console in this mode. Cloudinary / Gemini / Plant.id return `503` unless you export their keys in your shell.

## Scripts

| script | purpose |
|---|---|
| `npm start` | production start (`node server.js`; `node app.js` still works) |
| `npm run dev` | nodemon |
| `npm run dev:memory` | local API on an in-memory MongoDB with demo data |
| `npm run seed` | connects to `MONGO_URI`, creates the admin from `ADMIN_EMAIL/ADMIN_PASSWORD` if none exists, inserts sample schemes/resources **only into empty collections** |
| `npm run make-admin -- <email>` | promotes an **existing** account to admin (startup never promotes existing users) |
| `npm run sanitize-urls [-- --apply]` | one-off: finds `applyLink`/`link`/`avatar` values that are not http(s) URLs; dry run by default, `--apply` sets them to null |
| `npm test` | node:test + supertest on `mongodb-memory-server` (never touches Atlas, no external APIs called) |

## Environment variables

See `.env.example` (every variable documented, no real values). Required in production: `NODE_ENV=production`, `MONGO_URI`,
`JWT_SECRET` (32+ chars; the server refuses to start without it). Strongly recommended: `CORS_ORIGINS`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`,
Cloudinary vars, an email provider (`RESEND_API_KEY` or `SMTP_*` + `MAIL_TO`).

## Structure

```
server.js            entry: listen, DB connect with retry, admin bootstrap, self-ping, graceful shutdown
app.js               legacy entry shim (node app.js)
src/app.js           express app factory (helmet, cors, compression, sanitising, hpp, rate limits, routes, error handling)
src/config/          env (validated), db (pool + retry), cors
src/middleware/      auth (authenticate/optionalAuth), rbac (authorize/ownerOrRole), validate (zod), rateLimit, upload, errorHandler
src/controllers/     auth, crop, order, notification, content (schemes/resources/contact/support/chatbot/crop-detect), admin
src/services/        tokens (JWT + hashed rotating refresh tokens), mail (Resend/SMTP), storage (Cloudinary), ai (Gemini/Plant.id), audit, keepAlive, user
src/models/          User, Crop, Order, Notification, Scheme, Resource, Contact, RefreshToken, Otp (TTL), AuditLog, Heartbeat
src/routes/          auth, crop, order, notification, admin, public, health
scripts/             seed.js, dev-memory-db.js
tests/               auth, rbac, marketplace
```

## Endpoint overview (all under `/api`)

Envelope: `{ success, data, meta? }` / `{ success:false, message, errors? }`. Lists accept `page, limit(<=100), sort, q`.

- Auth: `POST /auth/signup | login | refresh | logout | send-otp | reset-password`, `GET|PUT /auth/me`, `PUT /auth/me/password`
- Public: `GET /schemes[/:id]`, `GET /resources[/:id]`, `GET /agriculture/faq`, `POST /contact`, `POST /chatbot`, `POST /support`, `GET /health`
- Marketplace (auth): `GET/POST /crops`, `GET /crops/mine`, `GET/PUT/DELETE /crops/:id`, `POST /orders`, `GET /orders/mine`, `PUT /orders/:id/status`,
  `GET /notifications`, `PUT /notifications/:id/read`, `DELETE /notifications/:id`, `POST /crop-detect`
- Admin (`/admin`, admin/moderator): `stats`, `users` (+`PUT`, `PATCH role|status`, `DELETE` admin only), `contacts`, `schemes`, `resources`, `orders`, `crops`, `audit-logs` (admin)

Details, shapes and deviations are in `docs/API_CONTRACT.md`.

## Security summary

JWT access token (15 min, secret from env only) + opaque refresh token stored **hashed** and rotated on every use (reuse revokes all sessions);
bcrypt cost 12; account lockout (5 failures / 15 min); rate limits (login, signup, OTP, contact/support, chatbot, uploads, global);
helmet; body size limits; zod validation with unknown-field stripping on every write (no mass assignment); NoSQL-injection sanitising + `hpp`;
role re-checked from the DB on every request (suspension/role changes apply instantly); audit log for admin actions; upload mime + magic-byte + 5 MB checks;
OTP: hashed (HMAC), MongoDB TTL index, 10 min, 5 attempts, generic responses; stack traces never returned in production.

## Hardening notes

- **Production detection**: `NODE_ENV=production` or `RENDER=true`. In production `CORS_ALLOW_LOCALHOST` defaults to false, OTP codes are never logged, `JWT_SECRET`/`MONGO_URI` are mandatory.
- **Wildcard CORS caveat**: `CORS_ORIGINS=https://*.vercel.app` lets *any* Vercel project (not only yours) call the API from a browser. Use exact origins in production.
- **Admin bootstrap**: `ADMIN_EMAIL`/`ADMIN_PASSWORD` create an admin only when no admin exists **and** the e-mail is unused. If the e-mail already has a normal account the server logs a warning and does not promote it; run `npm run make-admin -- you@example.com` yourself.
- **Login lockout**: counters live in MongoDB (`loginattempts`, atomic `$inc`-style pipeline update, TTL cleanup), keyed per (account, IP) for the 5-failure/15-min lock plus a per-account 20-failure/1-minute cooldown, so an attacker cannot lock the real owner out from another IP.
- **Crop photos** sent to `/crop-detect` are forwarded to Plant.id from memory and never stored. Daily per-user quotas: crop-detect 20, crop uploads 30 (collection `usagecounters`, TTL).
- **Privacy note**: a seller's name, state, address and mobile number are visible to every *authenticated* user who views a listing (buyers need it to contact the seller); they are never returned to anonymous visitors. Listings of suspended sellers are hidden.
- **Verifying `TRUST_PROXY` on Render**: the server logs `[config] trust proxy = N` at startup. Render puts exactly one proxy in front of the service, so keep the default `1`. To verify, send a request with a spoofed header (`curl -H "X-Forwarded-For: 1.2.3.4" https://<service>.onrender.com/api/health`) and check that your rate-limit/lockout counters are still keyed on your real IP, not `1.2.3.4`: with `TRUST_PROXY=1` Express takes the *last* entry added by Render, so a client-supplied value is ignored. If you add another proxy/CDN in front (Cloudflare), raise it to 2; too high lets clients spoof IPs, too low (0) makes everyone share Render's IP and trips limits for all users.
- **Health**: the endpoint does a real DB read on every call and writes the heartbeat only when the last one is older than 4 minutes (the 10-minute cron therefore still writes every run); limited to 120 requests / 15 min per IP.

## Deploying on Render (free tier) + Atlas

1. Atlas: create a free M0 cluster, a DB user, and allow network access `0.0.0.0/0` (Render free has no static IP). Copy the SRV connection string into `MONGO_URI`.
2. Render: **New Web Service** from the repo, root directory `agrosence_backend`, build `npm install`, start `npm start`.
3. Set env vars (see `.env.example`): `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGINS` (your two Vercel URLs, e.g. `https://my-web.vercel.app,https://my-admin.vercel.app`; previews via `https://*.vercel.app`),
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, Cloudinary, Gemini, Plant.id, and an email provider.
   Note: Render's free tier **blocks outbound SMTP ports**, so Gmail SMTP will time out there; use `RESEND_API_KEY` (HTTPS) for OTP/contact emails.
4. Health check path: `/api/health`.
5. Frontends (Vercel): set `VITE_API_URL=https://<your-service>.onrender.com`.

### Health endpoint / keep-alive

`GET /api/health` performs a real MongoDB write (single `heartbeats` document: `lastPing`, `pings`) and returns
`{ success, data:{status,db,uptime,time}, status, db, uptime, time }` (503 when the DB is unreachable). It is excluded from the global rate limiter and from logging (it has its own generous per-IP limiter).
Call it every ~10 minutes from an external cron (cron-job.org, UptimeRobot, GitHub Actions) so Render free does not sleep (15 min idle) and Atlas M0
does not pause for inactivity. Optionally set `SELF_PING_URL` (Render provides `RENDER_EXTERNAL_URL` automatically) to also ping itself every
`SELF_PING_MINUTES` (an in-process timer cannot wake a sleeping service, so keep the external cron).

## Legacy data notes

- Existing users without `role` are treated as `user`; without `active` as active. Emails are matched case-insensitively at login.
- Old resource images pointing at `/uploads/...` (local disk) no longer exist on Render; re-upload them via the admin panel (they go to Cloudinary).
- Legacy routes (`/auth/users`, `/crops/add`, `/orders/:userId`, `/schemes/all`, `/contact/submit` ...) were removed in favour of the contract paths.
