import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicSiteLayout, { Breadcrumbs } from './PublicSiteLayout'

export default function PublicLegalPage({ title, description, updated, sections, children = null }) {
  useEffect(() => {
    document.title = `${title} | Cyber Lab IN`
  }, [title])

  return (
    <PublicSiteLayout>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: title }]} />
      <article className="legal-page">
        <header><div className="site-container"><p className="site-eyebrow">Legal information</p><h1>{title}</h1><p>{description}</p><time>{updated}</time></div></header>
        <div className="site-container legal-page-grid">
          <aside aria-label="Policy sections"><p className="site-eyebrow">On this page</p>{sections.map((section, index) => <a key={section.title} href={`#legal-${index + 1}`}>{section.title}</a>)}</aside>
          <div className="legal-page-content">
            {sections.map((section, index) => <section key={section.title} id={`legal-${index + 1}`}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{section.title}</h2><p>{section.content}</p></div></section>)}
            {children}
            <nav className="legal-related" aria-label="Related legal pages"><Link to="/privacy-policy">Privacy policy</Link><Link to="/terms">Terms of service</Link><Link to="/refund-policy">Refund policy</Link><Link to="/cookie-policy">Cookie policy</Link></nav>
          </div>
        </div>
      </article>
    </PublicSiteLayout>
  )
}
