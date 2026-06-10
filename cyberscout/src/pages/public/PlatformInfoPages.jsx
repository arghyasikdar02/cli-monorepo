import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'
import LeadCaptureForm from '../../components/ui/LeadCaptureForm'

const siteName = 'Cyber Lab IN'

const navLinks = [
  ['Courses', '/courses'],
  ['Learning Paths', '/learning-paths'],
  ['Labs', '/labs'],
  ['Resources', '/resources'],
  ['About', '/about'],
  ['Contact', '/contact'],
]

const learningPathData = {
  'beginner-cybersecurity': {
    title: 'Beginner Cybersecurity Learning Path',
    summary: 'A practical starting path for learners who want cybersecurity fundamentals, account safety, phishing awareness and guided labs.',
    items: ['Cybersecurity foundations', 'Phishing and scam awareness', 'Account protection', 'Beginner web security', 'Defensive reporting'],
  },
  'ethical-hacking': {
    title: 'Ethical Hacking and Web Security Learning Path',
    summary: 'A responsible path for learning how security testing works, why permission matters and how web security risks are identified safely.',
    items: ['Responsible testing boundaries', 'Recon awareness', 'Web request-response behaviour', 'Unsafe input awareness', 'Basic reporting'],
  },
  'soc-analyst': {
    title: 'Security Operations and SOC Learning Path',
    summary: 'A defensive path for learners interested in alerts, investigation structure, incident notes and SOC-style workflows.',
    items: ['Alert triage concepts', 'Investigation timelines', 'Evidence notes', 'Defensive communication', 'Monitoring basics'],
  },
  'network-cloud-security': {
    title: 'Network and Cloud Security Learning Path',
    summary: 'A foundation path for learners who want practical awareness of networks, identity, cloud configuration and access control.',
    items: ['Network fundamentals', 'Identity and access basics', 'Cloud configuration awareness', 'Secure defaults', 'Risk review'],
  },
  'digital-forensics': {
    title: 'Digital Forensics and Investigation Learning Path',
    summary: 'A careful investigation path covering evidence thinking, timelines, artefacts and beginner-friendly forensic reasoning.',
    items: ['Evidence handling concepts', 'Timeline thinking', 'Digital artefacts', 'Incident notes', 'Responsible escalation'],
  },
}

const plannedCourses = {
  'web-application-security': {
    title: 'Web Application Security Fundamentals',
    summary: 'A planned course for responsible web security foundations, request-response behaviour, unsafe input, session risk and practical defensive thinking.',
    topics: ['HTTP request-response basics', 'Unsafe input awareness', 'SQL Injection concepts', 'XSS concepts', 'Session security', 'Defensive reporting'],
  },
  'soc-analyst-foundations': {
    title: 'SOC Analyst Foundations',
    summary: 'A planned course for entry-level security operations, alert triage, investigation structure, monitoring context and practical reporting.',
    topics: ['SOC workflow basics', 'Alert triage', 'Log review concepts', 'Incident notes', 'Attendance and monitoring', 'Defensive escalation'],
  },
  'ethical-hacking-foundations': {
    title: 'Ethical Hacking Foundations',
    summary: 'A planned course for legal, responsible security testing foundations and beginner-safe vulnerability thinking.',
    topics: ['Ethics and permission', 'Scope boundaries', 'Recon awareness', 'Vulnerability basics', 'Safe lab practice', 'Reporting'],
  },
}

const instructorExpertise = [
  'Cybersecurity Education',
  'Vulnerability Assessment & Penetration Testing',
  'Web Application Security',
  'Cloud Security',
  'DevSecOps',
  'Security Operations (SOC)',
  'Digital Forensics',
  'Security Awareness & Training',
  'Cybersecurity Curriculum Design',
  'AI Applications in Cybersecurity',
]

const academicSubjects = [
  'Ethical Hacking',
  'Vulnerability Assessment and Penetration Testing',
  'Digital Forensics',
  'DevSecOps',
  'Cloud Security',
  'AI in Cybersecurity',
  'Malware Analysis',
  'Blockchain Security',
  'Network Security',
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
  ['Web Application Security Fundamentals', '/courses/cybersecurity/web-application-security'],
  ['SOC Analyst Foundations', '/courses/cybersecurity/soc-analyst-foundations'],
]

