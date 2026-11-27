/** Site-wide SEO constants. VITE_SITE_URL overrides the canonical origin (no trailing slash). */
export const SITE_URL = String(import.meta.env.VITE_SITE_URL || 'https://agrosence.vercel.app').replace(/\/+$/, '')
export const BRAND = 'AgroSense'
export const BRAND_ALT = ['AgroSence', 'Team AgroSense']
export const ORG_GITHUB = 'https://github.com/AgroSence'
export const OG_IMAGE = { path: '/og-image.jpg', width: 1200, height: 630, alt: 'AgroSense: a farmer walking through terraced rice fields, with the line "Sell your harvest. Keep the price."' }
export const LOGO_PATH = '/icons/icon-512.png'
/** Date (YYYY-MM-DD) the public copy was last reviewed. Shown on pages and used as dateModified. Update it when you change copy. */
export const CONTENT_UPDATED = '2026-11-27'
export const absUrl = (path = '/') => `${SITE_URL}${path === '/' ? '/' : path}`
