import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicSiteLayout, { Breadcrumbs, StatePanel } from '../../components/site/PublicSiteLayout'
import LeadCaptureForm from '../../components/ui/LeadCaptureForm'
import { api } from '../../lib/api'
import { serializeJsonLd } from '../../lib/structuredData'
import { trackEvent } from '../../lib/analytics'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import SiteIcon from '../../components/ui/SiteIcon'

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')

function Icon({ name }) {
  return <SiteIcon name={name} />
}

function authHrefForCourse(course) {
  return `/auth?mode=login&redirect=${encodeURIComponent(`/learn/courses/${course.id}`)}`
}

function courseFaqsFor(course) {
  return [
    ['Can a complete beginner take this course?', `Yes. The listed prerequisite is ${course.prerequisites || 'basic computer and internet knowledge'}.`],
    ['What happens after enrolment?', 'The learner dashboard shows the lessons, materials, labs and progress attached to the active course enrolment.'],
    ['Are the labs unrestricted security targets?', 'No. Practical work follows an authorised scope and focuses on observation, safe testing and defensive reporting.'],
    ['Is employment guaranteed?', 'No. The course builds foundation knowledge and practical habits, but it does not guarantee placement or employment.'],
  ]
}

function CourseLeadModal({ course, onClose }) {
  const modalRef = useRef(null)
  useFocusTrap(modalRef, true, onClose)

  return (
    <div className="course-modal" role="dialog" aria-modal="true" aria-labelledby="course-modal-title">
      <button type="button" className="course-modal-backdrop" onClick={onClose} aria-label="Close course guidance form" tabIndex="-1" />
      <div className="course-modal-panel" ref={modalRef}>
        <div className="course-modal-heading">
          <div><p className="site-eyebrow">Course guidance</p><h2 id="course-modal-title">Interested in {course.title}?</h2><p>Ask a course question or request a callback.</p></div>
          <button type="button" onClick={onClose} className="site-icon-button" aria-label="Close course guidance form"><Icon name="close" /></button>
        </div>
        <LeadCaptureForm courseId={course.id} source="course_popup" compact title="Share your details" defaultMessage={`I am interested in ${course.title}.`} onSuccess={onClose} />
      </div>
    </div>
  )
}

