import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicSiteLayout, { StatePanel } from '../../components/site/PublicSiteLayout'
import LeadCaptureForm from '../../components/ui/LeadCaptureForm'
import FaqChatbot from '../../components/ui/FaqChatbot'
import SiteIcon from '../../components/ui/SiteIcon'
import CyberCareerRoadmap from '../../components/home/CyberCareerRoadmap'
import HeroSection from '../../components/home/HeroSection'
import { api } from '../../lib/api'
import { trackEvent } from '../../lib/analytics'
import { featuredCourseFallback, homepageFaqs, learningPaths, learningSteps, sampleLabs } from '../../content/homeContent'

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')
const ogImageUrl = `${siteUrl}/social/cyber-lab-in-home.png`

const metadata = {
  title: 'Online Cybersecurity Courses with Hands-On Labs | Cyber Lab IN',
  description: 'Learn cybersecurity online through guided lessons, hands-on labs and practical security scenarios. Explore beginner courses in phishing, web security, SOC analysis, ethical hacking and defensive security.',
  ogTitle: 'Learn Cybersecurity Through Real Investigations',
  ogDescription: 'Beginner-friendly cybersecurity training with guided labs, clear defensive workflows and course-specific learning.',
}

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
}

function courseUrl(course) {
  return `/courses/${course.categorySlug || 'cybersecurity'}/${course.slug}`
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export default function WelcomePage() {
  const [courses, setCourses] = useState([])
  const [courseState, setCourseState] = useState('loading')
  const [blogs, setBlogs] = useState([])

  const featuredCourse = useMemo(
    () => courses.find(course => course.slug === 'cyber-security-essentials') || featuredCourseFallback,
    [courses],
  )

  useEffect(() => {
    document.title = metadata.title
    upsertMeta('meta[name="description"]', { name: 'description', content: metadata.description })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index,follow,max-image-preview:large' })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: metadata.ogTitle })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: metadata.ogDescription })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: `${siteUrl}/` })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImageUrl })
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' })
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' })
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: 'Cyber Lab IN practical cybersecurity learning' })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: metadata.ogTitle })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: metadata.ogDescription })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImageUrl })
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: `${siteUrl}/` })
  }, [])

  useEffect(() => {
    let active = true
    api.blogs()
      .then(({ blogs: published }) => active && setBlogs((published || []).slice(0, 4)))
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    api.publicCourses()
      .then(result => {
        if (!active) return
        setCourses(Array.isArray(result.courses) ? result.courses : [])
        setCourseState('ready')
      })
      .catch(() => active && setCourseState('fallback'))
    return () => { active = false }
  }, [])

  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'EducationalOrganization', '@id': `${siteUrl}/#organization`, name: 'Cyber Lab IN', url: `${siteUrl}/`, logo: `${siteUrl}/brand/cyber-lab-in-full-light.webp`, founder: { '@type': 'Person', name: 'Arghya Sikdar', url: `${siteUrl}/instructors/arghya-sikdar` } },
        { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: 'Cyber Lab IN', publisher: { '@id': `${siteUrl}/#organization` } },
        { '@type': 'WebPage', '@id': `${siteUrl}/#webpage`, url: `${siteUrl}/`, name: metadata.title, description: metadata.description, isPartOf: { '@id': `${siteUrl}/#website` } },
        { '@type': 'ItemList', name: 'Published Cyber Lab IN courses', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Cyber Security Essentials', url: `${siteUrl}/courses/cybersecurity/cyber-security-essentials` },
          { '@type': 'ListItem', position: 2, name: 'Introduction to Cyber Security', url: `${siteUrl}/courses/cybersecurity/introduction-to-cyber-security` },
        ] },
        { '@type': 'FAQPage', mainEntity: homepageFaqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
      ],
    }
    let script = document.getElementById('home-structured-data')
    if (!script) {
      script = document.createElement('script')
      script.id = 'home-structured-data'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(structuredData)
    return () => script.remove()
  }, [])

  return (
    <PublicSiteLayout chatbot={<FaqChatbot />}>
      <HeroSection />

      <section className="home-roadmap-section">
        <div className="site-container">
          <CyberCareerRoadmap />
        </div>
      </section>

      <section className="home-trust-section" aria-labelledby="trust-title">
        <div className="site-container home-trust-grid">
          <div><p className="site-eyebrow">Course standards</p><h2 id="trust-title">Clear teaching, guided practice and accountable access</h2></div>
          <div className="home-trust-list">
            <article><strong>Arghya Sikdar</strong><p>Founder, cybersecurity educator and course instructor with CEH and CHFI credentials.</p></article>
            <article><strong>Guided practice</strong><p>Lab tasks state the evidence, authorised scope and expected defensive finding.</p></article>
            <article><strong>Clear course access</strong><p>Lessons, materials and progress are attached to the learner’s active enrolment.</p></article>
          </div>
        </div>
      </section>

      <section className="home-section home-course-focus" id="course">
        <div className="site-container">
          <div className="home-section-heading"><div><p className="site-eyebrow">Published beginner course</p><h2>Cyber Security Essentials</h2></div><p>{featuredCourse.description}</p></div>
          {courseState === 'loading' && <StatePanel title="Loading course details" message="The course outline will appear shortly." />}
          {courseState === 'fallback' && <p className="home-data-note" role="status">Course updates are temporarily unavailable. The published outline is still available below.</p>}
          {courseState !== 'loading' && (
            <div className="home-course-product">
              <div className="home-course-outcome">
                <p className="site-eyebrow">Who it is for</p>
                <h3>A practical starting point for complete beginners</h3>
                <p>Learn to inspect suspicious messages, strengthen account settings, understand basic web behaviour and write a clear defensive security finding.</p>
                <ul><li><SiteIcon name="check_circle" />No programming prerequisite listed</li><li><SiteIcon name="check_circle" />Guided beginner labs</li><li><SiteIcon name="check_circle" />Certificate of Completion</li></ul>
              </div>
              <dl className="home-course-details">
                <div><dt>Level</dt><dd>{featuredCourse.level}</dd></div>
                <div><dt>Duration</dt><dd>{featuredCourse.duration}</dd></div>
                <div><dt>Format</dt><dd>{featuredCourse.mode}</dd></div>
                <div><dt>Lessons</dt><dd>{featuredCourse.lessonCount || 'See curriculum'}</dd></div>
                <div><dt>Guided lab topics</dt><dd>{featuredCourse.labs?.length || 'See curriculum'}</dd></div>
                <div><dt>Instructor</dt><dd>{featuredCourse.instructorName || 'Arghya Sikdar'}</dd></div>
                <div><dt>Language</dt><dd>Not published</dd></div>
                <div><dt>Fee</dt><dd>{Number(featuredCourse.price || 0) > 0 ? `INR ${Number(featuredCourse.price).toLocaleString('en-IN')}` : 'Not published'}</dd></div>
              </dl>
              <div className="home-course-actions"><Link to={courseUrl(featuredCourse)} className="site-button-primary" onClick={() => trackEvent('course_card_click', { course_id: featuredCourse.id })}>View curriculum<SiteIcon name="arrow_forward" /></Link><Link to="/contact" className="site-text-link">Ask about the course<SiteIcon name="arrow_forward" /></Link></div>
            </div>
          )}
        </div>
      </section>

      <section className="home-section home-practical-process">
        <div className="site-container">
          <div className="home-section-heading"><div><p className="site-eyebrow">How practical learning works</p><h2>From explanation to a defensible finding</h2></div><p>Each stage tells the learner what to understand, what evidence to inspect and what to submit.</p></div>
          <ol className="home-step-list">{learningSteps.map(([number, title, description]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
        </div>
      </section>

      <section className="home-lab-examples" id="labs">
        <div className="site-container home-lab-examples-grid">
          <div className="home-lab-examples-intro"><p className="site-eyebrow">Example labs</p><h2>Practise the actions a beginner needs to understand</h2><p>These public overviews explain the task. Full instructions, evidence and submissions remain inside enrolled course access.</p><Link to="/labs" className="site-text-link">Understand the lab experience<SiteIcon name="arrow_forward" /></Link></div>
          <div className="home-lab-example-list">{sampleLabs.map(([title, description, href], index) => <Link key={href} to={href} onClick={() => trackEvent('sample_lab_launch', { lab: href.split('/').pop() })}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{description}</p></div><SiteIcon name="arrow_forward" /></Link>)}</div>
        </div>
      </section>

      <section className="home-section home-paths-focused" id="learning-paths">
        <div className="site-container">
          <div className="home-section-heading"><div><p className="site-eyebrow">Learning paths</p><h2>Begin with foundations, then choose a direction</h2></div><p>Cybersecurity Foundations is available now. Specialist paths show what you can study next as new courses are published.</p></div>
          <div className="home-path-status-list">{learningPaths.map(([title, status, level, description, href]) => <article key={href}><div><span className={status === 'Available now' ? 'is-available' : ''}>{status}</span><small>{level}</small></div><h3>{title}</h3><p>{description}</p><Link to={href} className="site-text-link">View path details<SiteIcon name="arrow_forward" /></Link></article>)}</div>
        </div>
      </section>

      <section className="home-instructor-focused">
        <div className="site-container home-instructor-focused-grid">
          <div><p className="site-eyebrow">Course instructor</p><h2>Arghya Sikdar</h2><p>Founder and CEO of Cyber Lab IN, Assistant Professor and cybersecurity educator with more than 13 years of combined industry and academic experience.</p><p>His teaching covers ethical hacking, VAPT, digital forensics, DevSecOps, cloud security, network security and practical security reporting.</p><Link to="/instructors/arghya-sikdar" className="site-text-link">Read the full instructor profile<SiteIcon name="arrow_forward" /></Link></div>
          <aside><p className="site-eyebrow">Credentials</p><dl><div><dt>CEH</dt><dd>EC-Council Certified Ethical Hacker</dd></div><div><dt>CHFI</dt><dd>EC-Council Computer Hacking Forensic Investigator</dd></div></dl></aside>
        </div>
      </section>

      {!!blogs.length && <section className="home-resources-focused">
        <div className="site-container">
          <div className="home-section-heading"><div><p className="site-eyebrow">Reviewed resources</p><h2>Latest cybersecurity guides</h2></div><p>Published articles explain beginner topics and connect them to the relevant course, lab or learning path.</p></div>
          <div className="home-resource-list">{blogs.map(blog => <article key={blog.id || blog.slug}><div><span>{blog.category}</span>{blog.publishedAt && <time dateTime={blog.publishedAt}>{formatDate(blog.publishedAt)}</time>}</div><h3><Link to={`/blog/${blog.slug}`}>{blog.title}</Link></h3><p>{blog.excerpt}</p><small>By <Link to="/instructors/arghya-sikdar">{blog.authorName || 'Arghya Sikdar'}</Link></small><Link to={`/blog/${blog.slug}`} className="site-text-link">Read the guide<SiteIcon name="arrow_forward" /></Link></article>)}</div>
          <Link to="/blog" className="site-button-secondary">Browse all resources</Link>
        </div>
      </section>}

      <section className="home-section home-faq" id="faq">
        <div className="site-container home-faq-grid">
          <div><p className="site-eyebrow">Course questions</p><h2>What beginners usually need to know</h2><p>These answers use the published course record. Contact the team for cohort-specific schedule, language and fee details.</p><Link to="/contact" className="site-text-link">Ask a course question<SiteIcon name="arrow_forward" /></Link></div>
          <div>{homepageFaqs.map(([question, answer]) => <details key={question}><summary>{question}<SiteIcon name="expand_more" /></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="home-final-cta home-final-course-cta">
        <div className="site-container home-final-grid">
          <div><p className="site-eyebrow">Cyber Security Essentials</p><h2>Start with a course built for complete beginners</h2><p>Review the curriculum, practical labs and prerequisites before you enrol.</p><div className="site-action-row"><Link to="/courses/cybersecurity/cyber-security-essentials" className="site-button-primary">Explore the beginner course<SiteIcon name="arrow_forward" /></Link><Link to="/contact" className="site-text-link">Request course details<SiteIcon name="arrow_forward" /></Link></div></div>
          <LeadCaptureForm title="Request course details" source="landing_form" defaultMessage="I would like current details about Cyber Security Essentials." />
        </div>
      </section>
    </PublicSiteLayout>
  )
}
