import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CLILogo from '../CLILogo'

const utilityLinks = [
  ['For institutions', '/for-organisations#institutions'],
  ['For businesses', '/for-organisations#businesses'],
  ['Resources', '/resources'],
  ['Contact', '/contact'],
]

const megaMenus = [
  {
    label: 'Courses',
    columns: [
      {
        title: 'Build your foundation',
        links: [
          ['Cyber Security Essentials', '/courses/cybersecurity/cyber-security-essentials', 'Guided beginner training with practical exercises.'],
          ['Introduction to Cyber Security', '/courses/cybersecurity/introduction-to-cyber-security', 'Core awareness, networking and defensive thinking.'],
          ['All courses', '/courses', 'Browse every published Cyber Lab IN course.'],
        ],
      },
      {
        title: 'Specialise',
        links: [
          ['Web security', '/courses/cybersecurity/web-application-security', 'Application risk and defensive web concepts.'],
          ['SOC analyst training', '/courses/cybersecurity/soc-analyst-foundations', 'Security operations and investigation foundations.'],
          ['Ethical hacking', '/courses/cybersecurity/ethical-hacking-foundations', 'Responsible security testing concepts.'],
        ],
      },
    ],
    feature: {
      eyebrow: 'Featured course',
      title: 'Start with Cyber Security Essentials',
      description: 'A seven-day beginner course with guided labs, phishing analysis and web security foundations.',
      href: '/courses/cybersecurity/cyber-security-essentials',
      linkLabel: 'View course details',
    },
  },
  {
    label: 'Learning Paths',
    columns: [
      {
        title: 'Start and progress',
        links: [
          ['Complete beginner', '/learning-paths/beginner-cybersecurity', 'Build essential security knowledge in sequence.'],
          ['SOC analyst', '/learning-paths/soc-analyst', 'Develop investigation and defensive operations skills.'],
          ['Ethical hacking', '/learning-paths/ethical-hacking', 'Learn responsible testing and web security foundations.'],
        ],
      },
      {
        title: 'Broaden your skills',
        links: [
          ['Network and cloud security', '/learning-paths/network-cloud-security', 'Connect infrastructure, identity and cloud controls.'],
          ['Digital forensics', '/learning-paths/digital-forensics', 'Study evidence, timelines and investigation structure.'],
          ['All learning paths', '/learning-paths', 'Compare every structured progression route.'],
        ],
      },
    ],
    feature: {
      eyebrow: 'How learning works',
      title: 'From concepts to evidence of skill',
      description: 'Follow guided lessons, practise safely and document what you find.',
      href: '/learning-paths',
      linkLabel: 'Explore learning paths',
    },
  },
  {
    label: 'Cyber Labs',
    columns: [
      {
        title: 'Practise',
        links: [
          ['Guided labs', '/labs#guided-labs', 'Step-by-step exercises tied to course outcomes.'],
          ['Practice environments', '/labs#practice-environments', 'Contained learning activities and evidence capture.'],
          ['Challenges', '/labs#challenges', 'Apply course concepts in focused tasks.'],
        ],
      },
      {
        title: 'Track progress',
        links: [
          ['Lab workflow', '/labs#lab-workflow', 'See how access, attempts and scoring work.'],
          ['Student dashboard', '/auth?mode=login&redirect=%2Fdashboard', 'Return to enrolled courses and practical work.'],
          ['Leaderboard', '/auth?mode=login&redirect=%2Fleaderboard', 'View real course progress when available.'],
        ],
      },
    ],
    feature: {
      eyebrow: 'Practical learning',
      title: 'Guided work, clear boundaries',
      description: 'Cyber Lab IN focuses on responsible practice and defensive reporting.',
      href: '/labs',
      linkLabel: 'How the labs work',
    },
  },
  {
    label: 'For Institutions',
    columns: [
      {
        title: 'Academic programmes',
        links: [
          ['College partnerships', '/for-organisations#institutions', 'Discuss practical training for student cohorts.'],
          ['Curriculum integration', '/for-organisations#institutions', 'Align guided learning with academic delivery.'],
          ['Faculty enablement', '/for-organisations#institutions', 'Support teaching teams with structured materials.'],
        ],
      },
      {
        title: 'Delivery support',
        links: [
          ['Student training', '/for-organisations#institutions', 'Practical programmes for technical and non-technical learners.'],
          ['Lab integration', '/for-organisations#institutions', 'Add guided lab workflows to existing teaching.'],
          ['Contact the team', '/contact', 'Share your programme requirements.'],
        ],
      },
    ],
    feature: {
      eyebrow: 'For educators',
      title: 'Bring practical cybersecurity into the classroom',
      description: 'Start with curriculum, cohort and delivery requirements rather than a generic package.',
      href: '/for-organisations#institutions',
      linkLabel: 'Explore institution support',
    },
  },
  {
    label: 'For Businesses',
    columns: [
      {
        title: 'Team development',
        links: [
          ['Corporate training', '/for-organisations#businesses', 'Role-aware cybersecurity learning for teams.'],
          ['Security awareness', '/for-organisations#businesses', 'Practical habits for wider business audiences.'],
          ['Team upskilling', '/for-organisations#businesses', 'Build technical confidence around real workflows.'],
        ],
      },
      {
        title: 'Tailored delivery',
        links: [
          ['Custom programmes', '/for-organisations#businesses', 'Discuss outcomes, audience and delivery format.'],
          ['Web security for developers', '/courses/cybersecurity/web-application-security', 'Introduce secure application thinking.'],
          ['Contact the team', '/contact', 'Start a training conversation.'],
        ],
      },
    ],
    feature: {
      eyebrow: 'For teams',
      title: 'Training built around role and context',
      description: 'Focus on relevant risks, practical decisions and measurable learning progress.',
      href: '/for-organisations#businesses',
      linkLabel: 'Explore business training',
    },
  },
  {
    label: 'Resources',
    columns: [
      {
        title: 'Learn and reference',
        links: [
          ['Articles', '/blog', 'Beginner-friendly cybersecurity explanations.'],
          ['Learning resources', '/resources', 'Browse guides by security topic.'],
          ['Instructor profiles', '/instructors', 'Meet the educators behind the curriculum.'],
        ],
      },
      {
        title: 'Get help',
        links: [
          ['Frequently asked questions', '/faq', 'Answers about courses, labs and learning.'],
          ['Contact', '/contact', 'Ask a course or partnership question.'],
          ['Learner support', '/auth?mode=login&redirect=%2Fhelp', 'Access account and course support.'],
        ],
      },
    ],
    feature: {
      eyebrow: 'Latest guide',
      title: 'How to learn cybersecurity for beginners',
      description: 'A direct route from foundational concepts to guided practice.',
      href: '/blog/how-to-learn-cybersecurity-for-beginners',
      linkLabel: 'Read the guide',
    },
  },
]

