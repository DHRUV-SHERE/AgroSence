/**
 * Per-route SEO data, JSON-LD and head-tag builders. Pure functions (no DOM at import time), used by:
 *   - scripts/prerender.mjs (build time, via the SSR bundle) to write each route's <head>
 *   - src/seo/Seo.jsx (browser) to keep the head correct after client-side navigation
 * To add a public page: add an entry to PAGES, a route in src/routes.jsx, and list it in src/entry-server.jsx.
 */
import { BRAND, BRAND_ALT, CONTENT_UPDATED, LOGO_PATH, OG_IMAGE, ORG_GITHUB, SITE_URL, absUrl } from './site'
import { FAQ, FEATURE_SUMMARY } from './content'

const KEYWORDS = 'AgroSense, AgroSence, sell crops online India, farmer marketplace, direct farmer to buyer, crop detection, government schemes for farmers, farming chatbot'

/** key = canonical path (case as served). `index:false` pages get noindex and are left out of the sitemap. */
export const PAGES = {
  '/': {
    title: 'AgroSense: Sell Crops Directly to Buyers in India',
    description: 'AgroSense (AgroSence) lets Indian farmers list crops, set their own price and sell directly to buyers. Plant ID, state-wise schemes and an AI chatbot included.',
    index: true, changefreq: 'weekly', priority: '1.0', type: 'WebPage', name: 'Home',
  },
  '/Feature': {
    title: 'AgroSense Features: Crop Market, Plant ID, Schemes',
    description: 'Explore AgroSense tools for farmers: direct crop market, plant identification from a photo, AI chatbot, farming guides, government schemes and expert advice.',
    index: true, changefreq: 'monthly', priority: '0.8', type: 'WebPage', name: 'Features',
  },
  '/About': {
    title: 'About AgroSense: A Ganpat University Farming Project',
    description: 'AgroSense is a college project from Ganpat University, Gujarat, built to put farmers in direct contact with buyers. Meet the student team and our guide.',
    index: true, changefreq: 'monthly', priority: '0.6', type: 'AboutPage', name: 'About us',
  },
  '/ContactUs': {
    title: 'Contact AgroSense: Support and Project Team',
    description: 'Contact the AgroSense team by form, email or phone. Ask about your account, a crop listing or the project. Office at Ganpat University, Kherva, Gujarat.',
    index: true, changefreq: 'yearly', priority: '0.5', type: 'ContactPage', name: 'Contact us',
  },
  '/Login': { title: 'Log in | AgroSense', description: 'Log in to your AgroSense account to sell crops, track orders and use farming tools.', index: false, name: 'Log in' },
  '/Signup': { title: 'Create your free account | AgroSense', description: 'Create a free AgroSense account to list your crops and sell directly to buyers.', index: false, name: 'Sign up' },
}

const norm = (p = '/') => (p.length > 1 ? p.replace(/\/+$/, '') : p)
const BY_LOWER = Object.fromEntries(Object.keys(PAGES).map((k) => [k.toLowerCase(), k]))
/** Canonical key for a pathname (case-insensitive), or null for non-SEO (app/unknown) routes. */
export const pageKey = (pathname) => BY_LOWER[norm(pathname).toLowerCase()] ?? null
export const INDEXABLE = Object.keys(PAGES).filter((k) => PAGES[k].index)

/** Generic private head for the SPA shell (app routes, unknown URLs). */
export const PRIVATE_PAGE = { title: BRAND, description: 'AgroSense helps Indian farmers sell crops directly to buyers.', index: false }

const orgNode = () => ({
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: BRAND,
  alternateName: BRAND_ALT,
  url: absUrl('/'),
  logo: { '@type': 'ImageObject', url: `${SITE_URL}${LOGO_PATH}`, width: 512, height: 512 },
  description: 'AgroSense is a farmer marketplace and toolkit built by students of Ganpat University, Gujarat, India.',
  sameAs: [ORG_GITHUB],
  address: { '@type': 'PostalAddress', streetAddress: 'U.V. Patel College of Engineering, Ganpat University', addressLocality: 'Kherva', addressRegion: 'Gujarat', addressCountry: 'IN' },
  contactPoint: [{
    '@type': 'ContactPoint', contactType: 'customer support', email: 'projectagrosence2024@gmail.com', telephone: '+91-90238-97448',
    areaServed: 'IN', availableLanguage: ['English', 'Hindi', 'Gujarati'],
  }],
})

const siteNode = () => ({
  '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: absUrl('/'), name: BRAND, alternateName: BRAND_ALT,
  inLanguage: 'en', publisher: { '@id': `${SITE_URL}/#organization` },
})

const appNode = () => ({
  '@type': 'WebApplication', '@id': `${SITE_URL}/#app`, name: BRAND, alternateName: BRAND_ALT, url: absUrl('/'),
  applicationCategory: 'BusinessApplication', operatingSystem: 'Any (web browser)', browserRequirements: 'Requires JavaScript',
  description: 'Web platform where farmers sell crops directly to buyers, with plant identification, government scheme listings, farming resources, expert advice and an AI chatbot.',
  featureList: FEATURE_SUMMARY, inLanguage: ['en', 'hi', 'gu'], isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  provider: { '@id': `${SITE_URL}/#organization` }, image: `${SITE_URL}${OG_IMAGE.path}`,
})

