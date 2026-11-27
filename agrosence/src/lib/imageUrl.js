/**
 * Resolve a backend image reference to something an <img> can load.
 *
 *   import { imageUrl, srcSet, PLACEHOLDER_IMG } from '../lib/imageUrl'
 *   <img src={imageUrl(url, { width: 480 })} srcSet={srcSet(url, [320, 480, 720])} sizes="..." loading="lazy" decoding="async" width="480" height="360" alt="..." />
 *
 * - Cloudinary originals (~400KB PNG) get on-the-fly transforms after /upload/:
 *   f_auto (AVIF/WebP), q_auto, c_limit (never upscale) and an explicit width (+ dpr_auto when none).
 * - Other absolute http(s)/data/blob URLs pass through. Relative paths are served from the API origin.
 * - Falsy -> an inline neutral placeholder (no network request).
 */
import { API_ORIGIN } from './api'

export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e3ece6"/><path d="M0 230c60-40 110-40 170-10s120 30 230-20v100H0z" fill="#cfdcd3"/><circle cx="300" cy="90" r="28" fill="#d99a0b" opacity=".5"/></svg>',
  )

const isCloudinary = (v) => /res\.cloudinary\.com/.test(v) && v.includes('/upload/')
const hasTransform = (v) => /\/upload\/(?:[a-z]{1,3}_[^/]*,?)+\//.test(v)

export function imageUrl(src, { width } = {}) {
  const value = Array.isArray(src) ? src[0] : src
  if (!value) return PLACEHOLDER_IMG
  if (/^(data:|blob:)/.test(value)) return value
  if (/^https?:\/\//.test(value)) {
    if (isCloudinary(value) && !hasTransform(value)) {
      const t = ['f_auto', 'q_auto', 'c_limit', width ? `w_${width}` : 'w_1200', width ? null : 'dpr_auto'].filter(Boolean).join(',')
      return value.replace('/upload/', `/upload/${t}/`)
    }
    return value
  }
  return `${API_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`
}

/** `srcset` string with one candidate per width (Cloudinary only; others return undefined). */
export function srcSet(src, widths = [320, 640, 960]) {
  const value = Array.isArray(src) ? src[0] : src
  if (!value || !isCloudinary(value)) return undefined
  return widths.map((w) => `${imageUrl(value, { width: w })} ${w}w`).join(', ')
}

/** Spread onto <img>: { src, srcSet, sizes } for a given display width. */
export function imgProps(src, { width, widths, sizes } = {}) {
  const w = width || widths?.[Math.floor(widths.length / 2)] || 640
  const list = widths || [Math.round(w / 1.5), w, Math.round(w * 1.5)]
  return { src: imageUrl(src, { width: w }), srcSet: srcSet(src, list), sizes }
}