export default function PublicCoursePage() {
  const { categorySlug, courseSlug } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    api.publicCourseBySlug(categorySlug, courseSlug)
      .then(({ course: result }) => {
        setCourse(result)
        setError('')
      })
      .catch(err => setError(err.message || 'Unable to load course'))
      .finally(() => setLoading(false))
  }, [categorySlug, courseSlug])

  useEffect(() => {
    if (!course) return undefined
    const key = `cli_course_popup_${course.id}`
    const previousAction = Number(localStorage.getItem(key) || 0)
    const recentlyHandled = previousAction && Date.now() - previousAction < 14 * 24 * 60 * 60 * 1000
    if (recentlyHandled) return undefined
    const timer = window.setTimeout(() => setShowPopup(true), 7000)
    const onScroll = () => {
      if (window.scrollY > 760) {
        setShowPopup(true)
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [course])

  const closePopup = () => {
    if (course) localStorage.setItem(`cli_course_popup_${course.id}`, String(Date.now()))
    setShowPopup(false)
  }

  const schema = useMemo(() => {
    if (!course) return null
    const url = `${siteUrl}/courses/${course.categorySlug}/${course.slug}`
    const courseFaqs = courseFaqsFor(course)
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'EducationalOrganization', '@id': `${siteUrl}/#organization`, name: 'Cyber Lab IN', url: siteUrl },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
            { '@type': 'ListItem', position: 2, name: 'Courses', item: `${siteUrl}/courses` },
            { '@type': 'ListItem', position: 3, name: 'Cybersecurity', item: `${siteUrl}/courses/cybersecurity` },
            { '@type': 'ListItem', position: 4, name: course.title, item: url },
          ],
        },
        {
          '@type': 'Course',
          name: course.title,
          description: course.description,
          educationalLevel: course.level,
          educationalCredentialAwarded: course.credential,
          coursePrerequisites: course.prerequisites,
          provider: { '@id': `${siteUrl}/#organization` },
          instructor: { '@type': 'Person', name: course.instructorName || course.instructor?.name || 'Cyber Lab IN faculty' },
          ...(Number(course.price || 0) > 0 ? { offers: { '@type': 'Offer', priceCurrency: 'INR', price: String(course.price), url } } : {}),
          hasCourseInstance: { '@type': 'CourseInstance', courseMode: course.mode, courseWorkload: course.duration === '7 days' ? 'P7D' : course.duration },
        },
        { '@type': 'FAQPage', mainEntity: courseFaqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
      ],
    }
  }, [course])

  useEffect(() => {
    if (!course) return
    document.title = `${course.title} | Cyber Lab IN`
    let meta = document.head.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', course.description)
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `${siteUrl}/courses/${course.categorySlug}/${course.slug}`)
    trackEvent('pricing_view', { course_id: course.id, configured_price: Number(course.price || 0) > 0 })
  }, [course])

  if (loading) {
    return <PublicSiteLayout><StatePanel title="Loading course details" message="Retrieving the published course information." /></PublicSiteLayout>
  }
  if (error || !course) {
    return <PublicSiteLayout><StatePanel type="error" title="Course not found" message={error || 'This course is not currently published.'} action={<Link to="/courses" className="site-text-link">Browse courses<Icon name="arrow_forward" /></Link>} /></PublicSiteLayout>
  }

  const details = [
    ['Level', course.level],
    ['Duration', course.duration],
    ['Format', course.mode],
    ['Schedule', 'Not published'],
    ['Credential', course.credential],
    ['Prerequisites', course.prerequisites],
    ['Instructor', course.instructorName || course.instructor?.name],
    ['Language', 'Not published'],
    ['Fee', Number(course.price || 0) > 0 ? `INR ${Number(course.price).toLocaleString('en-IN')}` : 'Not published'],
  ]
  const relatedGuides = [
    ['What is cybersecurity?', '/blog/what-is-cybersecurity'],
    ['What is phishing and how to prevent it?', '/blog/what-is-phishing-and-how-to-prevent-it'],
    ['How to learn cybersecurity for beginners?', '/blog/how-to-learn-cybersecurity-for-beginners'],
  ]
  const courseFaqs = courseFaqsFor(course)

  return (
    <PublicSiteLayout>
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />}
      {showPopup && <CourseLeadModal course={course} onClose={closePopup} />}
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Courses', href: '/courses' }, { label: 'Cybersecurity', href: '/courses/cybersecurity' }, { label: course.title }]} />

      <section className="course-hero">
        <div className="site-container course-hero-grid">
          <div>
            <p className="site-eyebrow">{course.category || 'Cybersecurity course'}</p>
            <h1>{course.title}</h1>
            <p>{course.overview || course.description}</p>
            <div className="site-action-row">
              <Link to={authHrefForCourse(course)} className="site-button-primary" onClick={() => trackEvent('enrollment_start', { course_id: course.id })}>Start enrolment<Icon name="arrow_forward" /></Link>
              {course.brochureUrl
                ? <a href={course.brochureUrl} className="site-button-secondary" onClick={() => trackEvent('syllabus_download', { course_id: course.id })}>Download syllabus<Icon name="download" /></a>
                : <span className="course-brochure-note"><Icon name="info" />Brochure not yet published</span>}
            </div>
          </div>
          <aside className="course-summary" aria-label="Course details">
            <p className="site-eyebrow">Course at a glance</p>
            <dl>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'See course details'}</dd></div>)}</dl>
          </aside>
        </div>
      </section>

      <section className="course-overview-section">
        <div className="site-container course-overview-grid">
          <div>
            <p className="site-eyebrow">Course overview</p>
            <h2>Who this course is for</h2>
            <p>The course is designed for the learner groups listed below, with the stated prerequisites setting the expected starting point.</p>
          </div>
          <ul className="course-check-list">{(course.audience || []).map(item => <li key={item}><Icon name="check_circle" />{item}</li>)}</ul>
        </div>
      </section>

      <section className="course-fit-section">
        <div className="site-container course-fit-grid">
          <div><p className="site-eyebrow">A good fit when</p><h2>You want a structured first course</h2><ul>{(course.audience || []).slice(0, 5).map(item => <li key={item}><Icon name="check_circle" />{item}</li>)}</ul></div>
          <div><p className="site-eyebrow">Not designed for</p><h2>Advanced or unrestricted testing</h2><ul><li>Learners looking for advanced penetration-testing content</li><li>Anyone seeking unrestricted offensive infrastructure</li><li>Learners expecting a placement or employment guarantee</li></ul></div>
        </div>
      </section>

      <section className="course-curriculum-section">
        <div className="site-container">
          <div className="course-section-heading"><div><p className="site-eyebrow">Curriculum and practice</p><h2>Modules and guided labs</h2></div><p>Public curriculum details show the course structure. Private lesson material remains protected until a learner has the relevant enrolment.</p></div>
          {!!course.modules?.length && (
            <div className="course-module-list">
              {course.modules.map((module, index) => (
                <details key={module.id || module.title} open={index === 0} onToggle={event => event.currentTarget.open && trackEvent('curriculum_expansion', { course_id: course.id, module_id: module.id })}>
                  <summary><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{module.title}</h3>{module.description && <p>{module.description}</p>}<small>{module.lessons?.length || 0} published lesson{module.lessons?.length === 1 ? '' : 's'}</small></div><Icon name="expand_more" /></summary>
                  {!!module.lessons?.length && <ul>{module.lessons.map(lesson => <li key={lesson.id}>{lesson.title}<span>{lesson.duration}</span></li>)}</ul>}
                </details>
              ))}
            </div>
          )}
          {!course.modules?.length && <StatePanel type="empty" title="Public module outline is not yet available" message="Enrolled learners can access course content after it is published to the learning system." />}
          {!!course.labs?.length && (
            <div className="course-lab-list">
              <div><p className="site-eyebrow">Practical work</p><h3>Guided lab topics</h3><p>Each activity connects a course concept to observation and defensive reporting.</p></div>
              <ol>{course.labs.map((lab, index) => <li key={lab}><span>Lab {String(index + 1).padStart(2, '0')}</span><strong>{lab}</strong></li>)}</ol>
            </div>
          )}
        </div>
      </section>

      <section className="course-tools-section">
        <div className="site-container course-tools-grid">
          <div><p className="site-eyebrow">Tools and delivery details</p><h2>Course-specific tools are introduced inside each exercise</h2><p>A public tool list has not been published for this course. Cyber Lab IN does not claim tool coverage until it is attached to the curriculum.</p></div>
          <dl><div><dt>Delivery</dt><dd>{course.mode}</dd></div><div><dt>Certificate</dt><dd>{course.credential}</dd></div><div><dt>Current cohort</dt><dd>Contact the team for schedule and language</dd></div></dl>
        </div>
      </section>

      <section className="course-outcomes-section">
        <div className="site-container course-overview-grid">
          <div><p className="site-eyebrow">Learning outcomes</p><h2>What learners should be able to explain or do</h2><p>These outcomes describe the intended foundation. They do not represent an employment or placement guarantee.</p></div>
          <ol className="course-outcomes-list">{(course.outcomes || []).map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>)}</ol>
        </div>
      </section>

      <section className="course-related-section">
        <div className="site-container course-related-grid">
          <div><p className="site-eyebrow">Continue exploring</p><h2>Related guides and learning paths</h2><p>Read the concepts behind the course, then compare the beginner learning path before enrolling.</p><Link to="/learning-paths/beginner-cybersecurity" className="site-button-secondary">View beginner learning path<Icon name="arrow_forward" /></Link></div>
          <div>{relatedGuides.map(([label, href]) => <Link key={href} to={href}><span>Guide</span><strong>{label}</strong><Icon name="arrow_forward" /></Link>)}</div>
        </div>
      </section>

      <section className="course-faq-section">
        <div className="site-container course-faq-grid"><div><p className="site-eyebrow">Course FAQ</p><h2>Details to check before enrolment</h2><p>For pricing, cohort timing or delivery language, request the current course details rather than relying on an old announcement.</p></div><div>{courseFaqs.map(([question, answer]) => <details key={question}><summary>{question}<Icon name="expand_more" /></summary><p>{answer}</p></details>)}</div></div>
      </section>

      <section className="course-policy-summary">
        <div className="site-container"><div><p className="site-eyebrow">Refund summary</p><h2>Check eligibility before purchase</h2><p>The current policy allows eligible refund requests within seven days when no more than 20% of the course has been accessed. Promotional purchases, certificates and one-time lab credits have separate limits.</p></div><Link to="/refund-policy" className="site-text-link">Read the full refund policy<Icon name="arrow_forward" /></Link></div>
      </section>

      <section className="course-contact-section">
        <div className="site-container course-contact-grid">
          <div><p className="site-eyebrow">Course guidance</p><h2>Ask a specific question about {course.title}</h2><p>Share your details and the team will respond about course access, fit or current availability.</p></div>
          <LeadCaptureForm courseId={course.id} source="course_page" title={`Ask about ${course.title}`} defaultMessage={`I want details about ${course.title}.`} />
        </div>
      </section>
    </PublicSiteLayout>
  )
}
