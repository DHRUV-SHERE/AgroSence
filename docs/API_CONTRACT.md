# AgroSence API Contract (v2) — source of truth for backend, web app and admin panel

Base URL: `${VITE_API_URL}/api` (web app & admin panel read `VITE_API_URL`; dev default `http://localhost:5000`).
All requests/responses are JSON unless noted. Auth header: `Authorization: Bearer <accessToken>`.

## Envelope
- Success: `{ "success": true, "data": <payload>, "meta"?: { "page", "limit", "total", "pages" } }`
- Error: `{ "success": false, "message": "human readable", "errors"?: [{ "field", "message" }] }` with correct HTTP status (400 validation, 401 unauthenticated, 403 forbidden, 404, 409 conflict, 429 rate limited, 500).
- List endpoints accept `?page=1&limit=20&sort=-createdAt&q=search` (limit capped at 100) and return `meta`.
- Every document is serialised with `id` (string) — never leak `_id`, `password`, `__v`, refresh tokens.

## Roles (RBAC)
`user` (farmer/buyer), `moderator` (manage content: schemes, resources, contacts, crops moderation; read-only users), `admin` (everything incl. users/roles).
Role is stored on the user document and embedded in the JWT (`{ sub, role }`). Server always re-checks against DB for admin actions.
Middleware: `authenticate`, `authorize(...roles)`, `ownerOrRole(...)`.

## Auth  `/api/auth`
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /signup | public | body: name, mobile (10-digit), email, password (>=8, letter+number), confirmPassword, state, address, language(English/Hindi/Gujarati). Role always `user`. Returns `{ user, accessToken, refreshToken }` |
| POST | /login | public | body: `identifier` (mobile OR email) + password. Returns `{ user, accessToken, refreshToken }`. Rate limited + lockout after 5 failures (15 min). |
| POST | /refresh | public | body: refreshToken -> new `{ accessToken, refreshToken }` (rotation) |
| POST | /logout | auth | body: refreshToken -> revoked |
| GET | /me | auth | current user |
| PUT | /me | auth | update name,email,mobile,state,address,language, avatar (whitelist only — NEVER role/password). **Changing `email` or `mobile` (to a value different from the current one) REQUIRES `currentPassword` in the body**; see implementation notes |
| PUT | /me/password | auth | currentPassword, newPassword |
| POST | /send-otp | public | body: email. Always responds 200 generic message (no user enumeration). OTP hashed, stored in MongoDB w/ TTL index, 10 min, max 5 attempts |
| POST | /reset-password | public | email, otp, newPassword |

`user` shape: `{ id, userId, name, mobile, email, state, address, language, role, avatar?, createdAt }`

## Public content
| Method | Path | Notes |
|---|---|---|
| GET | /schemes | list (filter `state`) |
| GET | /schemes/:id | |
| GET | /resources , /resources/:id | image = absolute Cloudinary URL |
| POST | /contact | public, rate-limited, body: name,email,mobile?,address?,message (also emails the team; DB save must succeed even if email fails) |
| GET | /agriculture/faq | existing FAQ data |
| POST | /chatbot | auth optional, rate limited, body: message -> `{ answer }` |
| GET | /health | public. `{ status:"ok", uptime, db:"connected", time }`; performs a cheap DB ping + upserts a `heartbeats` doc so Atlas/Render count it as activity |

## Marketplace (auth required)
| Method | Path | Access |
|---|---|---|
| GET | /crops | any auth user (filter category, q, organic, minPrice, maxPrice, state; status=Available) |
| GET | /crops/:id | any auth |
| GET | /crops/mine | auth — my listings |
| POST | /crops | auth, multipart `cropImages` (1-4 images, <=5MB each, jpg/png/webp), seller = req.user (never trust body userId) |
| PUT | /crops/:id , DELETE /crops/:id | owner or admin/moderator |
| POST | /orders | auth buyer; body: cropId, quantity. Server computes seller & total from DB; cannot buy own crop; validates stock |
| GET | /orders/mine | auth — orders where I am buyer or seller |
| PUT | /orders/:id/status | seller only: Accepted/Rejected; buyer: Cancelled (while Pending). Accept decrements stock / marks Sold |
| GET | /notifications | auth — my notifications; PUT /notifications/:id/read ; DELETE /notifications/:id (owner only) |
| POST | /crop-detect | auth, multipart `image` -> `{ scientificName, commonNames, description, image }` |
| POST | /support | auth optional (existing support mail) |

