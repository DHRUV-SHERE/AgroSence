/**
 * Split-screen frame for Login / Signup / ForgotPassword.
 *   <AuthShell art={imgUrl} quote="..." note="..."> <form/> </AuthShell>
 * Sets its own document structure (no public header/footer). Used as a plain page; route table layout: 'none'.
 */
import { Logo } from './ui'

export default function AuthShell({ art, quote, note, children }) {
  return (
    <div className="ag-auth">
      <aside className="ag-auth__art" aria-hidden="true">
        <img src={art} alt="" width="1000" height="625" loading="lazy" decoding="async" />
        <Logo />
        <p className="ag-auth__quote">{quote}{note && <small>{note}</small>}</p>
      </aside>
      <main id="main" className="ag-auth__main" tabIndex={-1} style={{ outline: 'none' }}>
        <div className="ag-auth__card ag-page">
          <div className="ag-auth__mobilelogo"><Logo /></div>
          {children}
        </div>
      </main>
    </div>
  )
}
