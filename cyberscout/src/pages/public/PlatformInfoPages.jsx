import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicSiteLayout, { Breadcrumbs, PageIntro } from '../../components/site/PublicSiteLayout'
import LeadCaptureForm from '../../components/ui/LeadCaptureForm'
import { serializeJsonLd } from '../../lib/structuredData'

const siteName = 'Cyber Lab IN'

const learningPathData = {
  'beginner-cybersecurity': {
    title: 'Beginner Cybersecurity Learning Path',
    shortTitle: 'Cybersecurity Foundations',
    summary: 'A practical starting path for learners who want cybersecurity fundamentals, account safety, phishing awareness and guided labs.',
    items: ['Cybersecurity foundations', 'Phishing and scam awareness', 'Account protection', 'Beginner web security', 'Defensive reporting'],
    next: '/courses/cybersecurity/cyber-security-essentials',
  },
  'ethical-hacking': {
    title: 'Ethical Hacking and Web Security Learning Path',
    shortTitle: 'Ethical Hacking and Web Security',
    summary: 'A responsible path for learning how security testing works, why permission matters and how web security risks are identified safely.',
    items: ['Responsible testing boundaries', 'Reconnaissance awareness', 'Web request-response behaviour', 'Unsafe input awareness', 'Basic reporting'],
    next: '/courses/cybersecurity/cyber-security-essentials',
  },
  'soc-analyst': {
    title: 'Security Operations and SOC Learning Path',
    shortTitle: 'Security Operations and SOC',
    summary: 'A defensive path for learners interested in alerts, investigation structure, incident notes and SOC-style workflows.',
    items: ['Alert triage concepts', 'Investigation timelines', 'Evidence notes', 'Defensive communication', 'Monitoring basics'],
    next: '/courses/cybersecurity/cyber-security-essentials',
  },
  'network-cloud-security': {
    title: 'Network and Cloud Security Learning Path',
    shortTitle: 'Network and Cloud Security',
    summary: 'A foundation path for learners who want practical awareness of networks, identity, cloud configuration and access control.',
    items: ['Network fundamentals', 'Identity and access basics', 'Cloud configuration awareness', 'Secure defaults', 'Risk review'],
    next: '/courses/cybersecurity/introduction-to-cyber-security',
  },
  'digital-forensics': {
    title: 'Digital Forensics and Investigation Learning Path',
    shortTitle: 'Digital Forensics and Investigation',
    summary: 'A careful investigation path covering evidence thinking, timelines, artefacts and beginner-friendly forensic reasoning.',
    items: ['Evidence handling concepts', 'Timeline thinking', 'Digital artefacts', 'Incident notes', 'Responsible escalation'],
    next: '/courses/cybersecurity/introduction-to-cyber-security',
  },
}

const plannedCourses = {
  'web-application-security': {
    title: 'Web Application Security Fundamentals',
    summary: 'A curriculum roadmap for responsible web security foundations, request-response behaviour, unsafe input, session risk and practical defensive thinking.',
    topics: ['HTTP request-response basics', 'Unsafe input awareness', 'SQL injection concepts', 'Cross-site scripting concepts', 'Session security', 'Defensive reporting'],
  },
  'soc-analyst-foundations': {
    title: 'SOC Analyst Foundations',
    summary: 'A curriculum roadmap for entry-level security operations, alert triage, investigation structure, monitoring context and practical reporting.',
    topics: ['SOC workflow basics', 'Alert triage', 'Log review concepts', 'Incident notes', 'Monitoring fundamentals', 'Defensive escalation'],
  },
  'ethical-hacking-foundations': {
    title: 'Ethical Hacking Foundations',
    summary: 'A curriculum roadmap for legal, responsible security testing foundations and beginner-safe vulnerability thinking.',
    topics: ['Ethics and permission', 'Scope boundaries', 'Reconnaissance awareness', 'Vulnerability basics', 'Safe lab practice', 'Reporting'],
  },
}

