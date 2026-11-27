/**
 * Shell for public pages (Home, Features, About, Contact...): skip link, header, main, footer.
 * Used as a layout route (renders <Outlet />) or wrapping children directly:
 *   <PublicLayout><MyPage /></PublicLayout>
 * Pages supply their own sections inside <main>; use .ag-container / .ag-section for rhythm.
 */
import { Outlet } from 'react-router-dom'
import PublicHeader from './PublicHeader'
import Footer from './Footer'

export default function PublicLayout({ children }) {
  return (
    <>
      <a className="ag-skip" href="#main">Skip to content</a>
      <PublicHeader />
      <main id="main" className="ag-page" tabIndex={-1} style={{ outline: 'none' }}>
        {children ?? <Outlet />}
      </main>
      <Footer />
    </>
  )
}
