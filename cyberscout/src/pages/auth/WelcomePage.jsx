import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicSiteLayout, { StatePanel } from '../../components/site/PublicSiteLayout'
import LeadCaptureForm from '../../components/ui/LeadCaptureForm'
import FaqChatbot from '../../components/ui/FaqChatbot'
import { api } from '../../lib/api'

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')
const ogImageUrl = `${siteUrl}/brand/cyber-lab-in-full-light.png`

const metadata = {
  title: 'Online Cybersecurity Courses with Hands-On Labs | Cyber Lab IN',
  description: 'Learn cybersecurity online through guided lessons, hands-on labs and practical security scenarios. Explore beginner courses in phishing, web security, SOC analysis, ethical hacking and defensive security.',
  ogTitle: 'Learn Cybersecurity Online Through Hands-On Practice',
  ogDescription: 'Explore practical cybersecurity courses with guided labs, real-world scenarios and structured learning paths for beginners and aspiring security professionals.',
}

const quickLinks = [
  ['school', 'Explore courses', '/courses'],
  ['science', 'Understand the labs', '/labs'],
  ['route', 'Choose a learning path', '/learning-paths'],
  ['account_circle', 'Student login', '/auth?mode=login&redirect=%2Fdashboard'],
  ['domain', 'Institution partnerships', '/for-organisations#institutions'],
  ['business_center', 'Corporate training', '/for-organisations#businesses'],
]

const learningPaths = [
  ['Cybersecurity foundations', '/learning-paths/beginner-cybersecurity', 'Start with security awareness, account safety, phishing analysis and core defensive habits.'],
  ['SOC analyst', '/learning-paths/soc-analyst', 'Build investigation structure, alert thinking, evidence notes and defensive reporting.'],
  ['Ethical hacking and web security', '/learning-paths/ethical-hacking', 'Study responsible testing boundaries, web behaviour and application security foundations.'],
  ['Network and cloud security', '/learning-paths/network-cloud-security', 'Connect infrastructure fundamentals with identity, configuration and cloud risk.'],
  ['Digital forensics', '/learning-paths/digital-forensics', 'Learn evidence handling, timelines and careful incident investigation structure.'],
]

const learningSteps = [
  ['01', 'Learn the concept', 'Understand the security idea in plain language with the context needed to use it.'],
  ['02', 'Observe the scenario', 'Review realistic emails, web behaviour, system evidence or investigation prompts.'],
  ['03', 'Complete the guided lab', 'Apply the concept in a structured exercise with clear boundaries and instructions.'],
  ['04', 'Report the finding', 'Record the risk, supporting evidence and a useful defensive recommendation.'],
]

const audienceContent = {
  learners: {
    label: 'Learners',
    title: 'Build confidence through structured practice.',
    description: 'Start with foundations, work through guided exercises and develop the language and habits used in practical security work.',
    points: ['Understand cybersecurity fundamentals', 'Practise real defensive workflows', 'Build role-specific foundations', 'Prepare for further study and entry-level assessments'],
    href: '/learning-paths/beginner-cybersecurity',
    cta: 'Explore the beginner path',
  },
  institutions: {
    label: 'Educational institutions',
    title: 'Add practical work to cybersecurity teaching.',
    description: 'Discuss curriculum alignment, guided exercises, cohort delivery and faculty support around existing academic programmes.',
    points: ['Structured curriculum support', 'Guided lab integration', 'Cohort-focused delivery', 'Clear learning outcomes'],
    href: '/for-organisations#institutions',
    cta: 'Explore institution support',
  },
  businesses: {
    label: 'Businesses',
    title: 'Develop relevant security capability across teams.',
    description: 'Shape training around role, risk and organisational context, from security awareness to technical foundations.',
    points: ['Role-aware team learning', 'Practical security awareness', 'Custom programme scoping', 'Progress-focused delivery'],
    href: '/for-organisations#businesses',
    cta: 'Discuss team training',
  },
}

const securityTopics = [
  'Account security',
  'Phishing analysis',
  'Network fundamentals',
  'HTTP requests and responses',
  'SQL injection awareness',
  'Cross-site scripting awareness',
  'Session security',
  'Defensive reporting',
]