const searchLinks = [
  ['Cyber Security Essentials', '/courses/cybersecurity/cyber-security-essentials', 'Course'],
  ['Introduction to Cyber Security', '/courses/cybersecurity/introduction-to-cyber-security', 'Course'],
  ['All cybersecurity courses', '/courses', 'Courses'],
  ['Beginner cybersecurity path', '/learning-paths/beginner-cybersecurity', 'Learning path'],
  ['SOC analyst path', '/learning-paths/soc-analyst', 'Learning path'],
  ['Ethical hacking path', '/learning-paths/ethical-hacking', 'Learning path'],
  ['Guided cyber labs', '/labs', 'Labs'],
  ['Cybersecurity articles', '/blog', 'Resources'],
  ['About Cyber Lab IN', '/about', 'Company'],
  ['Arghya Sikdar', '/instructors/arghya-sikdar', 'Instructor'],
  ['Contact Cyber Lab IN', '/contact', 'Contact'],
]

const footerGroups = [
  {
    title: 'Learn',
    links: [['Courses', '/courses'], ['Learning paths', '/learning-paths'], ['Cyber labs', '/labs'], ['Articles', '/blog'], ['Resources', '/resources']],
  },
  {
    title: 'Solutions',
    links: [['For learners', '/learning-paths/beginner-cybersecurity'], ['For colleges', '/for-organisations#institutions'], ['For universities', '/for-organisations#institutions'], ['For businesses', '/for-organisations#businesses'], ['Custom training', '/contact']],
  },
  {
    title: 'Company',
    links: [['About', '/about'], ['Instructors', '/instructors'], ['Founder profile', '/instructors/arghya-sikdar'], ['Contact', '/contact'], ['Certificate verification', '/certificate-verification']],
  },
  {
    title: 'Support',
    links: [['FAQs', '/faq'], ['Learner login', '/login'], ['Student support', '/auth?mode=login&redirect=%2Fhelp'], ['Report an issue', '/auth?mode=login&redirect=%2Freport-bug'], ['Cookie settings', '/cookie-policy']],
  },
  {
    title: 'Legal',
    links: [['Privacy policy', '/privacy-policy'], ['Terms of use', '/terms'], ['Refund policy', '/refund-policy'], ['Cookie policy', '/cookie-policy'], ['Accessibility', '/accessibility']],
  },
]

