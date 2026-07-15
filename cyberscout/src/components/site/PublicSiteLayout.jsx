import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CLILogo from '../CLILogo'
import SiteIcon from '../ui/SiteIcon'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { openCookieSettings } from '../../lib/consent'

const primaryLinks = [
  ['Courses', '/courses'],
  ['Labs', '/labs'],
  ['Learning Paths', '/learning-paths'],
  ['For Organisations', '/for-organisations'],
  ['Resources', '/resources'],
]

const courseLinks = [
  ['Cyber Security Essentials', '/courses/cybersecurity/cyber-security-essentials', 'Beginner course with guided labs and defensive reporting.'],
  ['Introduction to Cyber Security', '/courses/cybersecurity/introduction-to-cyber-security', 'A four-week foundation in cyber safety and security thinking.'],
  ['Course roadmap', '/courses#coming-next', 'See which specialist courses are being prepared.'],
]

const resourceLinks = [
  ['Cybersecurity guides', '/blog', 'Published beginner guides reviewed by the course author.'],
  ['Frequently asked questions', '/faq', 'Course format, prerequisites, labs and enrolment.'],
  ['About Cyber Lab IN', '/about', 'Mission, teaching approach and organisation background.'],
  ['Instructor profile', '/instructors/arghya-sikdar', 'Experience, credentials and authored learning.'],
]

const footerLinks = [
  ['Learn', [['Courses', '/courses'], ['Labs', '/labs'], ['Learning Paths', '/learning-paths'], ['Blog', '/blog']]],
  ['Cyber Lab IN', [['About', '/about'], ['Instructor', '/instructors/arghya-sikdar'], ['For Organisations', '/for-organisations'], ['Contact', '/contact']]],
  ['Policies', [['Privacy', '/privacy-policy'], ['Terms', '/terms'], ['Refund Policy', '/refund-policy'], ['Accessibility', '/accessibility']]],
]

