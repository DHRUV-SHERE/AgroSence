/**
 * Formatting helpers. All Indian-locale aware.
 *
 *   import { formatINR, formatNumber, formatDate, formatDateTime, timeAgo, initials, truncate, titleCase } from '../lib/format'
 *   formatINR(125000)        -> "₹1,25,000"
 *   formatINR(99.5, {decimals: 2}) -> "₹99.50"
 *   formatDate('2026-01-05') -> "5 Jan 2026"
 *   timeAgo(date)            -> "3 hours ago"
 */
const inr0 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const inr2 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const num = new Intl.NumberFormat('en-IN')

const toDate = (v) => {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatINR(value, { decimals = 0 } = {}) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '₹0'
  return (decimals ? inr2 : inr0).format(n)
}

export function formatNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? num.format(n) : '0'
}

export function formatDate(value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const d = toDate(value)
  return d ? d.toLocaleDateString('en-IN', opts) : '-'
}

export function formatDateTime(value) {
  const d = toDate(value)
  return d
    ? d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '-'
}

export function timeAgo(value) {
  const d = toDate(value)
  if (!d) return ''
  const sec = Math.round((Date.now() - d.getTime()) / 1000)
  if (sec < 45) return 'just now'
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]]
  for (const [name, s] of units) {
    if (sec >= s) {
      const n = Math.floor(sec / s)
      return `${n} ${name}${n > 1 ? 's' : ''} ago`
    }
  }
  return 'just now'
}

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?'

export const truncate = (s = '', n = 120) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

export const titleCase = (s = '') => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