const faqs = [
  ['What is the best way to start learning cybersecurity?', 'Start with clear foundations, then apply each concept through guided practice. Cyber Lab IN begins with account safety, phishing, network basics, web behaviour and defensive reporting before learners move into deeper specialisations.'],
  ['Are Cyber Lab IN courses suitable for complete beginners?', 'Yes. The beginner courses require only basic computer and internet knowledge. Technical ideas are introduced gradually and connected to practical scenarios.'],
  ['Do the courses include hands-on cybersecurity labs?', 'Yes. Published courses include guided exercises tied to specific learning outcomes. Labs focus on responsible practice, observation and defensive reporting.'],
  ['Does Cyber Lab IN guarantee a cybersecurity job?', 'No. Training can support further study and entry-level preparation, but Cyber Lab IN does not make unsupported placement or employment guarantees.'],
]

function Icon({ name }) {
  return <span className="material-symbols-outlined" aria-hidden="true">{name}</span>
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

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function courseUrl(course) {
  return `/courses/${course.categorySlug || 'cybersecurity'}/${course.slug}`
}

function CourseWorkflowVisual() {
  return (
    <div className="home-workflow-visual" aria-label="A guided phishing analysis course workflow">
      <div className="home-workflow-heading">
        <div>
          <p>Cyber Security Essentials</p>
          <h2>Phishing indicator analysis</h2>
        </div>
        <span>Guided lab</span>
      </div>
      <div className="home-workflow-body">
        <aside aria-label="Lab stages">
          <span className="is-active">1. Review context</span>
          <span>2. Inspect evidence</span>
          <span>3. Record findings</span>
          <span>4. Recommend action</span>
        </aside>
        <div className="home-evidence-panel">
          <p className="home-panel-label">Evidence under review</p>
          <div className="home-message-line"><span>Sender</span><strong>account-notice@example.test</strong></div>
          <div className="home-message-line"><span>Subject</span><strong>Review requested account action</strong></div>
          <div className="home-message-line"><span>Destination</span><strong>External website</strong></div>
          <div className="home-observation">
            <Icon name="fact_check" />
            <p><strong>Learning task</strong> Compare the message context, sender and destination before documenting the risk.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  const [courses, setCourses] = useState([])
  const [coursesState, setCoursesState] = useState('loading')
  const [courseError, setCourseError] = useState('')
  const [blogs, setBlogs] = useState([])
  const [blogsState, setBlogsState] = useState('loading')
  const [selectedAudience, setSelectedAudience] = useState('learners')

  const featuredCourse = useMemo(
    () => courses.find(course => course.slug === 'cyber-security-essentials') || courses[0],
    [courses],
  )
  const supportingCourses = useMemo(
    () => courses.filter(course => course.id !== featuredCourse?.id),
    [courses, featuredCourse],
  )

  useEffect(() => {
    document.title = metadata.title
    upsertMeta('meta[name="description"]', { name: 'description', content: metadata.description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: metadata.ogTitle })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: metadata.ogDescription })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: `${siteUrl}/` })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImageUrl })
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '907' })
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '508' })
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: 'Cyber Lab IN logo' })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: metadata.ogTitle })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: metadata.ogDescription })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImageUrl })
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: `${siteUrl}/` })
  }, [])

  useEffect(() => {
    let active = true
    api.publicCourses()
      .then(result => {
        if (!active) return
        setCourses(Array.isArray(result.courses) ? result.courses : [])
        setCoursesState('ready')
      })
      .catch(error => {
        if (!active) return
        setCourseError(error.message || 'Courses could not be loaded.')
        setCoursesState('error')
      })

    api.blogs()
      .then(result => {
        if (!active) return
        setBlogs((Array.isArray(result.blogs) ? result.blogs : []).slice(0, 4))
        setBlogsState('ready')
      })
      .catch(() => {
        if (!active) return
        setBlogsState('error')
      })

    return () => { active = false }
  }, [])

  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'EducationalOrganization',
          '@id': `${siteUrl}/#organization`,
          name: 'Cyber Lab IN',
          url: `${siteUrl}/`,
          logo: ogImageUrl,
          description: 'Cybersecurity education and guided practical learning for students, professionals, institutions and teams.',
          founder: { '@type': 'Person', name: 'Arghya Sikdar', url: `${siteUrl}/instructors/arghya-sikdar` },
        },
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          url: `${siteUrl}/`,
          name: 'Cyber Lab IN',
          publisher: { '@id': `${siteUrl}/#organization` },
        },
        {
          '@type': 'WebPage',
          '@id': `${siteUrl}/#webpage`,
          url: `${siteUrl}/`,
          name: metadata.title,
          description: metadata.description,
          isPartOf: { '@id': `${siteUrl}/#website` },
          about: { '@id': `${siteUrl}/#organization` },
        },
        {
          '@type': 'ItemList',
          name: 'Featured Cyber Lab IN courses',
          itemListElement: courses.map((course, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: course.title,
            url: `${siteUrl}${courseUrl(course)}`,
          })),
        },
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
  }, [courses])

  const audience = audienceContent[selectedAudience]

  return (
    <PublicSiteLayout
      announcement={{
        text: 'Cyber Security Essentials is available for beginner learners.',
        href: '/courses/cybersecurity/cyber-security-essentials',
        linkLabel: 'View the course',
      }}
      chatbot={<FaqChatbot />}
    >
      <section className="home-hero">
        <div className="site-container home-hero-grid">
          <div className="home-hero-copy">
            <p className="site-eyebrow">Practical cybersecurity learning</p>
            <h1>Learn cybersecurity online with hands-on labs</h1>
            <p>Cyber Lab IN provides structured cybersecurity education for students, beginners, career switchers and early-stage professionals. Learn the concepts, inspect realistic scenarios and practise clear defensive workflows from the beginning.</p>
            <div className="site-action-row">
              <Link to="/courses" className="site-button-primary">Explore cybersecurity courses<Icon name="arrow_forward" /></Link>
              <Link to="/learning-paths" className="site-text-link">Choose a learning path<Icon name="arrow_forward" /></Link>
            </div>
            <ul className="home-hero-trust" aria-label="Course platform highlights">
              <li><Icon name="check_circle" />Beginner-friendly paths</li>
              <li><Icon name="check_circle" />Guided practical exercises</li>
              <li><Icon name="check_circle" />Responsible defensive training</li>
            </ul>
          </div>
          <CourseWorkflowVisual />
        </div>
      </section>

      <nav className="home-quick-links" aria-label="Quick access">
        <div className="site-container">
          {quickLinks.map(([icon, label, href]) => (
            <Link key={href} to={href}><Icon name={icon} /><span>{label}</span><Icon name="arrow_forward" /></Link>
          ))}
        </div>
      </nav>

      <section className="home-answer-section">
        <div className="site-container home-answer-grid">
          <div>
            <p className="site-eyebrow">Cyber Lab IN</p>
            <h2>What is Cyber Lab IN?</h2>
          </div>
          <div>
            <p className="home-answer-lead">Cyber Lab IN is an online learning platform offering practical cybersecurity courses, guided labs and structured learning paths for beginners and aspiring security professionals.</p>
            <p>The platform is built around a simple idea: cybersecurity is understood more clearly when learners can connect each concept to evidence, decisions and responsible practical work.</p>
          </div>
        </div>
        <div className="site-container home-credibility-strip" aria-label="How Cyber Lab IN teaches">
          <div><strong>Guided</strong><span>Exercises follow defined learning outcomes.</span></div>
          <div><strong>Practical</strong><span>Scenarios connect theory to observable security risk.</span></div>
          <div><strong>Responsible</strong><span>Labs emphasise boundaries and defensive reporting.</span></div>
          <div><strong>Structured</strong><span>Paths progress from foundations to specialisation.</span></div>
        </div>
      </section>

      <section className="home-section home-courses" id="courses">
        <div className="site-container">
          <div className="home-section-heading">
            <div>
              <p className="site-eyebrow">Featured learning experiences</p>
              <h2>Explore our cybersecurity courses</h2>
            </div>
            <p>Published courses combine direct explanations, course-specific materials and guided practice. Learners sign in to access the content attached to their enrolment.</p>
          </div>

          {coursesState === 'loading' && <StatePanel title="Loading published courses" message="The current course catalogue is being retrieved." />}
          {coursesState === 'error' && <StatePanel type="error" title="The course catalogue is temporarily unavailable" message={courseError} action={<Link to="/contact" className="site-text-link">Ask about a course<Icon name="arrow_forward" /></Link>} />}
          {coursesState === 'ready' && !courses.length && <StatePanel type="empty" title="No courses are currently published" message="Contact Cyber Lab IN for programme availability." />}

          {featuredCourse && (
            <div className="home-featured-course">
              <div className="home-course-image" aria-hidden="true">
                <span className="home-course-code">CLI / {featuredCourse.id}</span>
                <div>
                  <Icon name="security" />
                  <p>Foundation concepts</p>
                  <p>Guided practice</p>
                  <p>Defensive reporting</p>
                </div>
              </div>
              <article>
                <p className="site-eyebrow">Featured course</p>
                <h3>{featuredCourse.title}</h3>
                <p>{featuredCourse.description}</p>
                <dl className="home-course-facts">
                  <div><dt>Level</dt><dd>{featuredCourse.level}</dd></div>
                  <div><dt>Duration</dt><dd>{featuredCourse.duration}</dd></div>
                  <div><dt>Mode</dt><dd>{featuredCourse.mode}</dd></div>
                  <div><dt>Credential</dt><dd>{featuredCourse.credential}</dd></div>
                </dl>
                <div className="site-action-row">
                  <Link to={courseUrl(featuredCourse)} className="site-button-primary">View course details<Icon name="arrow_forward" /></Link>
                  <Link to={`/auth?mode=login&redirect=${encodeURIComponent(`/learn/courses/${featuredCourse.id}`)}`} className="site-text-link">Start learning<Icon name="arrow_forward" /></Link>
                </div>
              </article>
            </div>
          )}

          {!!supportingCourses.length && (
            <div className="home-course-rows">
              {supportingCourses.map(course => (
                <article key={course.id}>
                  <div>
                    <p>{[course.level, course.duration, course.mode].filter(Boolean).join(' · ')}</p>
                    <h3>{course.title}</h3>
                  </div>
                  <p>{course.description}</p>
                  <Link to={courseUrl(course)} className="site-text-link" aria-label={`View ${course.title}`}>View course<Icon name="arrow_forward" /></Link>
                </article>
              ))}
            </div>
          )}
          <Link to="/courses" className="site-text-link home-all-link">Browse every published course<Icon name="arrow_forward" /></Link>
        </div>
      </section>

      <section className="home-section home-paths" id="learning-paths">
        <div className="site-container home-paths-grid">
          <div className="home-paths-intro">
            <p className="site-eyebrow">Structured progression</p>
            <h2>Choose a cybersecurity learning path</h2>
            <p>A learning path helps learners understand where to begin, what to practise next and which security discipline they may want to explore further.</p>
            <Link to="/learning-paths" className="site-text-link">Compare all learning paths<Icon name="arrow_forward" /></Link>
          </div>
          <div className="home-path-list">
            {learningPaths.map(([title, href, description], index) => (
              <Link key={href} to={href}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
                <Icon name="arrow_forward" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-learning-system">
        <div className="site-container">
          <div className="home-section-heading">
            <div>
              <p className="site-eyebrow">How learning works</p>
              <h2>Move from a concept to a defensible finding</h2>
            </div>
            <p>Cyber Lab IN courses use a repeatable learning workflow so practical work remains clear, responsible and connected to a stated outcome.</p>
          </div>
          <ol className="home-step-list">
            {learningSteps.map(([number, title, description]) => (
              <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-labs" id="labs">
        <div className="site-container home-labs-grid">
          <div>
            <p className="site-eyebrow">Practical cyber labs</p>
            <h2>Guided exercises tied to course outcomes</h2>
            <p>Labs help learners inspect evidence, apply a security concept and communicate what they found. Access is linked to the learner’s enrolled course, and attempts and progress are recorded by the learning system.</p>
            <ul>
              <li><Icon name="check" />Course-mapped guided practicals</li>
              <li><Icon name="check" />Step-by-step instructions and clear boundaries</li>
              <li><Icon name="check" />Attempts, scoring and progress where configured</li>
              <li><Icon name="check" />Defensive observations and reporting practice</li>
            </ul>
            <Link to="/labs" className="site-button-secondary">See how the labs work<Icon name="arrow_forward" /></Link>
          </div>
          <div className="home-lab-interface" aria-label="Guided lab activity stages">
            <div className="home-lab-toolbar"><span>Course lab</span><strong>Unsafe input observation</strong></div>
            <div className="home-lab-content">
              <div className="home-lab-task">
                <p>Current task</p>
                <h3>Observe how an input changes application behaviour.</h3>
                <span>Work only inside the guided scenario and record defensive implications.</span>
              </div>
              <div className="home-lab-record">
                <p>Finding structure</p>
                <div><span>Observation</span><i /></div>
                <div><span>Risk</span><i /></div>
                <div><span>Recommendation</span><i /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-audiences">
        <div className="site-container">
          <div className="home-section-heading">
            <div>
              <p className="site-eyebrow">Learning outcomes</p>
              <h2>Cybersecurity training for different contexts</h2>
            </div>
            <p>Individuals, education providers and businesses need different outcomes. Cyber Lab IN keeps the audience, role and delivery context visible when a programme is planned.</p>
          </div>
          <div className="home-audience-tabs" role="tablist" aria-label="Choose an audience">
            {Object.entries(audienceContent).map(([key, value]) => (
              <button key={key} type="button" role="tab" aria-selected={selectedAudience === key} onClick={() => setSelectedAudience(key)}>{value.label}</button>
            ))}
          </div>
          <div className="home-audience-panel" role="tabpanel">
            <div><p className="site-eyebrow">{audience.label}</p><h3>{audience.title}</h3><p>{audience.description}</p><Link to={audience.href} className="site-text-link">{audience.cta}<Icon name="arrow_forward" /></Link></div>
            <ul>{audience.points.map(point => <li key={point}><Icon name="check_circle" />{point}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="home-topics">
        <div className="site-container home-topics-grid">
          <div><p className="site-eyebrow">Skills and concepts</p><h2>Work with practical security topics</h2><p>Current courses introduce the concepts learners need to reason about digital risk and explain a defensive response.</p></div>
          <div className="home-topic-list">{securityTopics.map(topic => <span key={topic}>{topic}</span>)}</div>
        </div>
      </section>

      <section className="home-section home-instructor">
        <div className="site-container home-instructor-grid">
          <div className="home-instructor-monogram" aria-hidden="true">AS</div>
          <div>
            <p className="site-eyebrow">Instructor and expertise</p>
            <h2>Learn from cybersecurity practitioners</h2>
            <p>Arghya Sikdar is the Founder and CEO of Cyber Lab IN. His work spans cybersecurity education, DevSecOps, cloud security, application security, vulnerability management, security operations and digital forensics.</p>
            <p>Course ownership and instructor attribution are visible so learners can understand who designed the curriculum and the experience behind it.</p>
            <Link to="/instructors/arghya-sikdar" className="site-text-link">Read Arghya Sikdar’s profile<Icon name="arrow_forward" /></Link>
          </div>
          <aside>
            <p className="site-eyebrow">Current trust signals</p>
            <ul><li>Instructor-led curriculum</li><li>Defined prerequisites and outcomes</li><li>Guided lab workflows</li><li>No unsupported placement claims</li></ul>
          </aside>
        </div>
      </section>

      <section className="home-section home-resources">
        <div className="site-container">
          <div className="home-section-heading">
            <div><p className="site-eyebrow">Articles and guides</p><h2>Latest cybersecurity resources</h2></div>
            <p>Read direct explanations of foundational security concepts, written to help learners connect a topic to the relevant course and learning path.</p>
          </div>
          {blogsState === 'loading' && <StatePanel title="Loading the latest resources" />}
          {blogsState === 'error' && <StatePanel type="error" title="Resources are temporarily unavailable" message="The published article feed could not be retrieved." />}
          {blogsState === 'ready' && !blogs.length && <StatePanel type="empty" title="No resources are published yet" message="New guides will appear here after editorial review." />}
          {!!blogs.length && (
            <div className="home-resource-list">
              {blogs.map((blog, index) => (
                <article key={blog.id || blog.slug} className={index === 0 ? 'is-featured' : ''}>
                  <div><span>{blog.category || 'Cybersecurity guide'}</span>{blog.publishedAt && <time dateTime={blog.publishedAt}>{formatDate(blog.publishedAt)}</time>}</div>
                  <h3><Link to={`/blog/${blog.slug}`}>{blog.title}</Link></h3>
                  <p>{blog.excerpt}</p>
                  <p className="home-resource-author">By {blog.authorName || 'Cyber Lab IN'}</p>
                  <Link to={`/blog/${blog.slug}`} className="site-text-link">Read the guide<Icon name="arrow_forward" /></Link>
                </article>
              ))}
            </div>
          )}
          <Link to="/blog" className="site-text-link home-all-link">Browse all cybersecurity resources<Icon name="arrow_forward" /></Link>
        </div>
      </section>

      <section className="home-section home-faq" id="faq">
        <div className="site-container home-faq-grid">
          <div><p className="site-eyebrow">Common questions</p><h2>Frequently asked questions about cybersecurity courses</h2><p>These answers explain the intended starting point, practical format and limits of Cyber Lab IN training.</p><Link to="/contact" className="site-text-link">Ask another question<Icon name="arrow_forward" /></Link></div>
          <div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<Icon name="add" /></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="home-final-cta">
        <div className="site-container home-final-grid">
          <div><p className="site-eyebrow">Your next step</p><h2>Start building your cybersecurity skills</h2><p>Compare the published courses or begin with Cyber Security Essentials and its guided foundation labs.</p><div className="site-action-row"><Link to="/courses" className="site-button-primary">Explore all courses<Icon name="arrow_forward" /></Link><Link to="/courses/cybersecurity/cyber-security-essentials" className="site-text-link">View Cyber Security Essentials<Icon name="arrow_forward" /></Link></div></div>
          <LeadCaptureForm title="Talk to the Cyber Lab IN team" source="landing_form" />
        </div>
      </section>
    </PublicSiteLayout>
  )
}
