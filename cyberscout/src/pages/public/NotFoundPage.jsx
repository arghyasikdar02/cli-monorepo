import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicSiteLayout from '../../components/site/PublicSiteLayout'
import SiteIcon from '../../components/ui/SiteIcon'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found | Cyber Lab IN'
  }, [])

  return (
    <PublicSiteLayout>
      <section className="not-found-page">
        <div className="site-container">
          <p className="site-eyebrow">Error 404</p>
          <h1>This page could not be found</h1>
          <p>The address may have changed, or the page may no longer be available. Use the links below to continue.</p>
          <div className="site-action-row">
            <Link to="/" className="site-button-primary">Return to the homepage</Link>
            <Link to="/courses" className="site-text-link">Browse courses<SiteIcon name="arrow_forward" /></Link>
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  )
}
