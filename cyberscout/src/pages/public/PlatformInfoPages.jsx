import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicSiteLayout, { Breadcrumbs, PageIntro } from '../../components/site/PublicSiteLayout'
import LeadCaptureForm from '../../components/ui/LeadCaptureForm'
import { serializeJsonLd } from '../../lib/structuredData'
import SiteIcon from '../../components/ui/SiteIcon'
import { academicSubjects, authoredBlogLinks, authoredCourseLinks, enterpriseEnvironments, instructorExpertise, instructorTimeline, learningPathData, plannedCourses, publicLabs } from '../../content/publicCatalog'

const siteName = 'Cyber Lab IN'

function Icon({ name }) {
  return <SiteIcon name={name} />
}

function setPageMeta(title, description, path = '/') {
  document.title = `${title} | ${siteName}`
  let meta = document.head.querySelector('meta[name="description"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'description')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', description)
  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', `${(import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')}${path}`)
}

function PublicPage({ title, eyebrow, description, path, breadcrumbs, actions = null, introAside = null, children }) {
  useEffect(() => {
    setPageMeta(title, description || 'Cyber Lab IN cybersecurity learning information.', path)
  }, [title, description, path])

  return (
    <PublicSiteLayout>
      <Breadcrumbs items={breadcrumbs || [{ label: 'Home', href: '/' }, { label: title }]} />
      <PageIntro eyebrow={eyebrow} title={title} description={description} actions={actions} aside={introAside} />
      {children}
    </PublicSiteLayout>
  )
}

function EditorialRows({ items, numbered = true }) {
  return (
    <div className="info-rows">
      {items.map((item, index) => {
        const [title, description, href] = Array.isArray(item) ? item : [item, '', '']
        const content = <><span>{numbered ? String(index + 1).padStart(2, '0') : '—'}</span><div><h3>{title}</h3>{description && <p>{description}</p>}</div>{href && <Icon name="arrow_forward" />}</>
        return href ? <Link key={title} to={href}>{content}</Link> : <article key={title}>{content}</article>
      })}
    </div>
  )
}

export function LearningPathsPage() {
  return (
    <PublicPage
      eyebrow="Learning paths"
      title="Cybersecurity learning paths"
      path="/learning-paths"
      description="Choose a structured progression based on your starting point and intended security discipline. Each path connects concepts, published courses and guided practical work."
      actions={<Link to="/courses" className="site-button-primary">Browse published courses<Icon name="arrow_forward" /></Link>}
    >
      <section className="info-section"><div className="site-container info-split"><div><p className="site-eyebrow">Choose your direction</p><h2>Start with foundations, then check availability</h2><p>A learning path is a progression guide, not a separate credential or employment promise. Only Cybersecurity Foundations is currently marked as available.</p></div><div className="path-overview-list">{Object.entries(learningPathData).map(([slug, path]) => <Link key={slug} to={`/learning-paths/${slug}`}><span className={path.status === 'Available now' ? 'is-available' : ''}>{path.status}</span><h3>{path.shortTitle}</h3><p>{path.summary}</p><strong>View path details <Icon name="arrow_forward" /></strong></Link>)}</div></div></section>
    </PublicPage>
  )
}

export function LearningPathDetailPage({ slug }) {
  const path = learningPathData[slug] || learningPathData['beginner-cybersecurity']
  const relatedGuides = [
    ['What is cybersecurity?', 'A plain-language introduction to the field.', '/blog/what-is-cybersecurity'],
    ['How to learn cybersecurity for beginners?', 'A practical sequence for starting well.', '/blog/how-to-learn-cybersecurity-for-beginners'],
    ['What is ethical hacking?', 'Legal boundaries and responsible testing foundations.', '/blog/what-is-ethical-hacking'],
  ]
  return (
    <PublicPage eyebrow="Learning path" title={path.title} path={`/learning-paths/${slug}`} description={path.summary} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Learning paths', href: '/learning-paths' }, { label: path.shortTitle }]} actions={<Link to={path.next} className="site-button-primary">View the recommended starting course<Icon name="arrow_forward" /></Link>}>
      <section className="path-facts-section"><div className="site-container"><dl><div><dt>Availability</dt><dd>{path.status}</dd></div><div><dt>Starting level</dt><dd>{path.startingLevel}</dd></div><div><dt>Estimated time</dt><dd>{path.estimatedTime}</dd></div><div><dt>Role context</dt><dd>{path.roles.join(', ')}</dd></div></dl></div></section>
      <section className="info-section"><div className="site-container info-split"><div><p className="site-eyebrow">Recommended sequence</p><h2>Build each foundation in order</h2><p>Work through the topics below, complete the related guided exercises and use published course outcomes to judge readiness for the next stage.</p></div><EditorialRows items={path.items} /></div></section>
      <section className="info-section info-section-muted"><div className="site-container profile-subjects"><div><p className="site-eyebrow">Courses</p><h2>Course sequence</h2><EditorialRows items={path.courses.map(([title, href]) => [title, path.status === 'Available now' ? 'Published course' : 'Check the course page for publication status', href])} /></div><div><p className="site-eyebrow">Practice</p><h2>Relevant labs</h2><EditorialRows items={path.labs} /></div></div></section>
      <section className="info-section info-section-muted"><div className="site-container info-split"><div><p className="site-eyebrow">Supporting resources</p><h2>Read the concepts before practising them</h2><p>These published guides provide background for the learning path and link back to relevant courses.</p></div><EditorialRows items={relatedGuides} /></div></section>
    </PublicPage>
  )
}

export function LabsPage() {
  return (
    <PublicPage eyebrow="Cyber labs" title="Guided cybersecurity labs" path="/labs" description="Cyber Lab IN labs connect a course concept to a safe, structured exercise and a defensible written finding. They are designed for enrolled learning, not unrestricted offensive infrastructure." actions={<Link to="/courses" className="site-button-primary">Find a course with labs<Icon name="arrow_forward" /></Link>} introAside={<aside className="info-callout"><p className="site-eyebrow">Current lab model</p><p>Course-mapped guides, recorded attempts, hints and scoring where configured. Lab access follows course enrolment.</p></aside>}>
      <section className="labs-public-section" id="guided-labs"><div className="site-container labs-public-grid"><div><p className="site-eyebrow">Practical workflow</p><h2>Know what you inspect and what you submit</h2><p>Each lab states its authorised scope, supplied evidence, learner actions and expected defensive output.</p><ol><li><span>01</span>Review the lab scope</li><li><span>02</span>Inspect the supplied evidence</li><li><span>03</span>Record observations</li><li><span>04</span>Submit the finding</li></ol></div><div className="labs-public-list">{Object.entries(publicLabs).map(([slug, lab]) => <Link key={slug} to={`/labs/${slug}`}><span>Guided lab overview</span><h3>{lab.title}</h3><p>{lab.summary}</p><strong>See the task and evidence <Icon name="arrow_forward" /></strong></Link>)}</div></div></section>
      <section className="lab-safety-section"><div className="site-container info-split"><div><p className="site-eyebrow">Safety restrictions</p><h2>Practice stays inside the authorised exercise</h2><p>Public lab pages do not expose live targets, credentials or offensive infrastructure. Enrolled exercises state their boundaries before work begins.</p></div><EditorialRows items={['Use only the supplied scenario and evidence', 'Do not test third-party systems', 'Do not upload real credentials or personal data', 'Stop and report unexpected unsafe behaviour']} /></div></section>
    </PublicPage>
  )
}

export function LabDetailPage() {
  const { labSlug } = useParams()
  const lab = publicLabs[labSlug] || { title: 'Guided lab overview', summary: 'This lab overview is not available. Browse the current guided lab list.', evidence: 'Not published', actions: 'Not published', submission: 'Not published', feedback: 'Not published' }
  return (
    <PublicPage eyebrow="Read-only sample lab" title={lab.title} path={`/labs/${labSlug}`} description={lab.summary} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cyber labs', href: '/labs' }, { label: lab.title }]} actions={<Link to="/courses/cybersecurity/cyber-security-essentials" className="site-button-primary">View the beginner course<Icon name="arrow_forward" /></Link>}>
      <section className="lab-detail-public"><div className="site-container lab-detail-public-grid"><article><span>01</span><h2>What the learner sees</h2><p>{lab.evidence}</p></article><article><span>02</span><h2>What the learner does</h2><p>{lab.actions}</p></article><article><span>03</span><h2>What is submitted</h2><p>{lab.submission}</p></article><article><span>04</span><h2>How feedback works</h2><p>{lab.feedback}</p></article></div></section>
      <section className="info-section info-section-muted"><div className="site-container info-split"><div><p className="site-eyebrow">Access and safety</p><h2>Full instructions stay inside the enrolled course</h2><p>This public page explains the task without exposing protected evidence, answers or unsafe infrastructure.</p></div><EditorialRows items={['Confirm the authorised scope', 'Use only supplied evidence', 'Record facts before assumptions', 'Submit a defensive finding']} /></div></section>
    </PublicPage>
  )
}

export function ResourcesPage() {
  const categories = ['Beginner Cybersecurity', 'Ethical Hacking', 'Web Security', 'SOC and Defensive Security', 'Digital Forensics', 'Cloud Security', 'Career Guidance']
  return (
    <PublicPage eyebrow="Resources" title="Cybersecurity guides and resources" path="/resources" description="Read practical guides that support Cyber Lab IN courses and connect beginner security concepts to structured learning paths." actions={<Link to="/blog" className="site-button-primary">Browse all published articles<Icon name="arrow_forward" /></Link>}>
      <section className="info-section"><div className="site-container info-split"><div><p className="site-eyebrow">Resource topics</p><h2>Find the subject you need to understand</h2><p>Categories organise articles by learning goal. Published article pages include author attribution, review information and links to relevant courses.</p></div><EditorialRows items={categories} /></div></section>
      <section className="info-section info-section-muted"><div className="site-container info-split"><div><p className="site-eyebrow">Start reading</p><h2>Foundation guides</h2></div><EditorialRows items={authoredBlogLinks.map(([title, href]) => [title, 'Published cybersecurity guide', href])} /></div></section>
    </PublicPage>
  )
}

export function InstructorsPage() {
  return (
    <PublicPage eyebrow="Instructors" title="Cyber Lab IN instructor profiles" path="/instructors" description="Meet the educators and practitioners responsible for course ownership, curriculum context and guided practical learning.">
      <section className="info-section"><div className="site-container instructor-list-feature instructor-list-no-photo"><div><p className="site-eyebrow">Founder and course author</p><h2>Arghya Sikdar</h2><p>Founder and CEO of Cyber Lab IN, cybersecurity educator and practitioner with more than 13 years of combined industry and academic experience.</p><Link to="/instructors/arghya-sikdar" className="site-text-link">View full instructor profile<Icon name="arrow_forward" /></Link></div></div></section>
    </PublicPage>
  )
}

function instructorSchema() {
  const base = (import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Person', '@id': `${base}/instructors/arghya-sikdar#person`, name: 'Arghya Sikdar', jobTitle: 'Founder and CEO of Cyber Lab IN', url: `${base}/instructors/arghya-sikdar`, worksFor: { '@type': 'EducationalOrganization', name: 'Cyber Lab IN', url: `${base}/` }, hasCredential: [{ '@type': 'EducationalOccupationalCredential', name: 'EC-Council Certified Ethical Hacker (CEH)' }, { '@type': 'EducationalOccupationalCredential', name: 'EC-Council Computer Hacking Forensic Investigator (CHFI)' }], knowsAbout: instructorExpertise, description: 'Founder and CEO of Cyber Lab IN, cybersecurity educator and practitioner focused on practical cybersecurity training, guided labs and real-world security workflows.' },
      { '@type': 'ProfilePage', '@id': `${base}/instructors/arghya-sikdar#profilepage`, url: `${base}/instructors/arghya-sikdar`, name: 'Arghya Sikdar Instructor Profile', about: { '@id': `${base}/instructors/arghya-sikdar#person` }, dateModified: '2026-07-15' },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` }, { '@type': 'ListItem', position: 2, name: 'Instructors', item: `${base}/instructors` }, { '@type': 'ListItem', position: 3, name: 'Arghya Sikdar', item: `${base}/instructors/arghya-sikdar` }] },
    ],
  }
}

export function InstructorProfilePage() {
  const schema = instructorSchema()
  return (
    <PublicPage eyebrow="Instructor profile" title="Arghya Sikdar" path="/instructors/arghya-sikdar" description="Founder and CEO of Cyber Lab IN, cybersecurity educator and practitioner with more than 13 years of combined industry and academic experience." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Instructors', href: '/instructors' }, { label: 'Arghya Sikdar' }]} introAside={<aside className="profile-status"><p className="site-eyebrow">Profile details</p><dl><div><dt>Role</dt><dd>Founder and CEO</dd></div><div><dt>Credentials</dt><dd>CEH, CHFI</dd></div><div><dt>Reviewed</dt><dd><time dateTime="2026-07-15">15 July 2026</time></dd></div></dl></aside>}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <section className="profile-opening"><div className="site-container profile-opening-grid"><div><p className="site-eyebrow">Founder, educator and practitioner</p><h2>Practical cybersecurity education shaped by industry and teaching</h2></div><div><p>Arghya Sikdar is the Founder and CEO of Cyber Lab IN, a cybersecurity education and practical learning platform focused on helping students, professionals and career switchers build real-world cybersecurity skills through structured training and guided practical exercises.</p><p>With more than 13 years of combined industry and academic experience, he has worked across cybersecurity, DevSecOps, cloud security, vulnerability management, application security, security operations and technical education.</p></div></div></section>
      <section className="profile-enterprise"><div className="site-container profile-enterprise-grid"><div><p className="site-eyebrow">Professional context</p><h2>Enterprise and academic experience</h2><p>Throughout his career, he has contributed to projects, assessments, consulting engagements and security initiatives involving global organisations and enterprise environments including those listed here.</p><small>Organisation names describe project or professional context and do not imply a current partnership or endorsement of Cyber Lab IN.</small></div><div className="profile-name-list">{enterpriseEnvironments.map(name => <span key={name}>{name}</span>)}</div></div></section>
      <section className="info-section"><div className="site-container profile-subjects"><div><p className="site-eyebrow">Academic work</p><h2>Subjects taught</h2><p>In academia, he has served as Assistant Professor and cybersecurity educator across higher-education institutions and universities, teaching technical and applied cybersecurity subjects.</p><EditorialRows items={academicSubjects} /></div><div><p className="site-eyebrow">Practice and curriculum</p><h2>Areas of expertise</h2><p>His work connects technical security practice with curriculum design and accessible, responsible instruction.</p><EditorialRows items={instructorExpertise} /></div></div></section>
      <section className="info-section info-section-muted"><div className="site-container info-split"><div><p className="site-eyebrow">Experience timeline</p><h2>How the work connects</h2><p>The timeline summarises the professional context behind Cyber Lab IN’s approach. It does not attach unsupported dates or titles to individual institutions.</p></div><EditorialRows items={instructorTimeline.map(([title, context, copy]) => [title, `${context}. ${copy}`])} /></div></section>
      <section className="profile-credentials"><div className="site-container profile-credentials-grid"><div><p className="site-eyebrow">Professional credentials</p><h2>Certifications</h2><p>Credentials are listed for instructor discovery and should remain independently verifiable.</p></div><div><article><Icon name="workspace_premium" /><h3>EC-Council Certified Ethical Hacker</h3><p>CEH</p></article><article><Icon name="workspace_premium" /><h3>EC-Council Computer Hacking Forensic Investigator</h3><p>CHFI</p></article></div></div></section>
      <section className="profile-authorship"><div className="site-container"><div className="profile-authorship-group"><p className="site-eyebrow">Course ownership</p><h2>Authored courses</h2><EditorialRows items={authoredCourseLinks.map(([title, href]) => [title, 'Published Cyber Lab IN course', href])} /></div><div className="profile-authorship-group"><p className="site-eyebrow">Published guidance</p><h2>Authored resources</h2><EditorialRows items={authoredBlogLinks.map(([title, href]) => [title, 'Cybersecurity guide', href])} /></div><div className="profile-authorship-group"><p className="site-eyebrow">Structured progression</p><h2>Related learning paths</h2><EditorialRows items={Object.entries(learningPathData).map(([slug, path]) => [path.shortTitle, path.summary, `/learning-paths/${slug}`])} /></div></div></section>
    </PublicPage>
  )
}

export function ContactPage() {
  return (
    <PublicPage eyebrow="Contact" title="Contact Cyber Lab IN" path="/contact" description="Ask about courses, learning paths, labs, institutional delivery, business training or certificate verification.">
      <section className="info-section"><div className="site-container contact-public-grid"><div><p className="site-eyebrow">Direct contact</p><h2>Tell us what you need to achieve</h2><p>Share your starting point, intended audience and training goal. This helps the team respond with relevant course or programme information.</p><dl><div><dt>Email</dt><dd><a href="mailto:hello@cyberlabin.com">hello@cyberlabin.com</a></dd></div><div><dt>Course support</dt><dd>Use the learner portal for account-specific requests.</dd></div><div><dt>Organisations</dt><dd>Include expected audience, learning goals and preferred delivery context.</dd></div></dl></div><LeadCaptureForm source="website" title="Request Cyber Lab IN guidance" defaultMessage="I would like to contact Cyber Lab IN about cybersecurity training." /></div></section>
    </PublicPage>
  )
}

export function ForOrganisationsPage() {
  return (
    <PublicPage eyebrow="Institutions and businesses" title="Practical cybersecurity learning for organisations" path="/for-organisations" description="Cyber Lab IN works from audience, risk and learning outcomes to discuss structured cybersecurity education for institutions and teams.">
      <section className="organisation-section" id="institutions"><div className="site-container organisation-feature"><div><p className="site-eyebrow">Colleges and universities</p><h2>Add guided practical work to an existing curriculum</h2><p>Discuss instructor-led delivery, curriculum mapping, lab access, assessment and cohort reporting around the institution’s learner group.</p><Link to="/contact" className="site-text-link">Discuss an institution programme<Icon name="arrow_forward" /></Link></div><EditorialRows items={[['Training format', 'Instructor-led online or institution-specific delivery after scoping.'], ['Curriculum customisation', 'Map relevant beginner topics and practical exercises to stated outcomes.'], ['Lab access', 'Course-linked guided labs with defined safety boundaries.'], ['Cohort reporting', 'Discuss attendance, progress and assessment requirements before delivery.']]} /></div></section>
      <section className="organisation-section organisation-section-dark" id="businesses"><div className="site-container organisation-feature"><div><p className="site-eyebrow">Corporate learning teams</p><h2>Define training around roles and real organisational risk</h2><p>Start with the team, current responsibilities and required behaviour. Custom delivery is scoped before any schedule or commercial commitment is made.</p><Link to="/contact" className="site-button-secondary">Contact the training team<Icon name="arrow_forward" /></Link></div><EditorialRows items={[['Security awareness', 'Phishing, account safety and responsible escalation.'], ['Developer foundations', 'Request-response behaviour and secure input concepts.'], ['Assessment', 'Agree practical checks and reporting expectations before delivery.'], ['Instructor-led delivery', 'Plan live guidance around the selected cohort and outcomes.']]} /></div></section>
      <section className="info-section"><div className="site-container contact-public-grid"><div><p className="site-eyebrow">Programme enquiry</p><h2>Start with the audience and intended outcome</h2><p>Share enough context for a useful first conversation. No partnership or delivery commitment is implied until requirements are reviewed.</p></div><LeadCaptureForm source="website" title="Discuss organisation training" defaultMessage="I would like to discuss cybersecurity training for an organisation." compact /></div></section>
    </PublicPage>
  )
}

export function CertificateVerificationPage() {
  return (
    <PublicPage eyebrow="Certificate verification" title="Verify a Cyber Lab IN certificate" path="/certificate-verification" description="The public verification lookup is not enabled yet. Manual verification is available while the authenticated certificate system is completed.">
      <section className="info-section"><div className="site-container info-split"><div><p className="site-eyebrow">Current verification process</p><h2>Request manual verification</h2><p>Email the learner name, course name and certificate ID, if available, to the address below. Do not send identity documents unless the team requests a secure method.</p><a href="mailto:hello@cyberlabin.com" className="site-button-primary">Email a verification request<Icon name="mail" /></a></div><aside className="info-callout"><p className="site-eyebrow">Public lookup status</p><p>The automated public certificate lookup is planned but not currently available. This page does not claim otherwise.</p></aside></div></section>
    </PublicPage>
  )
}

export function CookiePolicyPage() {
  return (
    <PublicPage eyebrow="Cookie policy" title="Cookie policy" path="/cookie-policy" description="Cyber Lab IN uses necessary cookies for site operation and asks for consent before optional analytics or marketing categories are enabled.">
      <section className="info-section"><div className="site-container info-split"><div><p className="site-eyebrow">Consent categories</p><h2>Choose optional cookies deliberately</h2><p>Necessary storage supports security, login and core site behaviour. Optional categories remain controlled through the cookie preferences interface.</p></div><EditorialRows items={[["Necessary", "Required for login, security and core site behaviour."], ["Analytics", "Used only after consent to understand aggregate site usage."], ["Marketing", "Used only after consent for campaign attribution and follow-up."]]} /></div></section>
    </PublicPage>
  )
}

export function AccessibilityPage() {
  return (
    <PublicPage eyebrow="Accessibility" title="Accessibility at Cyber Lab IN" path="/accessibility" description="Cyber Lab IN aims to make its public website and learning experience usable with keyboards, assistive technology and a wide range of devices.">
      <section className="info-section"><div className="site-container info-split"><div><p className="site-eyebrow">Current approach</p><h2>Accessibility is part of implementation and review</h2><p>The public system uses semantic structure, visible keyboard focus, descriptive labels, reduced-motion support and responsive layouts. Accessibility issues can be reported directly.</p><Link to="/contact" className="site-button-secondary">Report an accessibility issue<Icon name="arrow_forward" /></Link></div><EditorialRows items={['Keyboard-accessible navigation', 'Visible focus indicators', 'Semantic headings and landmarks', 'Responsive text and controls', 'Reduced-motion support', 'Labeled forms and status messages']} /></div></section>
    </PublicPage>
  )
}

export function FaqPage() {
  const questions = [
    ['Who can start a Cyber Lab IN course?', 'Published beginner courses are designed for students, IT beginners, career switchers and early-stage professionals with basic computer and internet knowledge.'],
    ['How do course labs work?', 'Guided labs are mapped to a course and accessed by authenticated, enrolled learners. Each activity defines its scope and expected outcome.'],
    ['Does Cyber Lab IN guarantee employment?', 'No. Training supports skill development and further preparation but does not guarantee employment or placement.'],
    ['How can an organisation discuss training?', 'Use the organisation enquiry page and share the audience, learning goals and delivery context.'],
  ]
  return (
    <PublicPage eyebrow="Frequently asked questions" title="Answers about courses, labs and access" path="/faq" description="Find direct answers about who the courses are for, how guided labs work and how learners or organisations can get support.">
      <section className="info-section"><div className="site-container faq-public-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<Icon name="add" /></summary><p>{answer}</p></details>)}</div></section>
    </PublicPage>
  )
}

export function PlannedCoursePage({ slug }) {
  const course = plannedCourses[slug] || plannedCourses['web-application-security']
  return (
    <PublicPage eyebrow="Course roadmap" title={course.title} path={`/courses/cybersecurity/${slug}`} description={course.summary} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Courses', href: '/courses' }, { label: 'Coming next' }, { label: course.title }]} actions={<Link to="/courses/cybersecurity/cyber-security-essentials" className="site-button-primary">Start with a published course<Icon name="arrow_forward" /></Link>} introAside={<aside className="info-callout info-callout-warning"><p className="site-eyebrow">Not open for enrolment</p><p>Level: {course.level}. Launch timing, fee and full curriculum have not been published.</p></aside>}>
      <section className="info-section"><div className="site-container info-split"><div><p className="site-eyebrow">Proposed topic direction</p><h2>Topics under curriculum review</h2><p>These themes describe the current direction and are not a promise of delivery or availability.</p><Link to="/contact" className="site-text-link">Ask about the roadmap<Icon name="arrow_forward" /></Link></div><EditorialRows items={course.topics} /></div></section>
      <section className="course-waitlist-section"><div className="site-container contact-public-grid"><div><p className="site-eyebrow">Course waitlist</p><h2>Request an update when publication details are available</h2><p>Joining the waitlist does not reserve a seat or imply a launch date. The team will use the enquiry only to share relevant course information.</p></div><LeadCaptureForm source="course_waitlist" title={`Join the ${course.title} waitlist`} defaultMessage={`Please notify me when ${course.title} has confirmed publication details.`} /></div></section>
    </PublicPage>
  )
}
