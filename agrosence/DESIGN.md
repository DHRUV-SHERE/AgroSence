# AgroSense web app: design system

Source of truth for tokens is `src/styles/tokens.css`. This document explains the decisions; the CSS holds the values.
Product register: an app people use to get something done (sell a crop, check a leaf, read a scheme), plus a public
landing site. Operate mode inside the app, Persuade mode on Home.

## Direction: "khadi paper and the mandi ledger"

A farmer's world in India is warm, tactile and written in ledgers: khadi paper, red-brown clay, turmeric, indigo dye,
the dotted rule lines of a mandi rate board. The UI uses that palette instead of the generic green-gradient SaaS look.
Green appears only where it means growth (success, "available"). The signature moves:

1. **Furrow lines**: faint curved field rows as a texture behind the Home hero.
2. **Ledger rows** (`.ag-ledger`): label, dotted leader, value. Used for figures (dashboard "Your ledger"). Reuse it
   for any list of facts: order summary, crop specs, price tables.
3. **Arch photo frame**: hero photography in a doorway arch with a turmeric sun disc.
4. **Fraunces italic emphasis**: one phrase per heading can be `.ag-em` (clay, italic). Max one per page.

## Palette (light / dark values live in tokens.css)

| Token | Light | Role |
|---|---|---|
| `--paper` | #F7F1E3 | page background (khadi) |
| `--surface`, `--surface-2` | #FFFBF2, #FBF4E4 | cards, inputs, sidebar |
| `--paper-2` | #EFE6D2 | wells, hover, skeleton base |
| `--ink`, `--ink-2`, `--ink-3` | #2A2118, #5C4E40, #75665A | text primary / secondary / tertiary (all >= 4.5:1 on paper) |
| `--line`, `--line-strong` | #DDD0B8, #C4B393 | hairlines, input borders |
| `--clay` (+`-hover`, `-soft`, `--on-clay`) | #A8401F | primary action, links, brand |
| `--turmeric` (+`-soft`, `--on-turmeric`) | #E3A21A | highlight, active-nav underline, avatar. Never as body text |
| `--leaf` (+`-soft`) | #35692F | success, available, growth |
| `--indigo` (+`-soft`) | #2F4286 | info, focus ring |
| `--danger` (+`-soft`) | #B42318 | errors, destructive |

Rules: clay is the only filled call-to-action colour (one primary button per view). Turmeric is for emphasis, never
for text on paper. Never hard-code hex in components; use tokens. Dark mode (`[data-theme="dark"]` or OS preference)
swaps the full set: dark soil background, brighter clay/turmeric. Toggle with `useTheme()` / `<ThemeToggle />`.

## Typography

- Display: **Fraunces** (variable serif, optical size) for headings. Body/UI: **Hind** (humanist sans, large x-height).
- Hindi and Gujarati: fallbacks `Noto Sans Devanagari` / `Noto Sans Gujarati` (body) and `Noto Serif Devanagari` /
  `Noto Serif Gujarati` (display) are in the font stacks; Google Fonts serves them by unicode-range, so they cost nothing
  until used. Put `lang="hi"` / `lang="gu"` on translated text.
- Scale (fluid): `--fs-xs` .78rem, `--fs-sm` .875, `--fs-base` 1, `--fs-md` 1.125, `--fs-lg` 1.375, `--fs-xl` 1.5 to 1.9,
  `--fs-2xl` 1.9 to 2.7, `--fs-3xl` 2.3 to 3.75, `--fs-display` 2.6 to 5.25 (hero only).
- Body measure 68ch (`--measure`). Headings use `text-wrap: balance`. Tabular numerals for money and counts (`.ag-num`).
- No all-caps headings. Small uppercase labels (`.ag-dash h2`, table heads) are 0.78 to 0.875rem with 0.06 to 0.08em tracking.
- No eyebrows/kickers above headings. The heading carries the weight.

## Spacing, radius, elevation

- 4px scale `--s-1` .25rem to `--s-9` 7rem. Page gutter `--gutter` (16 to 32px). Section rhythm `--section` (56 to 104px).
  Group tightly (`--s-2`/`--s-3`), separate generously (`--s-6`+). More space above a heading than below.
- Radius: `--r-sm` 6, `--r` 10 (controls), `--r-lg` 18 (cards, modals), `--r-pill`.
- Shadows `--shadow-1..3` are warm brown with real offset and soft blur. No hard offset shadows, no coloured glows.
  Cards rest at shadow-1; raise to shadow-3 only on hover of interactive cards, popovers and modals.
- Do not nest cards. Prefer ruled rows (`.ag-featlist`, `.ag-ledger`, `.ag-orderlist`) over grids of identical cards.

## Motion

- One authored moment: the Home headline rises line by line on load (`.ag-hero__line`), plus the hero photo fade.
- Everywhere else motion is functional: 120 to 220ms hover/press feedback, `--ease-out` (`cubic-bezier(.16,1,.3,1)`),
  short route fade (`.ag-page`), toast/popover/modal entrance, chat typing dots, skeleton shimmer.
- Animate transform/opacity (and clip/shadow where smooth). Never animate layout properties.
- `prefers-reduced-motion` collapses all animation globally (base.css). Do not add motion libraries to new pages;
  framer-motion remains installed only for legacy pages and is in its own chunk.

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

- Public pages: `PublicLayout` (header + footer), content in `.ag-container` sections. Breakpoints: 40rem, 52rem, 62rem.
- App pages: `AppLayout` (sidebar >= 62rem, drawer below), content gets `.ag-content` (max 80rem). Start pages with
  `.ag-pagehead` (h1 + description + actions). Grids via `.ag-grid` with `--min`.
- Design mobile first; verify at 390px. No horizontal page scroll.
