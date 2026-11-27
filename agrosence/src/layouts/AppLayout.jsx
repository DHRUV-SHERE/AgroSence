/**
 * Authenticated shell: role-aware sidebar (drawer on mobile), topbar with notification bell,
 * theme toggle and user menu. Use as a layout route (<Outlet />) or wrap children:
 *   <AppLayout title="Orders"> ... </AppLayout>
 * `title` (optional) shows in the topbar on small screens; pages should render their own <h1>.
 * Sidebar items come from lib/navigation.js (filtered by the user's role).
 */
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LuBell, LuChevronDown, LuHouse, LuLogOut, LuMenu, LuSettings, LuX } from 'react-icons/lu'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import { appNavFor } from '../lib/navigation'
import { timeAgo } from '../lib/format'
import { Avatar, IconButton, Logo, ThemeToggle } from '../components/ui'
import Popover from './Popover'

function NotificationBell() {
  const { items, unread, loading, markRead, isUnread } = useNotifications()
  return (
    <Popover
      panelLabel="Notifications"
      trigger={({ props }) => (
        <IconButton className="ag-bell" label={unread ? `Notifications, ${unread} unread` : 'Notifications'} {...props}>
          <LuBell />
          {unread > 0 && <span className="ag-bell__dot" aria-hidden="true">{unread > 9 ? '9+' : unread}</span>}
        </IconButton>
      )}
    >
      <div className="ag-pop__head"><strong>Notifications</strong></div>
      {loading && !items.length ? <p className="ag-muted" style={{ padding: 'var(--s-3)', margin: 0 }}>Loading…</p>
        : !items.length ? <p className="ag-muted" style={{ padding: 'var(--s-3)', margin: 0 }}>Nothing new. We will tell you when a buyer or seller acts on your orders.</p>
          : (
            <ul className="ag-notes">
              {items.map((n) => (
                <li key={n.id} data-unread={isUnread(n)}>
                  <span>{n.message || n.title}</span>
                  <small>
                    {timeAgo(n.createdAt)}
                    {isUnread(n) && <> · <button type="button" className="ag-linkbtn" onClick={() => markRead(n.id)}>Mark as read</button></>}
                  </small>
                </li>
              ))}
            </ul>
          )}
    </Popover>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const out = async () => { await logout(); navigate('/', { replace: true }) }
  return (
    <Popover
      panelLabel="Account"
      trigger={({ props }) => (
        <button type="button" className="ag-usermenu__btn" {...props}>
          <Avatar user={user} size={32} />
          <span className="ag-hide-sm" style={{ fontWeight: 600, maxWidth: '9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name?.split(' ')[0]}</span>
          <LuChevronDown aria-hidden="true" width="16" height="16" />
        </button>
      )}
    >
      <div className="ag-pop__head"><strong>{user?.name}</strong><span>{user?.email}</span></div>
      <Link to="/Setting"><LuSettings aria-hidden="true" />Settings</Link>
      <Link to="/"><LuHouse aria-hidden="true" />Public site</Link>
      <button type="button" className="ag-pop__item" onClick={out}><LuLogOut aria-hidden="true" />Log out</button>
    </Popover>
  )
}

export default function AppLayout({ children, title }) {
  const { role } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const groups = appNavFor(role)

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="ag-app">
      <a className="ag-skip" href="#main">Skip to content</a>
      <aside className="ag-sidebar" id="ag-sidebar" data-open={open} aria-label="App navigation">
        <div className="ag-sidebar__brand ag-cluster" style={{ justifyContent: 'space-between' }}>
          <Logo to="/dashboard" />
          <IconButton className="ag-topbar__menu" label="Close menu" size="sm" onClick={() => setOpen(false)}><LuX /></IconButton>
        </div>
        <nav aria-label="Main">
          {groups.map((g) => (
            <div key={g.group}>
              <h2>{g.group}</h2>
              <ul>
                {g.items.map((i) => (
                  <li key={i.to || i.href}>
                    {i.href
                      ? <a href={i.href} target="_blank" rel="noreferrer"><i.icon aria-hidden="true" />{i.label}</a>
                      : <NavLink to={i.to}><i.icon aria-hidden="true" />{i.label}</NavLink>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      {open && <div className="ag-sidebar__scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <div className="ag-app__main">
        <header className="ag-topbar">
          <IconButton className="ag-topbar__menu" label="Open menu" aria-expanded={open} aria-controls="ag-sidebar" onClick={() => setOpen(true)}><LuMenu /></IconButton>
          {title && <p className="ag-topbar__title">{title}</p>}
          <span className="ag-topbar__spacer" />
          <ThemeToggle />
          <NotificationBell />
          <UserMenu />
        </header>
        <main id="main" className="ag-content ag-page" tabIndex={-1} style={{ outline: 'none' }}>
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}
