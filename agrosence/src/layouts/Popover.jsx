/**
 * Small click-outside/Escape dropdown used by the topbar menus.
 *   <Popover trigger={({ open, toggle, props }) => <button {...props}>...</button>}>panel content</Popover>
 * `props` carries aria-expanded/aria-haspopup and the onClick handler.
 */
import { useEffect, useRef, useState } from 'react'

export default function Popover({ trigger, children, panelLabel }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  const toggle = () => setOpen((o) => !o)
  return (
    <div className="ag-pop" ref={ref}>
      {trigger({ open, toggle, props: { 'aria-expanded': open, 'aria-haspopup': 'true', onClick: toggle } })}
      {open && (
        <div className="ag-pop__panel" role="group" aria-label={panelLabel} onClick={(e) => { if (e.target.closest('a')) setOpen(false) }}>
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  )
}
