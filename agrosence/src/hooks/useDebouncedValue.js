/** Returns `value` after it has stopped changing for `delay` ms. Used for search boxes. */
import { useEffect, useState } from 'react'

export function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
