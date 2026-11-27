# AgroSense web app: design system

Source of truth for tokens is `src/styles/tokens.css`. This document explains the decisions; the CSS holds the values.
Product register: an app people use to get something done (sell a crop, check a leaf, read a scheme), plus a public
landing site. Operate mode inside the app, Persuade mode on Home.

## Direction: "clean field-green"

A professional, neutral-first UI: cool off-white surfaces, deep forest green for action and brand, turmeric kept as a
small highlight. Calm and fast, built for farmers on mid-range phones and slow networks. Signature moves: ledger rows
(`.ag-ledger`: label, dotted leader, value) for any list of facts, ruled feature rows instead of identical card grids,
and a single bold-green phrase per heading (`.ag-em`, not italic, max one per page).
(Legacy token names stay: `--clay` is now the forest-green primary, `--turmeric` the highlight.)

## Palette (light / dark values live in tokens.css)

| Token | Light | Role |
|---|---|---|
| `--paper` | #f5f8f6 | page background |
| `--surface`, `--surface-2` | #ffffff, #f9fbfa | cards, inputs, sidebar |
| `--paper-2` | #ebf0ed | wells, hover, skeleton base |
| `--ink`, `--ink-2`, `--ink-3` | #0f1f17, #43544a, #5c6d63 | text primary / secondary / tertiary (>= 4.5:1 on paper) |
| `--line`, `--line-strong` | #d9e2dc, #b9c6bd | hairlines, input borders |
| `--clay` (+`-hover`, `-soft`, `--on-clay`) | #1b6b3a | primary action, links, brand (forest green) |
| `--turmeric` (+`-soft`, `--on-turmeric`) | #d99a0b | highlight, active-nav underline, CTA band. Never body text |
| `--leaf` (+`-soft`) | #2d7a3e | success, available, growth |
| `--indigo` (+`-soft`) | #2456a4 | info, focus ring |
| `--danger` (+`-soft`) | #b42318 | errors, destructive |

Rules: `--clay` is the only filled call-to-action colour (one primary button per view). Never hard-code hex in
components; use tokens. Dark mode (`[data-theme="dark"]` or OS preference) swaps the full set (near-black green
surfaces, bright green primary `#4cc27a` with dark `--on-clay`). Toggle with `useTheme()` / `<ThemeToggle />`.

## Typography

- One family: **Inter Variable**, self-hosted (`@fontsource-variable/inter`, latin + latin-ext; the latin file is
  preloaded from `/fonts/`). Metric-matched "Inter Fallback" (Arial with size-adjust/ascent overrides) prevents CLS on swap.
  `font-display: swap`. No third-party font requests.
- Hindi and Gujarati: Noto Sans Devanagari / Gujarati variable subsets (`styles/fonts-indic.css`), imported lazily after
  the load event; unicode-range means a file downloads only when that script is on the page. Put `lang="hi"` / `lang="gu"`
  on translated text.
- Scale (fluid): `--fs-xs` .78rem, `--fs-sm` .875, `--fs-base` 1, `--fs-md` 1.125, `--fs-lg` 1.375, `--fs-xl` 1.5 to 1.9,
  `--fs-2xl` 1.9 to 2.7, `--fs-3xl` 2.3 to 3.75, `--fs-display` 2.6 to 5.25 (hero only).
- Long prose keeps a readable measure (`--measure` 68ch, `.ag-prose`, `.ag-lede`); everything else uses the full width.
  Headings use `text-wrap: balance`. Tabular numerals for money and counts (`.ag-num`).
- No all-caps headings. Small uppercase labels (`.ag-dash h2`, table heads) are 0.78 to 0.875rem with 0.06 to 0.08em tracking.

## Spacing, radius, elevation

- 4px scale `--s-1` .25rem to `--s-9` 7rem. Page gutter `--gutter` = clamp(1rem, 3vw, 3rem). Section rhythm `--section` (56 to 104px).
  Group tightly (`--s-2`/`--s-3`), separate generously (`--s-6`+). More space above a heading than below.
- Radius: `--r-sm` 6, `--r` 10 (controls), `--r-lg` 14 (cards, modals), `--r-pill`.
- Shadows `--shadow-1..3` are green-black tinted with real offset and soft blur. No hard offset shadows, no coloured glows.
  Cards rest at shadow-1; raise to shadow-3 only on hover of interactive cards, popovers and modals.
- Do not nest cards. Prefer ruled rows (`.ag-featlist`, `.ag-ledger`, `.ag-orderlist`) over grids of identical cards.

