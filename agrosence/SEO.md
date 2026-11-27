# SEO / GEO / LLMO notes

Goal: public pages ship real HTML (headings, copy, links, JSON-LD) so Google, Bing and AI crawlers that do not run
JavaScript (GPTBot, ClaudeBot, PerplexityBot, CCBot, ...) can read and quote them.

## How it works

`npm run build` runs three steps:

1. `vite build` builds the client into `dist/` (template = `dist/index.html`, plus `dist/.vite/manifest.json`).
2. `vite build --ssr src/entry-server.jsx --outDir dist-ssr` builds a server bundle of the public pages.
3. `node scripts/prerender.mjs` renders each public route with `react-dom/server` and writes real HTML:

| Output | Content |
|---|---|
| `dist/index.html`, `dist/Feature/index.html`, `dist/About/index.html`, `dist/ContactUs/index.html` | full page HTML + per-route head + JSON-LD (indexable) |
| `dist/Login/index.html`, `dist/Signup/index.html` | rendered shells, `noindex` |
| `dist/spa.html` | empty app shell, `noindex`; `vercel.json` serves it for app routes and unknown URLs |
| `dist/sitemap.xml` | indexable routes, `lastmod` = build date |
| `dist/llms-full.txt` | generated from `src/seo/content.js` (same copy as the page and FAQ schema) |

The prerenderer fails the build if a page does not have exactly one `<h1>`, a `<title>`, a canonical (indexable pages)
or valid JSON-LD.

In the browser `main.jsx` calls `hydrateRoot` for a prerendered guest page and `createRoot` for everything else
(signed-in users, app routes, any URL whose path does not match the prerendered one). `src/seo/Seo.jsx` then keeps the
head in sync after client-side navigation (title, description, canonical, robots, Open Graph, Twitter, JSON-LD).

Rules for prerendered pages: no `window`/`localStorage`/`Date.now()`-dependent output at render time. Read browser
state in effects, or start from the same value on server and client (see `useTheme`).

## Files

- `src/seo/site.js` site constants; `VITE_SITE_URL` (default `https://agrosence.vercel.app`) is the canonical origin.
- `src/seo/meta.js` per-route titles/descriptions (`PAGES`), JSON-LD, head builders.
- `src/seo/content.js` definition paragraph, FAQ, steps, facts. Used by the page, the JSON-LD and `llms-full.txt`,
  so visible text and structured data cannot drift. `CONTENT_UPDATED` in `site.js` is the "last updated" date; bump it
  when public copy changes.
- `src/entry-server.jsx` list of prerendered routes. `scripts/prerender.mjs` the build step.
- `public/robots.txt`, `public/llms.txt`, `public/manifest.webmanifest`, `public/icons/*`, `public/og-image.jpg`,
  `public/favicon.ico`. `scripts/generate-brand-assets.mjs` regenerates the icons and the OG image
  (needs `npm i --no-save sharp`; it is not a project dependency).
- `vercel.json`: SPA fallback to `spa.html`, `cleanUrls`, `trailingSlash: false`, `X-Robots-Tag: noindex` for app and
  auth paths, cache headers for the SEO files. The CSP is unchanged: JSON-LD is `type="application/ld+json"`, which is
  data and is not governed by `script-src`; the only inline script is the theme bootstrap, covered by its sha256.
  If you edit that script, recompute the hash in the CSP.

## Add a new public page

1. Create the page component and add it to `src/routes.jsx` (`layout: 'public'`).
2. `src/seo/meta.js`: add an entry to `PAGES` (title < 60 chars, description < 160, `index: true`, `type`, `name`,
   `changefreq`, `priority`). It is then in the sitemap, gets canonical/OG/JSON-LD automatically.
3. `src/entry-server.jsx`: import the page and add it to `ROUTES`.
4. `scripts/prerender.mjs`: add it to `PAGE_FILE` (so its chunk is preloaded).
5. `public/robots.txt` needs nothing (everything not disallowed is allowed); add it to `public/llms.txt` if it matters
   to AI readers. Keep exactly one `<h1>`.

## Known limits

- **Real 404 status**: Vercel rewrites cannot set a status code, so unknown URLs return 200 with the noindex app shell
  and the client shows the 404 page. A true 404 would need a server (or enumerating every app route in `vercel.json`).
  `noindex` on the shell prevents soft-404 indexing.
- **Case**: Vercel serves files case-sensitively. Canonical URLs are `/Feature`, `/About`, `/ContactUs`; lowercase
  variants return the noindex shell.
- robots.txt disallows app paths, so crawlers never read their `X-Robots-Tag`; a linked URL can still appear as a bare
  URL in results. The tag is a backstop. The app pages sit behind login, so there is nothing to index there.
- The interface is English only. Users pick a preferred language (English/Hindi/Gujarati) in their profile.

## Post-deploy checklist

1. Set `VITE_SITE_URL` in Vercel if the production origin is not `https://agrosence.vercel.app` (rebuild afterwards).
2. `curl -s https://<site>/About | grep -E "<title>|canonical|<h1"` (and `-A GPTBot`, `-A ClaudeBot`) must show real HTML.
3. Google Search Console: add the property (the verification meta tag is already in `index.html`), submit
   `/sitemap.xml`, inspect `/` with URL Inspection (Live test), confirm "Page is indexable".
4. Bing Webmaster Tools: import from Search Console or add the site, submit the sitemap. (Bing also feeds ChatGPT search
   and others.)
5. Rich Results Test and validator.schema.org on `/` (Organization, WebSite, WebApplication, FAQPage) and the inner
   pages (BreadcrumbList).
6. Share the URL in a chat app / opengraph.xyz to check the 1200x630 card.
7. Check `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/manifest.webmanifest`, `/sitemap.xml` return 200 with the right
   content type.
8. Re-run Lighthouse (SEO, Accessibility, Best Practices) on the live URL.

## Monitoring AI citations

- Server/CDN logs (Vercel Logs, filter on user agents GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User,
  PerplexityBot): `ChatGPT-User`/`Claude-User`/`Perplexity-User` hits mean a person's question triggered a live fetch.
- Referrers: traffic from `chatgpt.com`, `perplexity.ai`, `claude.ai`, `copilot.microsoft.com` (add a segment in your
  analytics).
- Manual prompts: monthly, ask ChatGPT, Perplexity, Gemini, Claude and Copilot "What is AgroSense?", "How can farmers
  sell crops directly in India?", "Free platform for farmers to sell crops"; note whether the site is cited and whether
  the answer matches `llms.txt`. Fix wrong answers by making the page copy clearer, then bump `CONTENT_UPDATED`.
- Bing Webmaster Tools and Search Console performance reports show impressions for the same queries.
