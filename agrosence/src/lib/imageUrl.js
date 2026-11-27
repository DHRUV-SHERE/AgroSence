/**
 * Resolve a backend image reference to something an <img> can load.
 *
 *   import { imageUrl, srcSet, PLACEHOLDER_IMG } from '../lib/imageUrl'
 *   <img src={imageUrl(crop.images?.[0], { width: 480 })} srcSet={srcSet(url, [320, 640, 960])} loading="lazy" decoding="async" width="480" height="360" alt="..." />
 *
 * - Absolute http(s)/data/blob URLs pass through. Cloudinary URLs get f_auto,q_auto and optional width.
 * - Relative paths ("/uploads/x.jpg") are served from the API origin.
 * - Falsy -> an inline neutral placeholder (no network request).
 */
import { API_ORIGIN } from './api'

export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#efe6d2"/><path d="M0 230c60-40 110-40 170-10s120 30 230-20v100H0z" fill="#dccfb2"/><circle cx="300" cy="90" r="28" fill="#e3a21a" opacity=".6"/></svg>',
  )

export function imageUrl(src, { width } = {}) {
  const value = Array.isArray(src) ? src[0] : src
  if (!value) return PLACEHOLDER_IMG
  if (/^(data:|blob:)/.test(value)) return value
  if (/^https?:\/\//.test(value)) {
    if (value.includes('res.cloudinary.com') && value.includes('/upload/') && !/\/upload\/[a-z]_/.test(value)) {
      const t = ['f_auto', 'q_auto', width ? `w_${width}` : null].filter(Boolean).join(',')
      return value.replace('/upload/', `/upload/${t}/`)
    }
    return value
  }
  return `${API_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`
}

export function srcSet(src, widths = [320, 640, 960]) {
  const value = Array.isArray(src) ? src[0] : src
  if (!value || !/res\.cloudinary\.com/.test(value)) return undefined
  return widths.map((w) => `${imageUrl(value, { width: w })} ${w}w`).join(', ')
}