const authoredBlogLinks = [
  ['What is cybersecurity?', '/blog/what-is-cybersecurity'],
  ['What is phishing and how to prevent it?', '/blog/what-is-phishing-and-how-to-prevent-it'],
  ['What is ethical hacking?', '/blog/what-is-ethical-hacking'],
  ['How to learn cybersecurity for beginners?', '/blog/how-to-learn-cybersecurity-for-beginners'],
]

const instructorLearningPathLinks = [
  ['Beginner Cybersecurity', '/learning-paths/beginner-cybersecurity'],
  ['Ethical Hacking and Web Security', '/learning-paths/ethical-hacking'],
  ['Security Operations and SOC', '/learning-paths/soc-analyst'],
  ['Network and Cloud Security', '/learning-paths/network-cloud-security'],
]

function instructorSchema() {
  const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${siteUrl}/instructors/arghya-sikdar#person`,
        name: 'Arghya Sikdar',
        jobTitle: 'Founder and CEO of Cyber Lab IN',
        url: `${siteUrl}/instructors/arghya-sikdar`,
        worksFor: {
          '@type': 'EducationalOrganization',
          name: 'Cyber Lab IN',
          url: `${siteUrl}/`,
        },
        affiliation: {
          '@type': 'EducationalOrganization',
          name: 'Cyber Lab IN',
          url: `${siteUrl}/`,
        },
        hasCredential: [
          {
            '@type': 'EducationalOccupationalCredential',
            name: 'EC-Council Certified Ethical Hacker (CEH)',
          },
          {
            '@type': 'EducationalOccupationalCredential',
            name: 'EC-Council Computer Hacking Forensic Investigator (CHFI)',
          },
        ],
        knowsAbout: instructorExpertise,
        description:
          'Founder and CEO of Cyber Lab IN, cybersecurity educator and practitioner focused on practical cybersecurity training, guided labs and real-world security workflows.',
      },
      {
        '@type': 'ProfilePage',
        '@id': `${siteUrl}/instructors/arghya-sikdar#profilepage`,
        url: `${siteUrl}/instructors/arghya-sikdar`,
        name: 'Arghya Sikdar Instructor Profile',
        about: { '@id': `${siteUrl}/instructors/arghya-sikdar#person` },
        dateModified: '2026-06-11',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Instructors', item: `${siteUrl}/instructors` },
          { '@type': 'ListItem', position: 3, name: 'Arghya Sikdar', item: `${siteUrl}/instructors/arghya-sikdar` },
        ],
      },
    ],
  }
}

function setPageMeta(title, description) {
  document.title = `${title} | ${siteName}`
  let meta = document.head.querySelector('meta[name="description"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'description')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', description)
}

function PublicShell({ title, eyebrow, children, description }) {
  useEffect(() => {
    setPageMeta(title, description || 'Cyber Lab IN public information page for cybersecurity learners.')
  }, [title, description])

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <Link to="/" aria-label="Cyber Lab IN homepage">
            <CLILogo variant="full" tone="light" size={150} />
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-700">
            {navLinks.map(([label, href]) => (
              <Link key={href} to={href} className="hover:text-slate-950">{label}</Link>
            ))}
            <Link to="/auth?mode=login&redirect=%2Fdashboard" className="rounded-lg bg-slate-950 px-4 py-2.5 text-white">Login</Link>
          </div>
        </nav>
      </header>
      <main>
        <section className="px-5 py-14 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="font-space-grotesk text-xs font-bold uppercase tracking-[0.18em] text-sky-700">{eyebrow}</p>
            <h1 className="mt-4 max-w-4xl font-space-grotesk text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
            {description && <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{description}</p>}
          </div>
        </section>
        {children}
      </main>
      <footer className="border-t border-slate-200 px-5 py-8 text-sm text-slate-500 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Cyber Lab IN.</p>
          <Link to="/contact" className="font-bold text-slate-700 hover:text-slate-950">Contact the team</Link>
        </div>
      </footer>
    </div>
  )
}

