/**
 * <Seo /> keeps <head> (title, description, canonical, robots, Open Graph, Twitter, JSON-LD) in step with the
 * current route after client-side navigation. First-load tags for public pages are already written into the HTML
 * at build time (scripts/prerender.mjs); this only reconciles them. Renders nothing.
 * Per-route copy lives in ./meta.js (PAGES). App routes get noindex; their title is set in App.jsx from the route table.
 */
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { applyHead, pageKey } from './meta'

export default function Seo() {
  const { pathname } = useLocation()
  const key = pageKey(pathname)
  useEffect(() => {
    applyHead(key, { setTitle: Boolean(key) })
  }, [key])
  return null
}
