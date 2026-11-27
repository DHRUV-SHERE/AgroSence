/** Site footer. Links come from lib/navigation.js. */
import { Link } from 'react-router-dom'
import { LuMail, LuMapPin, LuPhone } from 'react-icons/lu'
import { CONTACT, PUBLIC_NAV } from '../lib/navigation'
import { Logo } from '../components/ui'

export default function Footer() {
  return (
    <footer className="ag-footer">
      <div className="ag-container">
        <div className="ag-footer__grid">
          <div>
            <Logo />
            <p style={{ marginTop: 'var(--s-4)' }}>
              Built for Indian farmers: sell directly to buyers, spot crop problems early, and never miss a scheme you qualify for.
            </p>
          </div>
          <nav aria-label="Footer">
            <h2>Explore</h2>
            <ul>
              {PUBLIC_NAV.map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}
              <li><Link to="/login">Log in</Link></li>
              <li><Link to="/signup">Create an account</Link></li>
            </ul>
          </nav>
          <div>
            <h2>Reach us</h2>
            <ul>
              <li style={{ display: 'flex', gap: 'var(--s-2)' }}><LuMail aria-hidden="true" width="18" height="18" style={{ flex: 'none', marginTop: 4 }} /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li style={{ display: 'flex', gap: 'var(--s-2)' }}><LuPhone aria-hidden="true" width="18" height="18" style={{ flex: 'none', marginTop: 4 }} /><a href={`tel:${CONTACT.phones[1].value.replace(/\s/g, '')}`}>{CONTACT.phones[1].value}</a></li>
              <li style={{ display: 'flex', gap: 'var(--s-2)' }}><LuMapPin aria-hidden="true" width="18" height="18" style={{ flex: 'none', marginTop: 4 }} /><span>{CONTACT.address}</span></li>
            </ul>
          </div>
        </div>
        <div className="ag-footer__base">
          <span>© {new Date().getFullYear()} Team AgroSense. All rights reserved.</span>
          <span>English · हिन्दी · ગુજરાતી</span>
        </div>
      </div>
    </footer>
  )
}