const publicLabs = {
  'phishing-indicator-analysis': ['Phishing indicator analysis', 'Review message context, sender details and link destinations before documenting the indicators that require defensive action.'],
  'account-hardening-review': ['Account hardening review', 'Apply a structured checklist to authentication, recovery options and account settings.'],
  'web-request-response-practice': ['Web request-response practice', 'Observe the relationship between a browser request and application response in a guided scenario.'],
  'unsafe-input-awareness': ['Unsafe input awareness', 'Observe how untrusted input can change application behaviour and document the defensive implication.'],
  'session-security-basics': ['Session security basics', 'Review beginner session risks, secure handling concepts and the decisions that reduce exposure.'],
  'defensive-reporting-practice': ['Defensive reporting practice', 'Turn an observation into a concise finding with risk, evidence and a practical recommendation.'],
}

const instructorExpertise = [
  'Cybersecurity Education', 'Vulnerability Assessment and Penetration Testing', 'Web Application Security', 'Cloud Security', 'DevSecOps',
  'Security Operations (SOC)', 'Digital Forensics', 'Security Awareness and Training', 'Cybersecurity Curriculum Design', 'AI Applications in Cybersecurity',
]

const academicSubjects = [
  'Ethical Hacking', 'Vulnerability Assessment and Penetration Testing', 'Digital Forensics', 'DevSecOps', 'Cloud Security',
  'AI in Cybersecurity', 'Malware Analysis', 'Blockchain Security', 'Network Security',
]

const enterpriseEnvironments = ['FIS', 'Deloitte', 'EY', 'Airbus', 'Boeing', 'Amdocs', 'Safran']

const instructorTimeline = [
  ['Founder and CEO', 'Cyber Lab IN', 'Built a cybersecurity education and practical learning platform focused on structured training and guided exercises.'],
  ['Cybersecurity practitioner', 'Industry and enterprise environments', 'Worked across security initiatives involving vulnerability management, application security, DevSecOps, cloud security and security operations.'],
  ['Assistant Professor and educator', 'Higher-education institutions and universities', 'Taught cybersecurity subjects to technical and non-technical learners with an emphasis on employability and real-world workflows.'],
  ['Curriculum designer', 'Practical cybersecurity learning', 'Designed guided learning experiences for ethical hacking, VAPT, digital forensics, cloud security, DevSecOps and AI in cybersecurity.'],
]

const authoredCourseLinks = [
  ['Cyber Security Essentials', '/courses/cybersecurity/cyber-security-essentials'],
  ['Introduction to Cyber Security', '/courses/cybersecurity/introduction-to-cyber-security'],
]

const authoredBlogLinks = [
  ['What is cybersecurity?', '/blog/what-is-cybersecurity'],
  ['What is phishing and how to prevent it?', '/blog/what-is-phishing-and-how-to-prevent-it'],
  ['What is ethical hacking?', '/blog/what-is-ethical-hacking'],
  ['How to learn cybersecurity for beginners?', '/blog/how-to-learn-cybersecurity-for-beginners'],
]

function Icon({ name }) {
  return <span className="material-symbols-outlined" aria-hidden="true">{name}</span>
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
      <PageIntro eyebrow={eyebrow} title={title} description={description} actions={actions}>{introAside}</PageIntro>
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
      <section className="info-section"><div className="site-container info-split"><div><p className="site-eyebrow">Choose your direction</p><h2>Start with the foundation your goal requires</h2><p>A learning path is a guide to progression, not a separate credential or employment promise. Use it to understand sequence and prerequisites.</p></div><EditorialRows items={Object.entries(learningPathData).map(([slug, path]) => [path.shortTitle, path.summary, `/learning-paths/${slug}`])} /></div></section>
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
      <section className="info-section"><div className="site-container info-split"><div><p className="site-eyebrow">Path progression</p><h2>Build each foundation in sequence</h2><p>Work through the topics below, complete the related guided exercises and use published course outcomes to judge readiness for the next stage.</p></div><EditorialRows items={path.items} /></div></section>
      <section className="info-section info-section-muted"><div className="site-container info-split"><div><p className="site-eyebrow">Supporting resources</p><h2>Read the concepts before practising them</h2><p>These published guides provide background for the learning path and link back to relevant courses.</p></div><EditorialRows items={relatedGuides} /></div></section>
    </PublicPage>
  )
}

