/**
 * Site header for public pages: logo, primary nav, theme toggle, auth actions, mobile menu.
 * Rendered by PublicLayout.
 */
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { LuMenu, LuX } from 'react-icons/lu'
import { PUBLIC_NAV } from '../lib/navigation'
import { useAuth } from '../context/AuthContext'
import { Avatar, Button, IconButton, Logo, ThemeToggle } from '../components/ui'

export default function PublicHeader() {
  const { isAuthenticated, user } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="ag-header">
      <div className="ag-container ag-header__bar">
        <Logo />
        <nav className="ag-nav" aria-label="Primary">
          {PUBLIC_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>
          ))}
        </nav>
        <div className="ag-header__actions">
          <ThemeToggle className="ag-hide-sm" />
          {isAuthenticated ? (
            <Button as={Link} to="/dashboard" variant="primary" size="sm" icon={<Avatar user={user} size={22} />}>Dashboard</Button>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">Log in</Button>
              <Button as={Link} to="/signup" variant="primary" size="sm" className="ag-hide-sm">Sign up</Button>
            </>
          )}
          <IconButton className="ag-header__menu" label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="ag-mobilenav" onClick={() => setOpen((o) => !o)}>
            {open ? <LuX /> : <LuMenu />}
          </IconButton>
        </div>
      </div>
      {open && (
        <nav id="ag-mobilenav" className="ag-mobilenav" aria-label="Mobile">
          <div className="ag-cluster" style={{ justifyContent: 'space-between' }}><span className="ag-muted">Theme</span><ThemeToggle /></div>
          {PUBLIC_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>
          ))}
          {isAuthenticated ? (
            <Button as={Link} to="/dashboard" variant="primary" block>Go to dashboard</Button>
          ) : (
            <>
              <Button as={Link} to="/signup" variant="primary" block>Create free account</Button>
              <Button as={Link} to="/login" block>Log in</Button>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
