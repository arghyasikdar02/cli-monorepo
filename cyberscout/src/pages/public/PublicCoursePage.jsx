import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'
import LeadCaptureForm from '../../components/ui/LeadCaptureForm'
import { api } from '../../lib/api'

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')

function authHrefForCourse(course) {
  return `/auth?mode=login&redirect=${encodeURIComponent(`/learn/courses/${course.id}`)}`
}

function Modal({ course, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label="Course guidance form">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-[0_28px_90px_rgba(15,23,42,0.28)]">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="font-space-grotesk text-lg font-bold text-slate-950">Interested in {course.title}?</p>
            <p className="text-sm text-slate-500">Ask a question or request a callback.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close lead form">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <LeadCaptureForm
          courseId={course.id}
          source="course_popup"
          compact
          title="Course guidance"
          defaultMessage={`I am interested in ${course.title}.`}
          onSuccess={onClose}
        />
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
      .then(({ course }) => {
        setCourse(course)
        setError('')
      })
      .catch(err => setError(err.message || 'Unable to load course'))
      .finally(() => setLoading(false))
  }, [categorySlug, courseSlug])

  useEffect(() => {
    if (!course) return
    const key = `cli_course_popup_${course.id}`
    if (localStorage.getItem(key)) return
    const timer = window.setTimeout(() => setShowPopup(true), 4500)
    const onScroll = () => {
      if (window.scrollY > 520) {
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
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'Cyber Lab IN', url: siteUrl },
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
          instructor: { '@type': 'Person', name: course.instructorName || course.instructor?.name || 'Arghya Sikdar' },
          offers: { '@type': 'Offer', priceCurrency: 'INR', price: String(course.price || 0), url },
          hasCourseInstance: { '@type': 'CourseInstance', courseMode: course.mode, courseWorkload: course.duration === '7 days' ? 'P7D' : course.duration },
        },
      ],
    }
  }, [course])

  useEffect(() => {
    if (!course) return
    document.title = `${course.title} | Cyber Lab IN`
    const description = course.description
    let meta = document.head.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
  }, [course])

  if (loading) return <div className="min-h-screen bg-white p-8 text-slate-600">Loading course...</div>
  if (error || !course) return <div className="min-h-screen bg-white p-8 text-red-700">{error || 'Course not found'}</div>

  const details = [
    ['Course name', course.title],
    ['Level', course.level],
    ['Mode', course.mode],
    ['Duration', course.duration],
    ['Credential', course.credential],
    ['Prerequisites', course.prerequisites],
    ['Instructor', course.instructorName || course.instructor?.name],
    ['Fee', Number(course.price || 0) > 0 ? `INR ${Number(course.price).toLocaleString('en-IN')}` : 'Free'],
  ]

  const relatedGuides = [
    ['What is cybersecurity?', '/blog/what-is-cybersecurity'],
    ['What is phishing and how to prevent it?', '/blog/what-is-phishing-and-how-to-prevent-it'],
    ['How to learn cybersecurity for beginners?', '/blog/how-to-learn-cybersecurity-for-beginners'],
  ]

  return (
    <div className="min-h-screen bg-white text-slate-950">
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
      {showPopup && <Modal course={course} onClose={closePopup} />}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/"><CLILogo variant="full" tone="light" size={150} /></Link>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
            <Link to="/courses" className="hover:text-slate-950">Courses</Link>
            <Link to="/blog" className="hover:text-slate-950">Blog</Link>
            <Link to={authHrefForCourse(course)} className="rounded-lg bg-slate-950 px-4 py-2.5 text-white">Enroll</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="bg-slate-950 px-5 py-14 text-white sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <nav className="mb-10 flex flex-wrap items-center gap-2 text-sm text-slate-300" aria-label="Breadcrumb">
              <Link to="/" className="font-semibold text-white">Home</Link>
              <span>/</span>
              <Link to="/courses" className="font-semibold text-white">Courses</Link>
              <span>/</span>
              <Link to="/courses/cybersecurity" className="font-semibold text-white">Cybersecurity</Link>
              <span>/</span>
              <span>{course.title}</span>
            </nav>
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <p className="font-space-grotesk text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Hands-on cybersecurity training</p>
                <h1 className="mt-4 font-space-grotesk text-4xl font-black tracking-tight sm:text-6xl">{course.title}</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{course.overview || course.description}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to={authHrefForCourse(course)} className="inline-flex justify-center rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-slate-950">Enroll Now</Link>
                  {course.brochureUrl ? (
                    <a href={course.brochureUrl} className="inline-flex justify-center rounded-lg border border-white/20 px-6 py-3.5 text-sm font-bold text-white">Download Brochure</a>
                  ) : (
                    <button type="button" disabled className="inline-flex justify-center rounded-lg border border-white/15 px-6 py-3.5 text-sm font-bold text-white/55">Brochure coming soon</button>
                  )}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {details.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="mt-2 font-space-grotesk text-lg font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-3">
            {[
              ['Who it is for', course.audience],
              ['What it covers', ['Cybersecurity fundamentals', 'Phishing prevention', 'Web request-response basics', 'Unsafe input', 'Account hardening', 'Defensive reporting']],
              ['Course outcomes', course.outcomes],
            ].map(([title, items]) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-space-grotesk text-xl font-black">{title}</h2>
                <ul className="mt-5 space-y-3">
                  {(items || []).map(item => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                      <span className="material-symbols-outlined text-[18px] text-sky-700">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Labs and modules</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              These labs connect course concepts to safe, guided cybersecurity practice and defensive reporting.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {(course.labs || []).map((lab, index) => (
                <div key={lab} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="font-space-grotesk text-sm font-bold text-sky-700">Lab {String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-2 font-space-grotesk text-lg font-bold">{lab}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="font-space-grotesk text-2xl font-black">Related cybersecurity resources</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                These guides help learners understand the concepts behind the course before they practise them in labs.
              </p>
              <Link to="/learning-paths/beginner-cybersecurity" className="mt-5 inline-flex rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-800">
                View beginner learning path
              </Link>
            </div>
            <div className="grid gap-3">
              {relatedGuides.map(([label, href]) => (
                <Link key={href} to={href} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-800">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <LeadCaptureForm
              courseId={course.id}
              source="course_page"
              title={`Ask about ${course.title}`}
              defaultMessage={`I want details about ${course.title}.`}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
