import { Link } from 'react-router-dom'
import CLILogo from '../CLILogo'

export default function AuthFrame({ eyebrow = 'Cyber Lab IN access', title, description, children, footer = null }) {
  return (
    <div className="auth-frame">
      <a href="#auth-form" className="site-skip-link">Skip to access form</a>
      <aside className="auth-frame-context">
        <Link to="/" aria-label="Cyber Lab IN home"><CLILogo variant="full" tone="dark" size={180} /></Link>
        <div>
          <p className="site-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <ol aria-label="Cyber Lab IN learning workflow">
          <li><span>01</span>Access your enrolled courses</li>
          <li><span>02</span>Continue guided learning and labs</li>
          <li><span>03</span>Review progress and course activity</li>
        </ol>
      </aside>
      <main className="auth-frame-main" id="auth-form">
        <div className="auth-frame-mobile-brand"><Link to="/" aria-label="Cyber Lab IN home"><CLILogo variant="full" tone="light" size={155} /></Link></div>
        <div className="auth-frame-form">
          {children}
          {footer && <div className="auth-frame-footer">{footer}</div>}
        </div>
      </main>
    </div>
  )
}

export function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
