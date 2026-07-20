import { useEffect, useState } from 'react'
import SideNav from './SideNav'
import SideNavCollapsed from './SideNavCollapsed'
import TopAppBar from './TopAppBar'

export default function AppShell({ children, focusMode = false }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => {
      setIsMobile(query.matches)
      if (!query.matches) setMobileNavOpen(false)
    }
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!mobileNavOpen) return undefined
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [mobileNavOpen])

  return (
    <div className="min-h-screen bg-background">
      {!focusMode && mobileNavOpen && <button type="button" className="app-nav-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      {focusMode ? <SideNavCollapsed /> : <SideNav mobileOpen={mobileNavOpen} isMobile={isMobile} onNavigate={() => setMobileNavOpen(false)} />}
      <div className={`app-shell-main ${focusMode ? 'is-focus-mode' : ''}`}>
        <TopAppBar onMenuOpen={focusMode ? null : () => setMobileNavOpen(true)} />
        {children}
      </div>
    </div>
  )
}