function Icon({ name, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden="true">{name}</span>
}

function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const results = useMemo(() => {
    const clean = query.trim().toLowerCase()
    if (!clean) return searchLinks
    return searchLinks.filter(([title, , type]) => `${title} ${type}`.toLowerCase().includes(clean))
  }, [query])

  useEffect(() => {
    if (!open) return undefined
    setQuery('')
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30)
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="site-overlay" role="dialog" aria-modal="true" aria-labelledby="site-search-title">
      <button type="button" className="site-overlay-backdrop" onClick={onClose} aria-label="Close search" />
      <div className="site-search-panel">
        <div className="site-search-header">
          <div>
            <p className="site-eyebrow">Search Cyber Lab IN</p>
            <h2 id="site-search-title">Find a course, path or resource</h2>
          </div>
          <button type="button" className="site-icon-button" onClick={onClose} aria-label="Close search">
            <Icon name="close" />
          </button>
        </div>
        <label className="site-search-field">
          <span className="sr-only">Search the website</span>
          <Icon name="search" />
          <input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search courses, labs and resources" />
        </label>
        <div className="site-search-results" aria-live="polite">
          {results.map(([title, href, type]) => (
            <Link key={href} to={href} onClick={onClose} className="site-search-result">
              <span><small>{type}</small>{title}</span>
              <Icon name="arrow_forward" />
            </Link>
          ))}
          {!results.length && <p className="site-empty-copy">No matching public pages. Try a broader term.</p>}
        </div>
      </div>
    </div>
  )
}