## Admin / moderation  `/api/admin`  (authenticate + authorize)
| Method | Path | Access |
|---|---|---|
| GET | /stats | admin, moderator — `{ users, crops, orders, contacts, schemes, resources, ordersByStatus:[{status,count}], signupsByDay:[{date,count}], revenue }` |
| GET | /users , /users/:id | admin, moderator(read) |
| PUT | /users/:id | admin (name,email,mobile,state,address,language) |
| PATCH | /users/:id/role | admin only, body `{ role }`; cannot demote self / last admin |
| PATCH | /users/:id/status | admin only, `{ active:boolean }` suspend/restore |
| DELETE | /users/:id | admin only (not self) |
| GET | /contacts , DELETE /contacts/:id | admin, moderator |
| POST/PUT/DELETE | /schemes[/:id] | admin, moderator |
| POST/PUT/DELETE | /resources[/:id] (multipart `image`) | admin, moderator |
| GET | /orders , /crops | admin, moderator ; DELETE /crops/:id moderation |
| GET | /audit-logs | admin — who did what (role changes, deletes) |

## Frontend/admin conventions
- API base from env, never hard-coded localhost. Axios instance with auth header + 401 -> refresh-once -> logout.
- Tokens in localStorage keys `agro_access`, `agro_refresh`, user in `agro_user` (admin panel uses `agro_admin_*`).
- Admin panel login refuses non-admin/moderator roles.

## Implementation notes (added by backend; binding for clients)
- **Health**: `GET /api/health` returns the envelope AND the contract fields at top level: `{ success:true, data:{status,db,uptime,time}, status:"ok", db:"connected", uptime, time }`. 503 + `status:"degraded"` when DB is down.
- **Auth lockout** returns HTTP 429 (message says "locked"). Bad credentials = 401. Suspended account = 403. Signup duplicate email/mobile = 409.
- **Access token** lives 15 min (`ACCESS_TOKEN_TTL`); refresh tokens are opaque, rotate on every `/auth/refresh` (reusing an old one revokes all sessions; a duplicate within 10 s just returns 401). `/auth/refresh` returns `{ accessToken, refreshToken }`.
- `PUT /auth/me/password` body `{ currentPassword, newPassword, refreshToken? }`: revokes all other sessions. If `refreshToken` (the current one) is sent it stays valid and the response is a message; otherwise the response `data` includes a fresh `{ accessToken, refreshToken }` that the client must store.
- `/auth/send-otp` always 200 `data.message`. `/auth/reset-password` bad/expired/exhausted code = 400 "Invalid or expired verification code". Cooldown: one OTP per email per 60 s (silently skipped).
- `user` shape also has `active` (bool) and `lastLoginAt`; admin user lists are paginated envelopes (`/admin/users?page&limit&q&role&active`).
- **Crop shape**: legacy names kept: `id, cropId, cropName, cropDescription, cropCategory, cropSellingPrice, cropUnit, cropQuantity, grownOrganically("Yes"/"No"), cropImages[], cropStatus("Available"/"Sold"), sellingDate, state, createdAt, userId(seller id string)` plus `organic` (bool) and `seller:{id,name,mobile,state,address}`.
  Create (`POST /crops`, multipart): `cropName, cropDescription, cropCategory, cropSellingPrice, cropUnit, cropQuantity, grownOrganically("true"/"false"), cropImages[1-4]`. `PUT /crops/:id` accepts any of those (JSON or multipart; new images replace old) plus `cropStatus`. List filters: `category, q, organic, minPrice, maxPrice, state, sort(createdAt|cropSellingPrice|cropName|cropQuantity)`; `/crops` only returns `Available`.
