import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicSiteLayout, { Breadcrumbs, StatePanel } from '../../components/site/PublicSiteLayout'
import { api } from '../../lib/api'
import { serializeJsonLd } from '../../lib/structuredData'

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')

function Icon({ name }) {
  return <span className="material-symbols-outlined" aria-hidden="true">{name}</span>
}

function formatDate(value) {
  if (!value) return 'Not specified'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.blog(slug)
      .then(({ blog: result }) => {
        setBlog(result)
        setError('')
      })
      .catch(err => setError(err.message || 'Unable to load this resource'))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!blog) return
    document.title = blog.metaTitle || `${blog.title} | Cyber Lab IN`
    let meta = document.head.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', blog.metaDescription || blog.excerpt)
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `${siteUrl}/blog/${blog.slug}`)
  }, [blog])

  const schema = useMemo(() => blog ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    url: `${siteUrl}/blog/${blog.slug}`,
    articleSection: blog.category,
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.lastReviewedAt || blog.updatedAt,
    author: { '@type': 'Person', name: blog.authorName || 'Arghya Sikdar', url: `${siteUrl}/instructors/arghya-sikdar` },
    publisher: { '@type': 'EducationalOrganization', name: 'Cyber Lab IN', url: siteUrl },
  } : null, [blog])

  if (loading) return <PublicSiteLayout><StatePanel title="Loading the published guide" /></PublicSiteLayout>
  if (error || !blog) return <PublicSiteLayout><StatePanel type="error" title="Resource not found" message={error || 'This article is not currently published.'} action={<Link to="/blog" className="site-text-link">Browse published resources<Icon name="arrow_forward" /></Link>} /></PublicSiteLayout>

  return (
    <PublicSiteLayout>
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />}
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Articles', href: '/blog' }, { label: blog.title }]} />
      <article className="article-page">
        <header className="article-header">
          <div className="site-container article-header-grid">
            <div>
              <p className="site-eyebrow">{blog.category || 'Cybersecurity guide'}</p>
              <h1>{blog.title}</h1>
              <p>{blog.excerpt}</p>
            </div>
            <dl>
              <div><dt>Author</dt><dd><Link to="/instructors/arghya-sikdar">{blog.authorName || 'Arghya Sikdar'}</Link></dd></div>
              <div><dt>Published</dt><dd>{formatDate(blog.publishedAt || blog.createdAt)}</dd></div>
              <div><dt>Last reviewed</dt><dd>{formatDate(blog.lastReviewedAt || blog.updatedAt)}</dd></div>
            </dl>
          </div>
        </header>
        <div className="site-container article-body-grid">
          <aside><p className="site-eyebrow">Related learning</p><Link to="/courses/cybersecurity/cyber-security-essentials">Cyber Security Essentials</Link><Link to="/learning-paths/beginner-cybersecurity">Beginner learning path</Link><Link to="/instructors/arghya-sikdar">Author profile</Link></aside>
          <div className="article-body">{blog.body.split('\n\n').map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}</div>
        </div>
        <footer className="article-next-step"><div className="site-container"><div><p className="site-eyebrow">Apply the concept</p><h2>Continue from explanation to guided practice</h2><p>Use the beginner course and learning path to connect this topic to structured, responsible security work.</p></div><div className="site-action-row"><Link to="/courses/cybersecurity/cyber-security-essentials" className="site-button-primary">Explore Cyber Security Essentials<Icon name="arrow_forward" /></Link><Link to="/blog" className="site-text-link">Read another guide<Icon name="arrow_forward" /></Link></div></div></footer>
      </article>
    </PublicSiteLayout>
  )
}
