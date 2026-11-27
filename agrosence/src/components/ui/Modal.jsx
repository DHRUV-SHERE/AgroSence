/**
 * Modal (native <dialog>: focus trap, Esc and inert background handled by the browser) and ConfirmDialog.
 *   <Modal open={open} onClose={() => setOpen(false)} title="Edit listing" footer={<Button>Save</Button>} size="lg">...</Modal>
 *   <ConfirmDialog open={!!target} title="Delete this crop?" message="This cannot be undone."
 *      confirmLabel="Delete" danger loading={busy} onConfirm={...} onCancel={...} />
 * Clicking the backdrop closes it. Focus returns to the trigger automatically.
 */
import { useEffect, useId, useRef } from 'react'
import { LuX } from 'react-icons/lu'
import { cx } from '../../lib/cx'
import { Button, IconButton } from './Button'

export function Modal({ open, onClose, title, footer, size, children, className }) {
  const ref = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={cx('ag-modal', size === 'lg' && 'ag-modal--lg', className)}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose?.() }}
    >
      {open && (
        <>
          <div className="ag-modal__head">
            <h2 id={titleId}>{title}</h2>
            <IconButton label="Close" size="sm" onClick={onClose}><LuX /></IconButton>
          </div>
          <div className="ag-modal__body">{children}</div>
          {footer && <div className="ag-modal__foot">{footer}</div>}
        </>
      )}
    </dialog>
  )
}

export function ConfirmDialog({ open, title = 'Are you sure?', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, loading, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={(
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      )}
    >
      {message && <p className="ag-muted" style={{ margin: 0 }}>{message}</p>}
    </Modal>
  )
}