function DesktopDropdown({ label, items, open, onToggle, onClose }) {
  return (
    <div className="site-nav-dropdown">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-haspopup="true">
        {label}<SiteIcon name="expand_more" size={15} />
      </button>
      {open && (
        <div className="site-nav-popover" role="menu">
          {items.map(([title, href, copy]) => (
            <Link key={href} to={href} role="menuitem" onClick={onClose}>
              <strong>{title}</strong><span>{copy}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function SearchDialog({ open, onClose }) {
  const dialogRef = useRef(null)
  const [query, setQuery] = useState('')
  useFocusTrap(dialogRef, open, onClose)
  if (!open) return null

  const options = [...courseLinks, ...resourceLinks, ['Guided cyber labs', '/labs', 'See what learners inspect, record and submit.']]
  const matches = options.filter(([title, , copy]) => `${title} ${copy}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="site-search-overlay" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="site-search-title" className="site-search-dialog">
        <div className="site-search-heading">
          <div><p className="site-eyebrow">Search</p><h2 id="site-search-title">Find courses and resources</h2></div>
          <button type="button" onClick={onClose} className="site-icon-button" aria-label="Close search"><SiteIcon name="close" /></button>
        </div>
        <label className="site-search-input"><SiteIcon name="search" /><span className="sr-only">Search the website</span><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search courses, labs or guides" /></label>
        <div className="site-search-results">
          {matches.map(([title, href, copy]) => <Link key={href} to={href} onClick={onClose}><strong>{title}</strong><span>{copy}</span><SiteIcon name="arrow_forward" /></Link>)}
          {!matches.length && <p>No matching public pages. Try “course”, “lab” or “phishing”.</p>}
        </div>
      </section>
    </div>
  )
}

function MobileNavigation({ open, onClose }) {
  const drawerRef = useRef(null)
  const [expanded, setExpanded] = useState('')
  useFocusTrap(drawerRef, open, onClose)

  useEffect(() => {
    if (!open) return undefined
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  return (
    <div className="site-mobile-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <aside ref={drawerRef} className="site-mobile-drawer" role="dialog" aria-modal="true" aria-label="Website navigation">
        <div className="site-mobile-heading"><CLILogo variant="full" tone="light" size={142} /><button type="button" className="site-icon-button" onClick={onClose} aria-label="Close navigation"><SiteIcon name="close" /></button></div>
        <nav aria-label="Mobile navigation">
          <div className="site-mobile-group">
            <button type="button" aria-expanded={expanded === 'courses'} onClick={() => setExpanded(value => value === 'courses' ? '' : 'courses')}>Courses<SiteIcon name={expanded === 'courses' ? 'expand_less' : 'expand_more'} /></button>
            {expanded === 'courses' && <div>{courseLinks.map(([label, href]) => <Link key={href} to={href} onClick={onClose}>{label}</Link>)}</div>}
          </div>
          {primaryLinks.slice(1, 4).map(([label, href]) => <Link key={href} to={href} onClick={onClose}>{label}</Link>)}
          <div className="site-mobile-group">
            <button type="button" aria-expanded={expanded === 'resources'} onClick={() => setExpanded(value => value === 'resources' ? '' : 'resources')}>Resources<SiteIcon name={expanded === 'resources' ? 'expand_less' : 'expand_more'} /></button>
            {expanded === 'resources' && <div>{resourceLinks.map(([label, href]) => <Link key={href} to={href} onClick={onClose}>{label}</Link>)}</div>}
          </div>
        </nav>
        <div className="site-mobile-actions"><Link to="/auth?mode=login" onClick={onClose}>Log in</Link><Link to="/courses/cybersecurity/cyber-security-essentials" className="site-button-primary" onClick={onClose}>Start learning<SiteIcon name="arrow_forward" /></Link></div>
      </aside>
    </div>
  )
}

function SiteHeader() {
  const [openDropdown, setOpenDropdown] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpenDropdown('')
    setMobileOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const close = event => event.key === 'Escape' && setOpenDropdown('')
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [])

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="site-container site-header-inner">
          <Link to="/" className="site-brand-link" aria-label="Cyber Lab IN home"><CLILogo variant="full" tone="light" size={150} /></Link>
          <nav className="site-desktop-nav" aria-label="Primary navigation">
            <DesktopDropdown label="Courses" items={courseLinks} open={openDropdown === 'courses'} onToggle={() => setOpenDropdown(value => value === 'courses' ? '' : 'courses')} onClose={() => setOpenDropdown('')} />
            <Link to="/labs">Labs</Link>
            <Link to="/learning-paths">Learning Paths</Link>
            <Link to="/for-organisations">For Organisations</Link>
            <DesktopDropdown label="Resources" items={resourceLinks} open={openDropdown === 'resources'} onToggle={() => setOpenDropdown(value => value === 'resources' ? '' : 'resources')} onClose={() => setOpenDropdown('')} />
          </nav>
          <div className="site-header-actions">
            <button type="button" className="site-search-button" onClick={() => setSearchOpen(true)} aria-label="Search website"><SiteIcon name="search" /></button>
            <Link to="/auth?mode=login" className="site-login-link">Log in</Link>
            <Link to="/courses/cybersecurity/cyber-security-essentials" className="site-button-primary">Start learning</Link>
            <button type="button" className="site-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Open navigation" aria-expanded={mobileOpen}><SiteIcon name="menu" size={22} /></button>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileNavigation open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container site-footer-main">
        <div className="site-footer-brand">
          <CLILogo variant="full" tone="dark" size={166} />
          <p>Practical cybersecurity education for beginners, students and early-career professionals.</p>
          <a href="mailto:hello@cyberlabin.com">hello@cyberlabin.com</a>
        </div>
        <div className="site-footer-links">
          {footerLinks.map(([title, links]) => <nav key={title} aria-label={`${title} links`}><h2>{title}</h2>{links.map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}</nav>)}
        </div>
      </div>
      <div className="site-container site-footer-bottom">
        <p>© {new Date().getFullYear()} Cyber Lab IN. All rights reserved.</p>
        <button type="button" className="site-footer-cookie-button" onClick={openCookieSettings}>Cookie settings</button>
        <p>Third-party trademarks belong to their respective owners. Their use does not imply endorsement.</p>
      </div>
    </footer>
  )
}

export default function PublicSiteLayout({ children, chatbot = null }) {
  useLayoutEffect(() => {
    const root = document.documentElement
    const wasDark = root.classList.contains('dark')
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
    return () => {
      if (wasDark) {
        root.classList.add('dark')
        root.style.colorScheme = 'dark'
      }
    }
  }, [])

  return <div className="site-root"><a href="#main-content" className="site-skip-link">Skip to main content</a><SiteHeader /><main id="main-content">{children}</main><SiteFooter />{chatbot}</div>
}

export function Breadcrumbs({ items }) {
  return <nav className="site-breadcrumbs" aria-label="Breadcrumb"><div className="site-container"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href ? <Link to={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}{index < items.length - 1 && <SiteIcon name="arrow_forward" size={13} />}</li>)}</ol></div></nav>
}

export function PageIntro({ eyebrow, title, description, actions, aside }) {
  return <section className="page-intro"><div className="site-container page-intro-grid"><div><p className="site-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p>{actions && <div className="site-action-row">{actions}</div>}</div>{aside}</div></section>
}

export function StatePanel({ type = 'loading', title, message, action }) {
  return <section className={`site-state-panel is-${type}`} role={type === 'error' ? 'alert' : 'status'} aria-live="polite"><div className="site-state-marker" aria-hidden="true" /> <div><h2>{title}</h2>{message && <p>{message}</p>}{action}</div></section>
}
