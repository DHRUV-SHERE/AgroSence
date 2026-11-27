/**
 * Static prerender, run by `npm run build` after the client build and the SSR build:
 *   vite build  ->  dist/ (client, template = dist/index.html)
 *   vite build --ssr src/entry-server.jsx --outDir dist-ssr
 *   node scripts/prerender.mjs
 *
 * For each public route it renders the real React tree to HTML (react-dom/server) and writes dist/<route>/index.html
 * with that route's own <head> (title, description, canonical, robots, Open Graph, Twitter, JSON-LD). It also writes:
 *   dist/spa.html      empty app shell (noindex) that vercel.json serves for app routes and unknown URLs
 *   dist/sitemap.xml   indexable routes, lastmod = build date
 *   dist/llms-full.txt generated from src/seo/content.js (same copy as the page and the FAQ JSON-LD)
 *   robots.txt / llms.txt / llms-full.txt / manifest: default origin rewritten to VITE_SITE_URL when that is set
 * The build fails if a prerendered page lacks a single <h1>, a <title>, a valid JSON-LD block, or (indexable) a canonical.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

process.env.NODE_ENV = 'production' // before React loads: smaller, faster, warning-free server render
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const DEFAULT_ORIGIN = 'https://agrosence.vercel.app'

const ssr = await import(pathToFileURL(join(root, 'dist-ssr/entry-server.js')).href)
const { render, headHtml, llmsFullText, PAGES, INDEXABLE, PRERENDER_PATHS, SITE_URL } = ssr

// dist/index.html is overwritten with the prerendered Home page, so keep the pristine Vite output for re-runs.
const pristine = join(root, 'dist-ssr/template.html')
const built = readFileSync(join(dist, 'index.html'), 'utf8')
if (built.includes('<!-- seo:start')) writeFileSync(pristine, built)
const template = readFileSync(pristine, 'utf8')
const manifestPath = ['.vite/manifest.json', 'manifest.json'].map((p) => join(dist, p)).find(existsSync)
const manifest = manifestPath ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}

/** route path -> lazy page module (so its chunk + CSS are preloaded; otherwise hydration waits on a late fetch). */
const PAGE_FILE = { '/': 'Home', '/Feature': 'Feature', '/About': 'About', '/ContactUs': 'Contact', '/Login': 'Login', '/Signup': 'Signup' }

function chunkLinks(path) {
  const entry = manifest[`src/pages/${PAGE_FILE[path]}.jsx`]
  if (!entry) return ''
  const mainEntry = Object.values(manifest).find((m) => m.isEntry)
  const skip = new Set([mainEntry?.file, ...(mainEntry?.imports || []).map((k) => manifest[k]?.file)])
  const seen = new Set()
  const out = []
  const walk = (m) => {
    if (!m || seen.has(m)) return
    seen.add(m)
    if (!skip.has(m.file)) out.push(`<link rel="modulepreload" crossorigin href="/${m.file}" />`)
    for (const c of m.css || []) if (!template.includes(`/${c}`)) out.push(`<link rel="stylesheet" crossorigin href="/${c}" />`)
    for (const k of m.imports || []) walk(manifest[k])
  }
  walk(entry)
  return [...new Set(out)].join('\n    ')
}

const SEO_BLOCK = /<!-- seo:start[\s\S]*?<!-- seo:end -->/
const NOSCRIPT = /<noscript>[\s\S]*?<\/noscript>/
const ROOT = '<div id="root"></div>'
if (!SEO_BLOCK.test(template) || !template.includes(ROOT)) throw new Error('prerender: index.html is missing the seo markers or #root')

function page({ head, body, prerender, noscript = '', extraHead = '' }) {
  return template
    .replace(SEO_BLOCK, () => `${head}${extraHead ? `\n    ${extraHead}` : ''}`)
    .replace(NOSCRIPT, () => noscript)
    .replace(ROOT, () => `<div id="root"${prerender ? ` data-prerender="${prerender}"` : ''}>${body}</div>`)
}

const write = (rel, content) => {
  const file = join(dist, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
}

const problems = []
for (const path of PRERENDER_PATHS) {
  const body = render(path)
  const head = headHtml(path)
  const html = page({ head, body, prerender: path, extraHead: chunkLinks(path) })

  const h1s = (body.match(/<h1[\s>]/g) || []).length
  if (h1s !== 1) problems.push(`${path}: ${h1s} <h1> elements (need exactly 1)`)
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${path}: missing <title>`)
  if (PAGES[path].index && !html.includes('rel="canonical"')) problems.push(`${path}: missing canonical`)
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]) } catch (e) { problems.push(`${path}: invalid JSON-LD (${e.message})`) }
  }
  if (path === '/') write('index.html', html)
  else write(`${path.slice(1)}/index.html`, html)
}

// App shell for everything that is not prerendered (dashboard, unknown URLs): no content, noindex.
const noscript = `<noscript>
      <main style="font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem">
        <h1>AgroSense</h1>
        <p>AgroSense needs JavaScript for the signed-in tools. Public pages work without it:</p>
        <ul><li><a href="/">Home</a></li><li><a href="/Feature">Features</a></li><li><a href="/About">About</a></li><li><a href="/ContactUs">Contact</a></li></ul>
      </main>
    </noscript>`
write('spa.html', page({ head: headHtml(null), body: '', prerender: '', noscript }))

// sitemap.xml: indexable routes only, lastmod = build date.
const today = new Date().toISOString().slice(0, 10)
const urls = INDEXABLE.map((k) => `  <url>\n    <loc>${SITE_URL}${k}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${PAGES[k].changefreq}</changefreq>\n    <priority>${PAGES[k].priority}</priority>\n  </url>`)
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)

write('llms-full.txt', llmsFullText())

// Point the static text files at VITE_SITE_URL when it differs from the default origin.
if (SITE_URL !== DEFAULT_ORIGIN) {
  for (const f of ['robots.txt', 'llms.txt', 'llms-full.txt', 'manifest.webmanifest']) {
    const file = join(dist, f)
    if (existsSync(file)) writeFileSync(file, readFileSync(file, 'utf8').split(DEFAULT_ORIGIN).join(SITE_URL))
  }
}

if (problems.length) {
  console.error('\nPrerender checks failed:\n - ' + problems.join('\n - '))
  process.exit(1)
}
console.log(`prerendered ${PRERENDER_PATHS.join(', ')} + spa.html + sitemap.xml (${SITE_URL})`)
