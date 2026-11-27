/**
 * Button / IconButton.
 *   <Button variant="primary|secondary|accent|ghost|danger" size="sm|md|lg" block loading icon={<LuSend/>}>Send</Button>
 *   <Button as={Link} to="/signup">Create account</Button>       // renders any element/component; no type attr then
 *   <IconButton label="Close" onClick={...}><LuX /></IconButton>  // `label` is REQUIRED (aria-label)
 * `loading` disables the button, shows a spinner and sets aria-busy.
 */
import { forwardRef } from 'react'
import { cx } from '../../lib/cx'
import { Spinner } from './Loaders'

export const Button = forwardRef(function Button(
  { as: Tag = 'button', variant = 'secondary', size = 'md', block, loading, icon, className, children, disabled, ...rest },
  ref,
) {
  const isButton = Tag === 'button'
  return (
    <Tag
      ref={ref}
      className={cx('ag-btn', variant !== 'secondary' && `ag-btn--${variant}`, size !== 'md' && `ag-btn--${size}`, block && 'ag-btn--block', className)}
      {...(isButton ? { type: rest.type || 'button', disabled: disabled || loading } : { 'aria-disabled': disabled || undefined })}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </Tag>
  )
})

export const IconButton = forwardRef(function IconButton({ as: Tag = 'button', label, variant, size, className, children, ...rest }, ref) {
  return (
    <Tag
      ref={ref}
      {...(Tag === 'button' ? { type: 'button' } : {})}
      aria-label={label}
      title={label}
      className={cx('ag-iconbtn', variant === 'outline' && 'ag-iconbtn--outline', size === 'sm' && 'ag-iconbtn--sm', className)}
      {...rest}
    >
      {children}
    </Tag>
  )
})
