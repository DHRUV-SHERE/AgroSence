/**
 * Brand bits. <Logo to="/" /> and <Avatar user={user} size={40} /> (initials fallback).
 */
import { Link } from 'react-router-dom'
import logo from '../../assets/brand/logo-96.webp'
import { initials } from '../../lib/format'
import { imageUrl } from '../../lib/imageUrl'

export function Logo({ to = '/', ...rest }) {
  return (
    <Link to={to} className="ag-logo" aria-label="AgroSense home" {...rest}>
      <img src={logo} alt="" width="36" height="36" />
      <span>Agro<b>Sense</b></span>
    </Link>
  )
}

export function Avatar({ user, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.38 }
  return (
    <span className="ag-avatar" style={style} aria-hidden="true">
      {user?.avatar ? <img src={imageUrl(user.avatar, { width: size * 2 })} alt="" width={size} height={size} loading="lazy" decoding="async" /> : initials(user?.name)}
    </span>
  )
}