function InfoGrid({ items }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(item => (
        <article key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold leading-7 text-slate-700">{item}</p>
        </article>
      ))}
    </div>
  )
}

export function LearningPathsPage() {
  return (
    <PublicShell
      eyebrow="Learning paths"
      title="Cybersecurity Learning Paths"
      description="Choose a practical path based on your current goal. Each path is designed to connect clear concepts with guided labs and responsible defensive thinking."
    >
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2">
          {Object.entries(learningPathData).map(([slug, path]) => (
            <Link key={slug} to={`/learning-paths/${slug}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="font-space-grotesk text-2xl font-black">{path.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{path.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}

export function LearningPathDetailPage({ slug }) {
  const path = learningPathData[slug] || learningPathData['beginner-cybersecurity']
  const relatedGuides = [
    ['What is cybersecurity?', '/blog/what-is-cybersecurity'],
    ['How to learn cybersecurity for beginners?', '/blog/how-to-learn-cybersecurity-for-beginners'],
    ['What is ethical hacking?', '/blog/what-is-ethical-hacking'],
  ]
  return (
    <PublicShell eyebrow="Learning path" title={path.title} description={path.summary}>
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <InfoGrid items={path.items} />
          <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="font-space-grotesk text-2xl font-black">Related cybersecurity guides</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                These guides support the learning path with beginner-friendly explanations and links back to hands-on courses.
              </p>
              <Link to="/courses" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Explore matching courses</Link>
            </div>
            <div className="grid gap-3">
              {relatedGuides.map(([label, href]) => (
                <Link key={href} to={href} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:border-sky-300 hover:text-sky-800">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}

export function LabsPage() {
  const labs = ['Phishing indicator analysis', 'Account hardening review', 'Web request-response practice', 'Unsafe input awareness', 'Session security basics', 'Defensive reporting practice']
  return (
    <PublicShell
      eyebrow="Cybersecurity labs"
      title="Guided Cybersecurity Labs"
      description="Cyber Lab IN labs are designed for safe, beginner-friendly practice. Labs focus on observation, explanation and defensive reporting rather than unsafe offensive infrastructure."
    >
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <InfoGrid items={labs} />
        </div>
      </section>
    </PublicShell>
  )
}

export function ResourcesPage() {
  const categories = [
    ['Beginner Cybersecurity', '/blog?category=Beginner%20Cybersecurity'],
    ['Ethical Hacking', '/blog?category=Ethical%20Hacking'],
    ['Web Security', '/blog?category=Web%20Security'],
    ['SOC & Defensive Security', '/blog?category=SOC%20%26%20Defensive%20Security'],
    ['Digital Forensics', '/blog?category=Digital%20Forensics'],
    ['Cloud Security', '/blog?category=Cloud%20Security'],
    ['Career Guidance', '/blog?category=Career%20Guidance'],
  ]
  const resources = [
    ['What is cybersecurity?', '/blog/what-is-cybersecurity'],
    ['What is phishing and how to prevent it?', '/blog/what-is-phishing-and-how-to-prevent-it'],
    ['What is ethical hacking?', '/blog/what-is-ethical-hacking'],
    ['How to learn cybersecurity for beginners?', '/blog/how-to-learn-cybersecurity-for-beginners'],
  ]
  return (
    <PublicShell
      eyebrow="Resources"
      title="Cybersecurity Guides and Resources"
      description="Read practical beginner guides that support Cyber Lab IN courses and help learners understand cybersecurity concepts clearly."
    >
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-space-grotesk text-2xl font-black">Browse by cybersecurity topic</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Cyber Lab IN resource categories connect beginner cybersecurity, ethical hacking, web security, SOC, digital forensics, cloud security and career guidance to practical learning paths.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map(([label, href]) => (
              <Link key={href} to={href} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-sky-300 hover:text-sky-800">
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
          {resources.map(([title, href]) => (
            <Link key={href} to={href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="font-space-grotesk text-2xl font-black">{title}</h2>
              <p className="mt-3 text-sm font-bold text-sky-700">Read guide</p>
            </Link>
          ))}
          </div>
        </div>
      </section>
    </PublicShell>
  )
}

export function InstructorsPage() {
  return (
    <PublicShell
      eyebrow="Instructors"
      title="Cyber Lab IN Instructor Profiles"
      description="Meet the educators and practitioners behind Cyber Lab IN courses. Public profile details are kept conservative and should be verified before additional credential claims are added."
    >
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Link to="/instructors/arghya-sikdar" className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h2 className="font-space-grotesk text-2xl font-black">Arghya Sikdar</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Founder and CEO of Cyber Lab IN, cybersecurity educator and practitioner with more than 13 years of combined industry and academic experience.
            </p>
          </Link>
        </div>
      </section>
    </PublicShell>
  )
}

export function InstructorProfilePage() {
  const schema = instructorSchema()

  return (
    <PublicShell
      eyebrow="Instructor profile"
      title="Arghya Sikdar"
      description="Founder and CEO of Cyber Lab IN, cybersecurity educator and practitioner with more than 13 years of combined industry and academic experience."
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div
              role="img"
              aria-label="Professional profile image placeholder for Arghya Sikdar"
              className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-slate-950 via-slate-800 to-violet-700 text-center text-white"
            >
              <div>
                <p className="font-space-grotesk text-7xl font-black">AS</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-200">Profile image pending</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-700">Founder and CEO, Cyber Lab IN</p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-700">Cybersecurity educator and practitioner</p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-700">Last reviewed: June 11, 2026</p>
            </div>
          </aside>

          <div className="space-y-6">
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-space-grotesk text-xs font-black uppercase tracking-[0.18em] text-sky-700">Trust and authority</p>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight">Founder, educator and practical cybersecurity builder</h2>
              <p className="mt-5 text-base leading-8 text-slate-700">
                Arghya Sikdar is the Founder and CEO of Cyber Lab IN, a cybersecurity education and practical learning platform focused on helping students, professionals and career switchers build real-world cybersecurity skills through structured training and guided practical exercises.
              </p>
              <p className="mt-4 text-base leading-8 text-slate-700">
                With more than 13 years of combined industry and academic experience, he has worked across cybersecurity, DevSecOps, cloud security, vulnerability management, application security, security operations and technical education.
              </p>
            </article>

            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-space-grotesk text-2xl font-black">Enterprise and academic experience</h2>
              <p className="mt-4 text-base leading-8 text-slate-700">
                Throughout his career, he has contributed to projects, assessments, consulting engagements and security initiatives involving global organizations and enterprise environments including:
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {enterpriseEnvironments.map(org => (
                  <span key={org} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">{org}</span>
                ))}
              </div>
              <p className="mt-6 text-base leading-8 text-slate-700">
                In academia, he has served as Assistant Professor and cybersecurity educator across multiple higher-education institutions and universities, teaching technical and applied cybersecurity subjects.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h2 className="font-space-grotesk text-3xl font-black tracking-tight">Subjects taught and areas of expertise</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              His teaching and curriculum work connects practical cybersecurity education with ethical hacking, VAPT, cloud security, SOC, digital forensics, malware analysis and AI in cybersecurity.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-space-grotesk text-xl font-black">Academic subjects</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {academicSubjects.map(subject => (
                  <li key={subject} className="flex gap-2 text-sm font-semibold leading-6 text-slate-700">
                    <span className="material-symbols-outlined text-[18px] text-sky-700">check_circle</span>
                    {subject}
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-space-grotesk text-xl font-black">Areas of expertise</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {instructorExpertise.map(area => (
                  <li key={area} className="flex gap-2 text-sm font-semibold leading-6 text-slate-700">
                    <span className="material-symbols-outlined text-[18px] text-violet-700">verified</span>
                    {area}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-space-grotesk text-3xl font-black tracking-tight">Experience timeline</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
            This timeline summarizes the professional context behind Cyber Lab IN's practical cybersecurity learning approach.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {instructorTimeline.map(([title, context, copy]) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="font-space-grotesk text-sm font-black uppercase tracking-[0.16em] text-sky-700">{context}</p>
                <h3 className="mt-3 font-space-grotesk text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-space-grotesk text-3xl font-black tracking-tight">Certifications</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Credentials listed here are used to support instructor discovery and should remain verifiable.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {['EC-Council Certified Ethical Hacker (CEH)', 'EC-Council Computer Hacking Forensic Investigator (CHFI)'].map(cert => (
              <div key={cert} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="material-symbols-outlined text-sky-700">workspace_premium</span>
                <p className="mt-3 font-space-grotesk text-lg font-black">{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {[
            ['Authored courses', authoredCourseLinks],
            ['Authored blog posts', authoredBlogLinks],
            ['Related learning paths', instructorLearningPathLinks],
          ].map(([title, links]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-space-grotesk text-2xl font-black">{title}</h2>
              <div className="mt-5 space-y-3">
                {links.map(([label, href]) => (
                  <Link key={href} to={href} className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-800">
                    {label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}

export function ContactPage() {
  return (
    <PublicShell
      eyebrow="Contact"
      title="Contact Cyber Lab IN"
      description="Ask about courses, learning paths, labs, organisation training or certificates. The team will follow up with practical guidance."
    >
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-space-grotesk text-2xl font-black">Contact details</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Email: hello@cyberlabin.com</p>
            <p id="organisations" className="mt-3 text-sm leading-7 text-slate-600">
              For organisations, share your training goals and learner count so Cyber Lab IN can recommend a practical starting point.
            </p>
          </div>
          <LeadCaptureForm source="website" title="Request Cyber Lab IN guidance" defaultMessage="I would like to contact Cyber Lab IN about cybersecurity training." />
        </div>
      </section>
    </PublicShell>
  )
}

export function ForOrganisationsPage() {
  return (
    <PublicShell
      eyebrow="For organisations"
      title="Cybersecurity Learning for Organisations"
      description="Cyber Lab IN can support teams with beginner-friendly cybersecurity awareness, guided lab practice and defensive learning paths."
    >
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr]">
          <InfoGrid items={['Security awareness foundations', 'Phishing prevention practice', 'Web security basics for developers', 'Defensive reporting habits', 'Custom learning path discussions']} />
          <LeadCaptureForm source="website" title="Discuss organisation training" defaultMessage="I would like to discuss cybersecurity training for an organisation." compact />
        </div>
      </section>
    </PublicShell>
  )
}

export function CertificateVerificationPage() {
  return (
    <PublicShell
      eyebrow="Certificate verification"
      title="Certificate Verification"
      description="Cyber Lab IN certificate verification is planned as a public lookup. Until the lookup is live, contact the team for manual verification."
    >
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-space-grotesk text-2xl font-black">Verification status</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Public certificate lookup is not enabled yet. For verification requests, email hello@cyberlabin.com with the learner name, course name and certificate ID if available.
          </p>
        </div>
      </section>
    </PublicShell>
  )
}

export function CookiePolicyPage() {
  return (
    <PublicShell
      eyebrow="Cookie policy"
      title="Cookie Policy"
      description="Cyber Lab IN uses necessary cookies for site operation and consent-managed analytics or marketing cookies only when enabled by the visitor."
    >
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            ['Necessary', 'Required for login, security and core site behaviour.'],
            ['Analytics', 'Used only after consent to understand aggregate site usage.'],
            ['Marketing', 'Used only after consent for campaign attribution and follow-up.'],
          ].map(([title, copy]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-space-grotesk text-2xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}

export function PlannedCoursePage({ slug }) {
  const course = plannedCourses[slug] || plannedCourses['web-application-security']
  return (
    <PublicShell eyebrow="Course roadmap" title={course.title} description={course.summary}>
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
            This course page is a transparent roadmap page. Enrolment, detailed curriculum, pricing and dates should be added only after the course is ready to publish.
          </div>
          <div className="mt-8">
            <InfoGrid items={course.topics} />
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/courses/cybersecurity/cyber-security-essentials" className="inline-flex justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
              Start with Cyber Security Essentials
            </Link>
            <Link to="/contact" className="inline-flex justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-800">
              Ask about this course
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