export function LabsPage() {
  return (
    <PublicPage eyebrow="Cyber labs" title="Guided cybersecurity labs" path="/labs" description="Cyber Lab IN labs connect a course concept to a safe, structured exercise and a defensible written finding. They are designed for enrolled learning, not unrestricted offensive infrastructure." actions={<Link to="/courses" className="site-button-primary">Find a course with labs<Icon name="arrow_forward" /></Link>} introAside={<aside className="info-callout"><p className="site-eyebrow">Current lab model</p><p>Course-mapped guides, recorded attempts, hints and scoring where configured. Lab access follows course enrolment.</p></aside>}>
      <section className="labs-public-section" id="guided-labs"><div className="site-container labs-public-grid"><div><p className="site-eyebrow">Practical workflow</p><h2>Observe, document and recommend</h2><p>Each lab makes the expected task and boundary explicit. Learners inspect a scenario, identify relevant evidence and communicate a practical defensive response.</p><ol><li><span>01</span>Review the lab scope</li><li><span>02</span>Inspect the supplied evidence</li><li><span>03</span>Record observations</li><li><span>04</span>Submit the finding</li></ol></div><div className="labs-public-list">{Object.entries(publicLabs).map(([slug, [title, copy]]) => <Link key={slug} to={`/labs/${slug}`}><span>Guided lab</span><h3>{title}</h3><p>{copy}</p><strong>View lab overview <Icon name="arrow_forward" /></strong></Link>)}</div></div></section>
    </PublicPage>
  )
}

export function LabDetailPage() {
  const { labSlug } = useParams()
  const [title, description] = publicLabs[labSlug] || ['Guided lab overview', 'This lab overview is not available. Browse the current guided lab list.']
  return (
    <PublicPage eyebrow="Guided lab overview" title={title} path={`/labs/${labSlug}`} description={description} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cyber labs', href: '/labs' }, { label: title }]} actions={<Link to="/auth?mode=login&redirect=%2Fdashboard" className="site-button-primary">Sign in to your courses<Icon name="arrow_forward" /></Link>}>
      <section className="info-section"><div className="site-container info-split"><div><p className="site-eyebrow">Access and safety</p><h2>Available through the enrolled course</h2><p>The public page explains the learning goal. Instructions, evidence, hints, attempts and scoring remain behind authenticated course access.</p></div><EditorialRows items={['Confirm the authorised scope', 'Follow the guided instructions', 'Record evidence and observations', 'Submit a defensive finding']} /></div></section>
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
      <section className="info-section"><div className="site-container instructor-list-feature"><div className="instructor-list-monogram" aria-hidden="true">AS</div><div><p className="site-eyebrow">Founder and course author</p><h2>Arghya Sikdar</h2><p>Founder and CEO of Cyber Lab IN, cybersecurity educator and practitioner with more than 13 years of combined industry and academic experience.</p><Link to="/instructors/arghya-sikdar" className="site-text-link">View full instructor profile<Icon name="arrow_forward" /></Link></div></div></section>
    </PublicPage>
  )
}

