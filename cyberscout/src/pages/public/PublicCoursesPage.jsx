import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import PublicSiteLayout, { Breadcrumbs, PageIntro, StatePanel } from '../../components/site/PublicSiteLayout'
import { api } from '../../lib/api'
import SiteIcon from '../../components/ui/SiteIcon'
import { plannedCourses } from '../../content/publicCatalog'

function Icon({ name }) {
  return <SiteIcon name={name} />
}

function courseUrl(course) {
  return `/courses/${course.categorySlug || 'cybersecurity'}/${course.slug}`
}

function authHrefForCourse(course) {
  return `/auth?mode=login&redirect=${encodeURIComponent(`/learn/courses/${course.id}`)}`
}

export default function PublicCoursesPage() {
  const { categorySlug } = useParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = categorySlug ? 'Cybersecurity Courses | Cyber Lab IN' : 'Cybersecurity Courses | Cyber Lab IN'
    api.publicCourses()
      .then(({ courses: result }) => {
        setCourses(Array.isArray(result) ? result : [])
        setError('')
      })
      .catch(err => setError(err.message || 'Unable to load courses'))
      .finally(() => setLoading(false))
  }, [categorySlug])

  const visibleCourses = useMemo(() => {
    if (!categorySlug) return courses
    return courses.filter(course => course.categorySlug === categorySlug)
  }, [categorySlug, courses])

  if (!loading && categorySlug && courses.some(course => course.id === categorySlug)) {
    return <Navigate to={`/learn/courses/${categorySlug}`} replace />
  }

  return (
    <PublicSiteLayout>
      <Breadcrumbs items={categorySlug
        ? [{ label: 'Home', href: '/' }, { label: 'Courses', href: '/courses' }, { label: 'Cybersecurity' }]
        : [{ label: 'Home', href: '/' }, { label: 'Courses' }]}
      />
      <PageIntro
        eyebrow="Cyber Lab IN courses"
        title="Practical cybersecurity courses built around guided work"
        description="Browse published online courses with clear prerequisites, course-specific materials and practical exercises designed for responsible learning."
        actions={
          <>
            <Link to="/learning-paths" className="site-button-primary">Compare learning paths<Icon name="arrow_forward" /></Link>
            <Link to="/contact" className="site-text-link">Ask about a course<Icon name="arrow_forward" /></Link>
          </>
        }
        aside={<aside className="catalog-intro-note">
          <p className="site-eyebrow">How access works</p>
          <p>Published details are open to everyone. Lessons, materials and progress remain available only to authenticated learners with the relevant course enrolment.</p>
        </aside>}
      />

      <section className="catalog-section">
        <div className="site-container">
          <div className="catalog-heading">
            <div><p className="site-eyebrow">Published catalogue</p><h2>{categorySlug ? 'Cybersecurity courses' : 'All courses'}</h2></div>
            <p>Course information below comes from the current Cyber Lab IN course database.</p>
          </div>
          {loading && <StatePanel title="Loading published courses" message="Retrieving the current course catalogue." />}
          {error && <StatePanel type="error" title="The course catalogue is unavailable" message={error} action={<Link to="/contact" className="site-text-link">Contact Cyber Lab IN<Icon name="arrow_forward" /></Link>} />}
          {!loading && !error && !visibleCourses.length && <StatePanel type="empty" title="No published courses in this category" message="Browse all published courses or contact the team for programme information." action={<Link to="/courses" className="site-text-link">View all courses<Icon name="arrow_forward" /></Link>} />}
          {!loading && !error && !!visibleCourses.length && (
            <div className="catalog-list">
              {visibleCourses.map((course, index) => (
                <article key={course.id} className="catalog-row">
                  <div className="catalog-row-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
                  <div className="catalog-row-main">
                    <p>{course.category || 'Cybersecurity'} · {course.level}</p>
                    <h2><Link to={courseUrl(course)}>{course.title}</Link></h2>
                    <p>{course.description}</p>
                  </div>
                  <dl>
                    <div><dt>Duration</dt><dd>{course.duration || 'See course details'}</dd></div>
                    <div><dt>Mode</dt><dd>{course.mode || 'Online'}</dd></div>
                    <div><dt>Credential</dt><dd>{course.credential || 'See course details'}</dd></div>
                  </dl>
                  <div className="catalog-row-actions">
                    <Link to={courseUrl(course)} className="site-button-primary">View course<Icon name="arrow_forward" /></Link>
                    <Link to={authHrefForCourse(course)} className="site-text-link">Start learning<Icon name="arrow_forward" /></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {!categorySlug && (
        <section className="catalog-roadmap-section">
          <div className="site-container">
            <div className="catalog-heading">
              <div><p className="site-eyebrow">Course roadmap</p><h2>Coming next</h2></div>
              <p>These courses are planned and are not open for enrolment. Join a waitlist to ask about scope or future availability.</p>
            </div>
            <div className="catalog-roadmap-list">
              {Object.entries(plannedCourses).map(([slug, course]) => (
                <article key={slug}>
                  <div><span>Planned</span><small>{course.level}</small></div>
                  <h3><Link to={`/courses/cybersecurity/${slug}`}>{course.title}</Link></h3>
                  <p>{course.summary}</p>
                  <Link to={`/courses/cybersecurity/${slug}`} className="site-text-link">View planned scope<Icon name="arrow_forward" /></Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="catalog-guidance">
        <div className="site-container">
          <div><p className="site-eyebrow">Not sure where to begin?</p><h2>Choose a path before choosing a specialisation.</h2></div>
          <p>Complete beginners can start with the cybersecurity foundations path. It connects the published courses to the concepts and practical work that should come next.</p>
          <Link to="/learning-paths/beginner-cybersecurity" className="site-button-secondary">View the beginner path<Icon name="arrow_forward" /></Link>
        </div>
      </section>
    </PublicSiteLayout>
  )
}