function MegaMenu({ item, open, onToggle, onClose }) {
  const menuId = `mega-${item.label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className="site-mega-trigger">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={menuId} className="site-nav-button">
        {item.label}
        <Icon name="expand_more" className={open ? 'is-open' : ''} />
      </button>
      {open && (
        <div id={menuId} className="site-mega-menu">
          <div className="site-container site-mega-grid">
            {item.columns.map(column => (
              <section key={column.title}>
                <h2>{column.title}</h2>
                <div className="site-mega-links">
                  {column.links.map(([title, href, description]) => (
                    <Link key={`${title}-${href}`} to={href} onClick={onClose}>
                      <strong>{title}</strong>
                      <span>{description}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
            <aside className="site-mega-feature">
              <p className="site-eyebrow">{item.feature.eyebrow}</p>
              <h2>{item.feature.title}</h2>
              <p>{item.feature.description}</p>
              <Link to={item.feature.href} onClick={onClose} className="site-text-link">
                {item.feature.linkLabel}<Icon name="arrow_forward" />
              </Link>
            </aside>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileMenu({ open, onClose }) {
  const [openSection, setOpenSection] = useState('')

  useEffect(() => {
    if (!open) setOpenSection('')
  }, [open])

  if (!open) return null

  return (
    <div className="site-mobile-panel" id="mobile-navigation">
      <nav aria-label="Mobile navigation">
        {megaMenus.map(item => {
          const expanded = openSection === item.label
          return (
            <div key={item.label} className="site-mobile-group">
              <button type="button" onClick={() => setOpenSection(expanded ? '' : item.label)} aria-expanded={expanded}>
                {item.label}<Icon name={expanded ? 'remove' : 'add'} />
              </button>
              {expanded && (
                <div className="site-mobile-links">
                  {item.columns.flatMap(column => column.links).map(([title, href]) => (
                    <Link key={`${item.label}-${title}-${href}`} to={href} onClick={onClose}>{title}</Link>
                  ))}
                  <Link to={item.feature.href} onClick={onClose} className="site-mobile-feature-link">{item.feature.linkLabel}</Link>
                </div>
              )}
            </div>
          )
        })}
        <Link to="/about" onClick={onClose} className="site-mobile-direct">About</Link>
        <Link to="/login" onClick={onClose} className="site-mobile-direct">Learner login</Link>
        <Link to="/courses" onClick={onClose} className="site-button-primary site-mobile-cta">Explore courses</Link>
      </nav>
    </div>
  )
}

function EnterpriseHeader({ announcement }) {
  const [openMenu, setOpenMenu] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpenMenu('')
    setMobileOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const close = event => {
      if (event.key === 'Escape') {
        setOpenMenu('')
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [])

  return (
    <>
      {announcement && (
        <div className="site-announcement">
          <div className="site-container">
            <p>{announcement.text}</p>
            <Link to={announcement.href}>{announcement.linkLabel}<Icon name="arrow_forward" /></Link>
          </div>
        </div>
      )}
      <header className="site-header">
        <div className="site-utility-bar">
          <div className="site-container">
            <nav aria-label="Utility navigation">
              {utilityLinks.map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}
            </nav>
            <Link to="/auth?mode=login&redirect=%2Fdashboard" className="site-utility-login"><Icon name="account_circle" />Learner portal</Link>
          </div>
        </div>
        <div className="site-main-nav-wrap">
          <div className="site-container site-main-nav">
            <Link to="/" className="site-logo-link" aria-label="Cyber Lab IN home">
              <CLILogo variant="full" tone="light" size={150} />
            </Link>
            <nav className="site-desktop-nav" aria-label="Primary navigation">
              {megaMenus.map(item => (
                <MegaMenu
                  key={item.label}
                  item={item}
                  open={openMenu === item.label}
                  onToggle={() => setOpenMenu(current => current === item.label ? '' : item.label)}
                  onClose={() => setOpenMenu('')}
                />
              ))}
              <Link to="/about" className="site-nav-link">About</Link>
            </nav>
            <div className="site-nav-actions">
              <button type="button" onClick={() => setSearchOpen(true)} className="site-icon-button" aria-label="Search Cyber Lab IN">
                <Icon name="search" />
              </button>
              <Link to="/login" className="site-login-link">Login</Link>
              <Link to="/courses" className="site-button-primary site-header-cta">Explore courses</Link>
              <button
                type="button"
                className="site-mobile-toggle"
                onClick={() => setMobileOpen(value => !value)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
                aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              >
                <Icon name={mobileOpen ? 'close' : 'menu'} />
              </button>
            </div>
          </div>
          <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
        </div>
      </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function EnterpriseFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="site-footer-intro">
          <div>
            <CLILogo variant="full" tone="dark" size={168} />
            <p>Practical cybersecurity education for learners, institutions and teams.</p>
          </div>
          <div>
            <p className="site-eyebrow">Contact</p>
            <a href="mailto:hello@cyberlabin.com">hello@cyberlabin.com</a>
          </div>
        </div>
        <div className="site-footer-grid">
          {footerGroups.map(group => (
            <nav key={group.title} aria-label={`${group.title} links`}>
              <h2>{group.title}</h2>
              {group.links.map(([label, href]) => <Link key={`${label}-${href}`} to={href}>{label}</Link>)}
            </nav>
          ))}
        </div>
        <div className="site-footer-bottom">
          <p>© {new Date().getFullYear()} Cyber Lab IN. All rights reserved.</p>
          <p>Third-party product and company names are trademarks of their respective owners. Their use does not imply endorsement or partnership.</p>
        </div>
      </div>
    </footer>
  )
}

export default function PublicSiteLayout({ children, announcement = null, chatbot = null }) {
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

  return (
    <div className="site-root">
      <a href="#main-content" className="site-skip-link">Skip to main content</a>
      <EnterpriseHeader announcement={announcement} />
      <main id="main-content">{children}</main>
      <EnterpriseFooter />
      {chatbot}
    </div>
  )
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="site-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href ? <Link to={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
            {index < items.length - 1 && <Icon name="chevron_right" />}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function PageIntro({ eyebrow, title, description, actions = null, children = null }) {
  return (
    <section className="site-page-intro">
      <div className="site-container">
        <div className="site-page-intro-copy">
          {eyebrow && <p className="site-eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
          {actions && <div className="site-action-row">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  )
}

export function StatePanel({ type = 'loading', title, message, action = null }) {
  const icon = type === 'error' ? 'error' : type === 'empty' ? 'inbox' : 'progress_activity'
  return (
    <div className={`site-state site-state-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon name={icon} />
      <div>
        <h2>{title}</h2>
        {message && <p>{message}</p>}
        {action}
      </div>
    </div>
  )
}
