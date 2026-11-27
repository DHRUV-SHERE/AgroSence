/**
 * Tiny global network-activity store (no deps). Drives the top progress bar and the
 * "waking up the server" notice. Consumers: components/ui/NetworkStatus.jsx.
 *
 *   const id = net.begin()   // a request/route started
 *   net.end(id)              // it finished (success or failure)
 *
 * A request still pending after SLOW_AFTER ms counts as "slow" (server probably cold-starting).
 */
export const SLOW_AFTER = 4000

let state = { pending: 0, slow: 0, retrying: 0 }
const listeners = new Set()
const timers = new Map()
let seq = 0

const emit = (patch) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export const net = {
  subscribe(l) { listeners.add(l); return () => listeners.delete(l) },
  getSnapshot: () => state,
  begin({ track = true } = {}) {
    const id = ++seq
    const t = { slow: false }
    if (track) t.timer = setTimeout(() => { t.slow = true; emit({ slow: state.slow + 1 }) }, SLOW_AFTER)
    timers.set(id, t)
    emit({ pending: state.pending + 1 })
    return id
  },
  end(id) {
    const t = timers.get(id)
    if (!t) return
    clearTimeout(t.timer)
    timers.delete(id)
    emit({ pending: Math.max(0, state.pending - 1), slow: t.slow ? Math.max(0, state.slow - 1) : state.slow })
  },
}