function instructorSchema() {
  const base = (import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Person', '@id': `${base}/instructors/arghya-sikdar#person`, name: 'Arghya Sikdar', jobTitle: 'Founder and CEO of Cyber Lab IN', url: `${base}/instructors/arghya-sikdar`, worksFor: { '@type': 'EducationalOrganization', name: 'Cyber Lab IN', url: `${base}/` }, hasCredential: [{ '@type': 'EducationalOccupationalCredential', name: 'EC-Council Certified Ethical Hacker (CEH)' }, { '@type': 'EducationalOccupationalCredential', name: 'EC-Council Computer Hacking Forensic Investigator (CHFI)' }], knowsAbout: instructorExpertise, description: 'Founder and CEO of Cyber Lab IN, cybersecurity educator and practitioner focused on practical cybersecurity training, guided labs and real-world security workflows.' },
      { '@type': 'ProfilePage', '@id': `${base}/instructors/arghya-sikdar#profilepage`, url: `${base}/instructors/arghya-sikdar`, name: 'Arghya Sikdar Instructor Profile', about: { '@id': `${base}/instructors/arghya-sikdar#person` }, dateModified: '2026-06-11' },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` }, { '@type': 'ListItem', position: 2, name: 'Instructors', item: `${base}/instructors` }, { '@type': 'ListItem', position: 3, name: 'Arghya Sikdar', item: `${base}/instructors/arghya-sikdar` }] },
    ],
  }
}

export function InstructorProfilePage() {
  const schema = instructorSchema()
  return (
    <PublicPage eyebrow="Instructor profile" title="Arghya Sikdar" path="/instructors/arghya-sikdar" description="Founder and CEO of Cyber Lab IN, cybersecurity educator and practitioner with more than 13 years of combined industry and academic experience." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Instructors', href: '/instructors' }, { label: 'Arghya Sikdar' }]} introAside={<aside className="profile-status"><div className="profile-photo-placeholder" role="img" aria-label="Professional photograph of Arghya Sikdar is pending">AS</div><p>Professional photograph pending</p><span>Profile content reviewed 11 June 2026</span></aside>}>
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
      <section className="organisation-section" id="institutions"><div className="site-container organisation-feature"><div><p className="site-eyebrow">Educational institutions</p><h2>Bring structured practical work into cybersecurity teaching</h2><p>Discuss curriculum integration, faculty enablement, cohort delivery and guided lab exercises around existing academic programmes.</p><Link to="/contact" className="site-text-link">Discuss an institution programme<Icon name="arrow_forward" /></Link></div><EditorialRows items={['Curriculum integration', 'Faculty enablement', 'Student cohort training', 'Guided lab integration']} /></div></section>
      <section className="organisation-section organisation-section-dark" id="businesses"><div className="site-container organisation-feature"><div><p className="site-eyebrow">Business training</p><h2>Shape learning around team roles and relevant risk</h2><p>Explore security awareness, technical foundations and custom programme scoping without generic claims or fixed packages.</p><Link to="/contact" className="site-button-secondary">Discuss business training<Icon name="arrow_forward" /></Link></div><EditorialRows items={['Security awareness foundations', 'Phishing prevention practice', 'Web security for developers', 'Role-aware team upskilling']} /></div></section>
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
    <PublicPage eyebrow="Curriculum roadmap" title={course.title} path={`/courses/cybersecurity/${slug}`} description={course.summary} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Courses', href: '/courses' }, { label: 'Cybersecurity', href: '/courses/cybersecurity' }, { label: course.title }]} actions={<Link to="/courses/cybersecurity/cyber-security-essentials" className="site-button-primary">Start with a published course<Icon name="arrow_forward" /></Link>} introAside={<aside className="info-callout info-callout-warning"><p className="site-eyebrow">Publication status</p><p>This is a transparent curriculum roadmap. Enrolment, pricing, dates and detailed curriculum will appear only if the course is published.</p></aside>}>
      <section className="info-section"><div className="site-container info-split"><div><p className="site-eyebrow">Proposed topic direction</p><h2>Topics under curriculum review</h2><p>These themes describe the current direction and are not a promise of delivery or availability.</p><Link to="/contact" className="site-text-link">Ask about the roadmap<Icon name="arrow_forward" /></Link></div><EditorialRows items={course.topics} /></div></section>
    </PublicPage>
  )
}