## Motion

- One authored moment: the Home headline rises line by line on load (420ms). Never fade the LCP image in.
- Everywhere else motion is functional: 120 to 220ms hover/press feedback, `--ease-out` (`cubic-bezier(.16,1,.3,1)`),
  160ms route fade (`.ag-page`), toast/popover/modal entrance, chat typing dots, skeleton shimmer.
- Animate transform/opacity (and clip/shadow where smooth). Never animate layout properties.
- `prefers-reduced-motion` collapses all animation globally (base.css). Do not add motion libraries.

## Components (src/components/ui, import from `../components/ui`)

Button (primary/secondary/accent/ghost/danger, sm/md/lg, `loading`, `as={Link}`), IconButton (`label` required), Input,
PasswordInput, Select, Textarea, Checkbox (label + help + error wired with aria), Card, Badge (`statusTone()` maps
order/crop status), Alert, Modal (native dialog), ConfirmDialog, Tabs, Toast (`useToast`), Spinner, PageLoader,
Skeleton family (+`ProductCardSkeleton`, `ProductGridSkeleton`), EmptyState, ErrorState (retry), Pagination (contract
`meta`), ErrorBoundary, Logo, Avatar, ThemeToggle.

Do:
- One primary button per view; label controls with the action ("List crop", not "Submit").
- Every data view has all four states: loading (skeleton shaped like the content), empty (say what to do next), error
  (name the problem and offer retry), content.
- Field errors name the problem and the fix ("Use at least 8 characters with a letter and a number").
- Minimum 44px touch targets; visible focus ring (3px indigo) is never removed.
- Currency via `formatINR`, dates via `formatDate`; images with `loading="lazy" decoding="async"` and width/height.

Don't:
- Bootstrap classes, inline hex colours, emoji or unicode glyphs as icons (use `react-icons/lu`, one stroke weight).
- Gradient text, glassmorphism as decoration, coloured side-borders on cards/alerts, modal-for-everything.
- Section numbers, kickers, hero-metric tiles (big number + small label), identical icon-card grids as page structure.

## Copy tone

Plain, respectful, direct; like a knowledgeable neighbour, not a startup. Short sentences. Say what the thing does for
the farmer ("Sell your harvest. Keep the price."). No jargon ("leverage", "seamless", "AI-powered" as a headline).
Sentence case everywhere. Errors never blame the user. Mention the three languages (English, Hindi, Gujarati) where it helps.

## Layout and responsive

- **Full-width, fluid.** `.ag-container` is `width: 100%` with `padding-inline: var(--gutter)` and only an ultrawide cap
  (`--maxw` 120rem, centred). Grids use `repeat(auto-fill/auto-fit, minmax(min(100%, X), 1fr))` so columns grow with the
  viewport; prose blocks keep `--measure`. Forms stay readable (`.ag-sellwrap` 64rem).
- Public pages: `PublicLayout` (header + footer). Breakpoints: 40rem, 52rem, 62rem.
- App pages: `AppLayout` (sidebar >= 62rem, drawer below); `.ag-content` fills the space beside the sidebar (cap 120rem).
  Start pages with `.ag-pagehead`. Grids via `.ag-grid` with `--min`.
- Design mobile first; verify at 360, 768, 1280, 1920, 2560. No horizontal page scroll.

## Performance and loading rules

- Marketing pages (Home, Feature, About, Contact) have **zero API dependency**. Only the LCP image gets
  `fetchPriority="high"`; every other image is `loading="lazy" decoding="async"` with width/height + a background colour.
- API images: `imageUrl(src, { width })` / `srcSet(src, [w1, w2, w3])` add Cloudinary `f_auto,q_auto,c_limit,w_N`. Always pass `sizes`.
- Local images are webp, sized for their slot (<= 100KB); hero has 480/720 variants via `srcSet`.
- Data: `useFetch` dedupes, caches in memory and (for /agriculture, /resources, /schemes) in sessionStorage, shows cached
  data instantly and revalidates. `http.get` retries network/502/503/504 with backoff. A request pending > 4s shows
  "Waking up the server" (`NetworkStatus`); a thin top progress bar shows any loading. Pages paint skeletons first.
- Routes: `page()` in routes.jsx adds `.preload()`; App.jsx prefetches chunks on hover/focus/touch and Login/Signup/Feature when idle.
- `warmUpApi()` (main.jsx) + a preconnect/prefetch in index.html wake the free-tier API on first load.
