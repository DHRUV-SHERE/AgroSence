/**
 * Sets document.title to "<title> | AgroSense". App.jsx already sets it from the route table;
 * call this in a page only for dynamic titles (e.g. a crop name):  useDocumentTitle(crop?.name)
 */
import { useEffect } from 'react'

export const SITE = 'AgroSense'

export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = `${title} | ${SITE}`
  }, [title])
}
