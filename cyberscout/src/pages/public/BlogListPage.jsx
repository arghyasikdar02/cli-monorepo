import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PublicSiteLayout, { Breadcrumbs, PageIntro, StatePanel } from '../../components/site/PublicSiteLayout'
import { api } from '../../lib/api'
import SiteIcon from '../../components/ui/SiteIcon'

const categories = ['Beginner Cybersecurity', 'Ethical Hacking', 'Web Security', 'SOC & Defensive Security', 'Digital Forensics', 'Cloud Security', 'Career Guidance']

function Icon({ name }) {
  return <SiteIcon name={name} />
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || ''
  const filteredBlogs = activeCategory ? blogs.filter(blog => blog.category === activeCategory) : blogs

  useEffect(() => {
    document.title = 'Cybersecurity Articles and Guides | Cyber Lab IN'
    api.blogs()
      .then(({ blogs: result }) => setBlogs(Array.isArray(result) ? result : []))
      .catch(err => setError(err.message || 'Unable to load published resources'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicSiteLayout>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Articles' }]} />
      <PageIntro eyebrow="Articles and guides" title="Cybersecurity resources for practical learners" description="Read clear, reviewed explanations of cybersecurity concepts and connect each topic to a relevant course, learning path or guided activity." actions={<><Link to="/courses" className="site-button-primary">Explore published courses<Icon name="arrow_forward" /></Link><Link to="/resources" className="site-text-link">Browse resource topics<Icon name="arrow_forward" /></Link></>} aside={<aside className="info-callout"><p className="site-eyebrow">Editorial approach</p><p>Published resources show category, author and review information. Articles avoid unsupported outcomes and link to relevant practical learning.</p></aside>} />

      <section className="blog-index-section">
        <div className="site-container">
          <nav className="blog-category-nav" aria-label="Article categories">
            <Link to="/blog" aria-current={!activeCategory ? 'page' : undefined}>All resources</Link>
            {categories.map(category => <Link key={category} to={`/blog?category=${encodeURIComponent(category)}`} aria-current={activeCategory === category ? 'page' : undefined}>{category}</Link>)}
          </nav>
          <div className="blog-index-heading"><div><p className="site-eyebrow">{activeCategory || 'All topics'}</p><h2>{activeCategory ? `${activeCategory} resources` : 'Latest published resources'}</h2></div><p>Content below comes from the published resource database.</p></div>
          {loading && <StatePanel title="Loading published resources" />}
          {error && <StatePanel type="error" title="Resources are temporarily unavailable" message={error} />}
          {!loading && !error && !filteredBlogs.length && <StatePanel type="empty" title="No resources are published in this category" message="New articles will appear after editorial review." />}
          {!loading && !error && !!filteredBlogs.length && (
            <div className="blog-index-list">
              {filteredBlogs.map((blog, index) => (
                <article key={blog.id || blog.slug} className={index === 0 ? 'is-featured' : ''}>
                  <div className="blog-index-meta"><span>{blog.category || 'Cybersecurity guide'}</span>{(blog.publishedAt || blog.createdAt) && <time dateTime={blog.publishedAt || blog.createdAt}>{formatDate(blog.publishedAt || blog.createdAt)}</time>}</div>
                  <h2><Link to={`/blog/${blog.slug}`}>{blog.title}</Link></h2>
                  <p>{blog.excerpt}</p>
                  <div className="blog-index-author">By <Link to="/instructors/arghya-sikdar">{blog.authorName || 'Cyber Lab IN'}</Link></div>
                  <Link to={`/blog/${blog.slug}`} className="site-text-link">Read the guide<Icon name="arrow_forward" /></Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicSiteLayout>
  )
}