const faqNode = () => ({
  '@type': 'FAQPage', '@id': `${SITE_URL}/#faq`, url: `${SITE_URL}/#faq`, inLanguage: 'en',
  mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})

const crumbs = (key) => ({
  '@type': 'BreadcrumbList', '@id': `${absUrl(key)}#breadcrumb`,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: absUrl('/') },
    { '@type': 'ListItem', position: 2, name: PAGES[key].name, item: absUrl(key) },
  ],
})

/** JSON-LD object (single @graph) for a canonical page key, or null when the page carries none. */
export function jsonLdFor(key) {
  const p = PAGES[key]
  if (!p || !p.index) return null
  const page = {
    '@type': p.type, '@id': `${absUrl(key)}#webpage`, url: absUrl(key), name: p.title, description: p.description,
    inLanguage: 'en', isPartOf: { '@id': `${SITE_URL}/#website` }, dateModified: CONTENT_UPDATED,
    primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}${OG_IMAGE.path}`, width: OG_IMAGE.width, height: OG_IMAGE.height },
  }
  if (key === '/') return { '@context': 'https://schema.org', '@graph': [orgNode(), siteNode(), { ...page, about: { '@id': `${SITE_URL}/#app` } }, appNode(), faqNode()] }
  if (key === '/About') page.about = { '@id': `${SITE_URL}/#organization` }
  if (key === '/ContactUs') page.mainEntity = { '@id': `${SITE_URL}/#organization` }
  return { '@context': 'https://schema.org', '@graph': [orgNode(), siteNode(), page, crumbs(key)] }
}

const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
const ROBOTS_NOINDEX = 'noindex, nofollow'

/** Desired head entries for a page (canonical key) or the private fallback. */
export function headSpec(key) {
  const p = key ? PAGES[key] : PRIVATE_PAGE
  const indexable = Boolean(p.index)
  const url = key ? absUrl(key) : null
  const img = `${SITE_URL}${OG_IMAGE.path}`
  const meta = [
    ['name', 'description', p.description],
    ['name', 'robots', indexable ? ROBOTS_INDEX : ROBOTS_NOINDEX],
  ]
  if (indexable) {
    meta.push(
      ['name', 'keywords', KEYWORDS], ['name', 'author', 'Team AgroSense'],
      ['property', 'og:type', 'website'], ['property', 'og:site_name', BRAND], ['property', 'og:locale', 'en_IN'],
      ['property', 'og:title', p.title], ['property', 'og:description', p.description], ['property', 'og:url', url],
      ['property', 'og:image', img], ['property', 'og:image:width', String(OG_IMAGE.width)], ['property', 'og:image:height', String(OG_IMAGE.height)],
      ['property', 'og:image:alt', OG_IMAGE.alt],
      ['name', 'twitter:card', 'summary_large_image'], ['name', 'twitter:title', p.title], ['name', 'twitter:description', p.description],
      ['name', 'twitter:image', img], ['name', 'twitter:image:alt', OG_IMAGE.alt],
    )
  }
  return { title: p.title, meta, canonical: indexable ? url : null, jsonLd: key ? jsonLdFor(key) : null }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** JSON for an inline <script>: escape characters that could end the script block. */
export const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

/** Head markup (string) for the prerenderer. */
export function headHtml(key) {
  const s = headSpec(key)
  const out = [`<title>${esc(s.title)}</title>`]
  for (const [attr, name, content] of s.meta) out.push(`<meta ${attr}="${esc(name)}" content="${esc(content)}" data-seo />`)
  if (s.canonical) out.push(`<link rel="canonical" href="${esc(s.canonical)}" data-seo />`)
  if (s.jsonLd) out.push(`<script type="application/ld+json" data-seo>${safeJson(s.jsonLd)}</script>`)
  return out.join('\n    ')
}

/** Browser: reconcile <head> with the spec for this route. `key` null = private/app route. */
export function applyHead(key, { setTitle = true } = {}) {
  const s = headSpec(key)
  const head = document.head
  if (setTitle) document.title = s.title
  const wanted = new Set(s.meta.map(([attr, name]) => `${attr}:${name}`))
  for (const el of head.querySelectorAll('meta[data-seo]')) {
    const id = `${el.hasAttribute('property') ? 'property' : 'name'}:${el.getAttribute('property') || el.getAttribute('name')}`
    if (!wanted.has(id)) el.remove()
  }
  for (const [attr, name, content] of s.meta) {
    let el = head.querySelector(`meta[${attr}="${name}"]`)
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); head.appendChild(el) }
    el.setAttribute('content', content)
    el.setAttribute('data-seo', '')
  }
  let link = head.querySelector('link[rel="canonical"]')
  if (s.canonical) {
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; link.setAttribute('data-seo', ''); head.appendChild(link) }
    link.href = s.canonical
  } else link?.remove()
  const ld = head.querySelector('script[type="application/ld+json"][data-seo]')
  const json = s.jsonLd ? safeJson(s.jsonLd) : null
  if (!json) ld?.remove()
  else if (!ld) { const el = document.createElement('script'); el.type = 'application/ld+json'; el.setAttribute('data-seo', ''); el.textContent = json; head.appendChild(el) }
  else if (ld.textContent !== json) ld.textContent = json
}
