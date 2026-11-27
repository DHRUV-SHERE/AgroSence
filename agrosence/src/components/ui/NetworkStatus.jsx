/**
 * Global network feedback, mounted once in App.jsx:
 *  - a thin top progress bar while any request or route chunk is loading,
 *  - a friendly "waking up the server" notice when a request is slow (free-tier cold start),
 *  - an offline notice.
 * Also exports <RouteFallback /> (Suspense fallback: instant page-shaped skeleton + progress bar).
 */
import { useEffect, useState, useSyncExternalStore } from 'react'
import { LuCloudOff, LuLoader } from 'react-icons/lu'
import { net } from '../../lib/net'
import { Skeleton, SkeletonCard } from './Skeleton'

const useNet = () => useSyncExternalStore(net.subscribe, net.getSnapshot, net.getSnapshot)

function useOnline() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

export function NetworkStatus() {
  const { pending, slow } = useNet()
  const online = useOnline()
  // Debounce the bar so very fast (cached) loads do not flash it.
  const [bar, setBar] = useState(false)
  useEffect(() => {
    if (!pending) { setBar(false); return undefined }
    const t = setTimeout(() => setBar(true), 120)
    return () => clearTimeout(t)
  }, [pending])

  return (
    <>
      <div className="ag-progress" data-on={bar} aria-hidden="true"><span /></div>
      {(!online || slow > 0) && (
        <div className="ag-netnote" role="status" aria-live="polite" data-tone={online ? 'info' : 'warn'}>
          {online ? <LuLoader className="ag-netnote__spin" aria-hidden="true" /> : <LuCloudOff aria-hidden="true" />}
          <span>
            {online
              ? 'Waking up the server… the first load can take up to a minute. Thanks for your patience.'
              : 'You are offline. We will reconnect automatically.'}
          </span>
        </div>
      )}
    </>
  )
}

/** Suspense fallback for lazy routes: page-shaped skeleton, never a blank screen. */
export function RouteFallback() {
  useEffect(() => {
    const id = net.begin({ track: false })
    return () => net.end(id)
  }, [])
  return (
    <div className="ag-routefallback ag-container" role="status" aria-live="polite" aria-label="Loading page">
      <Skeleton width="min(24rem, 60%)" height={36} />
      <Skeleton width="min(36rem, 90%)" height={18} />
      <div className="ag-grid" style={{ '--min': '18rem', marginTop: 'var(--s-5)' }}>
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    </div>
  )
}