- **Order shape**: `id, cropId, buyerId, sellerId, quantity, totalPrice, status(Pending|Accepted|Rejected|Cancelled), createdAt, crop:{id,cropName,cropUnit,cropImages,cropSellingPrice,cropCategory}, buyer:{id,name,mobile,state}, seller:{...}, role:"buyer"|"seller"` (role relative to caller, only on `/orders/mine` and status updates). `/orders/mine?role=buyer|seller&status=`. Accepting decrements `cropQuantity` atomically and sets the crop `Sold` at 0; rejected orders are kept (status Rejected), not deleted. Errors: own crop 400, quantity > stock 400, crop sold 409, transition not allowed 403/409.
- **Notification shape**: `id, recipientId, sellerId, buyerId, cropId, orderId, type(order_placed|order_accepted|order_rejected|order_cancelled), message, status(unread|read), createdAt`; list `meta.unread` = unread count. Buyer is notified on accept/reject, seller on new order/cancel.
- **Schemes**: `{ id, name, description, eligibility, benefits, state, applyLink, createdAt }`; `?state=` also returns "All States" schemes. **Resources**: `{ id, name, description, purpose, advantages, popularbrand, howtouse, image, link, createdAt }`. Admin write routes: `POST/PUT/DELETE /admin/schemes[/:id]`, `POST/PUT/DELETE /admin/resources[/:id]` (multipart field `image`).
- **Contact**: `POST /contact` -> 201 `{ message, emailed }`. Admin contact shape `{ id, name, mobile, email, address, message, createdAt }`.
- **FAQ**: `GET /agriculture/faq?q=text` -> `{ answer }`; without `q` -> full list `[{question,answer}]`.
- **Chatbot** `POST /chatbot {message<=500}` -> `{ answer }`; 503 if Gemini is not configured. **Crop detect** `POST /crop-detect` (auth, multipart `image`) -> `{ scientificName, commonNames[], description, image|null }`; 503 if Plant.id not configured, 404 if unidentified. **Support** `POST /support {name,email,message}` -> `{ message }` (503 if mail is not configured).
- Image uploads / 503 when Cloudinary is not configured; max 5 MB each, jpg/png/webp (magic-byte checked). 413 for oversize.
- **Audit log shape**: `{ id, actorId, actorEmail, actorRole, action, targetType, targetId, meta, ip, createdAt }` (actions: user.role_change|update|suspend|restore|delete, scheme.*, resource.*, contact.delete, crop.delete).
- Removed legacy routes: `/auth/users*`, `/crops/add`, `/crops/sell/:id`, `/crops/users/:id`, `/orders/:userId`, `/orders` (list), `/orders/analytics`, `/schemes/all|add|update|delete`, `/resources/all|add|update|delete`, `/contact/submit`, `/contact/contacts/:id`, `/notifications/:sellerId`, `/uploads` static.
- Rate limits (429 envelope): login 20/15min, signup 20/h, OTP 8/15min, contact+support 8/h, chatbot 10/10min anonymous (per IP) and 40/10min signed-in (per user), order create 30/15min, uploads 30/h, global 600/15min per IP; /health 120/15min per IP.
- **PUT /auth/me (changed)**: body may contain `name,email,mobile,state,address,language,avatar` plus **`currentPassword`** and optional **`refreshToken`** (the caller's current refresh token). If `email` or `mobile` differs from the stored value, `currentPassword` is mandatory: missing -> 400 `{ message:"Current password is required to change your email or mobile number", errors:[{field:"currentPassword"}] }`; wrong -> 400 "Current password is incorrect". Sending the unchanged email/mobile does not require it. When the **email** changes, every other session is revoked: if `refreshToken` is sent it stays valid and `data` is the user; if it is omitted `data` is the user **plus fresh `accessToken` and `refreshToken`** which the client must store (all old refresh tokens are dead). Mobile-only changes do not touch sessions. Duplicate email/mobile = 409. Rate limited with the login limiter.
- **Login lockout (changed)**: failures are counted per (account, client IP): 5 failures lock that IP for that account for 15 min (429, generic message "...temporarily locked, please try again later", no countdown); the same account can still be used from other IPs. 20 failures across all IPs add a 1-minute cooldown for the account. A correct password resets the counters.
- **Orders (changed)**: `quantity` >= 0.01; order total (quantity x price, rounded to 2 decimals) must be >= Rs 1 (400); only one Pending order per buyer per crop (409 "You already have a pending order for this crop..."); orders on crops of suspended sellers = 409. `GET /crops` hides crops of suspended sellers; `GET /crops/:id` of such a crop is 404 for regular users.
- **Crop detect (changed)**: the image is no longer stored anywhere; `image` in the response is always `null`. Daily quotas per user (UTC day): crop-detect 20, crop create/image-update 30; over quota = 429 "Daily limit reached...".
- **/support (changed)**: mail configuration problems now return a generic 503 "Could not send message right now, please try again later".
