import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'
import LeadCaptureForm from '../../components/ui/LeadCaptureForm'
import FaqChatbot from '../../components/ui/FaqChatbot'
import { api } from '../../lib/api'

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')
const configuredFee = import.meta.env.VITE_CSE_COURSE_FEE ?? ''
const parsedFee = Number(configuredFee)
const feeLabel = Number.isFinite(parsedFee) && parsedFee > 0 ? `INR ${parsedFee.toLocaleString('en-IN')}` : 'Check current course page'
const ogImagePath = '/brand/cyber-lab-in-full-light.png'
const ogImageUrl = `${siteUrl}${ogImagePath}`

const metadata = {
  title: 'Online Cybersecurity Courses with Hands-On Labs | Cyber Lab IN',
  description:
    'Learn cybersecurity online through guided lessons, hands-on labs and practical security scenarios. Explore beginner courses in phishing, web security, SOC analysis, ethical hacking and defensive security.',
  ogTitle: 'Learn Cybersecurity Online Through Hands-On Practice',
  ogDescription:
    'Explore practical cybersecurity courses with guided labs, real-world scenarios and structured learning paths for beginners and aspiring security professionals.',
}

const courseLinks = [
  {
    title: 'Cyber Security Essentials',
    href: '/courses/cybersecurity/cyber-security-essentials',
    summary: 'Beginner-friendly cybersecurity foundations with guided labs, phishing awareness, web security basics and defensive reporting.',
    status: 'Available starter course',
  },
  {
    title: 'Web Application Security Fundamentals',
    href: '/courses/cybersecurity/web-application-security',
    summary: 'Responsible web security foundations covering request-response behaviour, unsafe input, session risks and secure thinking.',
    status: 'Curriculum roadmap',
  },
  {
    title: 'SOC Analyst Foundations',
    href: '/courses/cybersecurity/soc-analyst-foundations',
    summary: 'Defensive security operations basics, alert triage, investigation structure, reporting and entry-level SOC workflows.',
    status: 'Curriculum roadmap',
  },
  {
    title: 'Ethical Hacking Foundations',
    href: '/courses/cybersecurity/ethical-hacking-foundations',
    summary: 'Responsible offensive-security concepts, legal boundaries, recon awareness and beginner-safe vulnerability thinking.',
    status: 'Curriculum roadmap',
  },
]

const learningPaths = [
  ['Beginner Cybersecurity', '/learning-paths/beginner-cybersecurity', 'Build security awareness, account safety, phishing analysis and core defensive habits.'],
  ['Ethical Hacking and Web Security', '/learning-paths/ethical-hacking', 'Learn responsible testing foundations and web application security basics.'],
  ['Security Operations and SOC', '/learning-paths/soc-analyst', 'Understand alert review, investigation workflows, reporting and monitoring concepts.'],
  ['Network and Cloud Security', '/learning-paths/network-cloud-security', 'Explore network fundamentals, cloud risks, identity controls and secure configuration.'],
  ['Digital Forensics and Investigation', '/learning-paths/digital-forensics', 'Learn careful evidence thinking, incident timelines and beginner investigation structure.'],
]

const trustPoints = [
  'Beginner-friendly learning paths',
  'Guided cybersecurity labs',
  'Practical defensive training',
  'Online, self-paced courses',
  'Certificates of completion',
  'Clear prerequisites and outcomes',
]

const whyPoints = [
  ['science', 'Guided Hands-On Labs', 'Practise concepts in structured, safe exercises instead of only watching theory.'],
  ['school', 'Clear Beginner Explanations', 'Move step by step through security language, workflows and practical context.'],
  ['verified_user', 'Defensive and Responsible Approach', 'Learn security with boundaries, ethics and safer real-world decision making.'],
  ['travel_explore', 'Real-World Scenarios', 'Study phishing, web behaviour, account safety and investigation patterns learners can recognise.'],
  ['route', 'Structured Learning Paths', 'Start with fundamentals and progress into web security, SOC, forensics, cloud and ethical hacking.'],
  ['insights', 'Measurable Outcomes', 'Each course states prerequisites, learning outcomes and the practical skills learners should build.'],
]

const platformSteps = [
  ['Learn the Concept', 'Understand the security idea with plain language and practical examples.'],
  ['Observe the Scenario', 'Review realistic prompts, artefacts, emails, web behaviour or investigation context.'],
  ['Complete the Guided Lab', 'Apply the concept in a contained lab with clear instructions and guardrails.'],
  ['Report the Finding', 'Turn observations into clear defensive notes, risks and recommendations.'],
]

const audiences = [
  'School and college students exploring cybersecurity',
  'Graduates preparing for entry-level security roles',
  'IT professionals adding security knowledge',
  'Career switchers evaluating cybersecurity careers',
  'Developers learning secure application practices',
  'Business professionals improving cyber awareness',
]

const skillClusters = [
  ['Security Awareness', ['phishing indicators', 'account protection', 'digital footprint risk']],
  ['Web Security', ['request-response basics', 'unsafe input', 'session security']],
  ['Defensive Security', ['risk observation', 'safe reporting', 'responsible decision making']],
  ['Security Operations', ['alert thinking', 'investigation flow', 'evidence notes']],
  ['Infrastructure Security', ['network basics', 'cloud configuration awareness', 'access control']],
]

const beginnerCourseFacts = [
  ['Level', 'Beginner'],
  ['Duration', '7 days'],
  ['Mode', 'Online'],
  ['Prerequisites', 'Basic computer and internet knowledge'],
  ['Credential', 'Certificate of Completion'],
  ['Instructor', 'Arghya Sikdar'],
  ['Fee', feeLabel],
]

const careerRoles = [
  'SOC Analyst',
  'Junior Cybersecurity Analyst',
  'Vulnerability Assessment Analyst',
  'Network Security Associate',
  'Web Security Tester',
  'Incident Response Associate',
  'Digital Forensics Assistant',
  'Cloud Security Associate',
]

const faqs = [
  {
    question: 'What is the best online cybersecurity course for beginners?',
    answer:
      'The best beginner course combines clear explanations with guided practice. Cyber Lab IN starts with Cyber Security Essentials, a practical online course built around labs, phishing awareness, web security basics and defensive reporting.',
  },
  {
    question: 'Do Cyber Lab IN courses include hands-on labs?',
    answer:
      'Yes. Courses are designed around guided labs, scenarios and reporting practice so learners can apply the ideas they are studying in a safe, structured way.',
  },
  {
    question: 'Can non-technical learners start here?',
    answer:
      'Yes. The beginner path assumes basic computer and internet knowledge, then introduces cybersecurity concepts gradually with plain-language explanations and practical examples.',
  },
  {
    question: 'Will this training guarantee a cybersecurity job?',
    answer:
      'No training provider should guarantee employment. Cyber Lab IN helps learners build foundation skills that can support further study and entry-level preparation.',
  },
]

const footerLinks = [
  ['All Courses', '/courses'],
  ['Learning Paths', '/learning-paths'],
  ['Cybersecurity Labs', '/labs'],
  ['Instructor Profiles', '/instructors'],
  ['About Cyber Lab IN', '/about'],
  ['Contact', '/contact'],
  ['Privacy Policy', '/privacy-policy'],
  ['Terms of Use', '/terms'],
  ['Cookie Policy', '/cookie-policy'],
  ['Refund Policy', '/refund-policy'],
  ['Certificate Verification', '/certificate-verification'],
]

const courseDropdownLinks = [
  ['All Courses', '/courses'],
  ['Beginner Cybersecurity', '/learning-paths/beginner-cybersecurity'],
  ['Ethical Hacking', '/learning-paths/ethical-hacking'],
  ['Web Security', '/courses/cybersecurity/web-application-security'],
  ['SOC and Defensive Security', '/learning-paths/soc-analyst'],
  ['Network and Cloud Security', '/learning-paths/network-cloud-security'],
  ['Digital Forensics', '/learning-paths/digital-forensics'],
]

function getInitialTheme() {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
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

function SectionLabel({ children }) {
  return (
    <p className="font-space-grotesk text-xs font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
      {children}
    </p>
  )
}

function formatDate(value) {
  if (!value) return 'Date pending'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white/75 text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 dark:focus:ring-offset-slate-950"
    >
      <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
    </button>
  )
}

function CourseDropdown() {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-2 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
        Courses
        <span className="material-symbols-outlined text-[18px] transition group-open:rotate-180">expand_more</span>
      </summary>
      <div className="absolute left-0 top-11 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-slate-900">
        {courseDropdownLinks.map(([label, href]) => (
          <a key={href} href={href} className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
            {label}
          </a>
        ))}
      </div>
    </details>
  )
}

function PlatformVisual() {
  const nodes = ['Awareness', 'Labs', 'SOC', 'Web', 'Reports']
  return (
    <div className="relative mx-auto w-full max-w-[620px]" aria-label="Cyber Lab IN learning platform visual">
      <div className="absolute -inset-6 rounded-[36px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.20),transparent_36%)] blur-2xl dark:[background-image:var(--hero-glow)]" />
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_30px_90px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_30px_90px_rgba(0,0,0,0.40)]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-space-grotesk text-sm font-bold text-slate-950 dark:text-white">Guided Cybersecurity Path</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Learn, practise, report, improve</p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
              Online labs
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-5">
            {nodes.map((node, index) => (
              <div key={node} className="relative rounded-2xl border border-slate-200 bg-white p-3 text-center dark:border-white/10 dark:bg-slate-900">
                {index < nodes.length - 1 && (
                  <span className="absolute left-[calc(100%-0.25rem)] top-1/2 hidden h-px w-5 bg-gradient-to-r from-sky-300 to-violet-400 sm:block" />
                )}
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-600 text-sm font-black text-white">
                  {index + 1}
                </span>
                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">{node}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
              <p className="font-space-grotesk text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Current lab focus
              </p>
              <div className="mt-4 space-y-3">
                {[
                  ['Phishing indicator review', 'sender, link and domain checks'],
                  ['Web request observation', 'browser to server behaviour'],
                  ['Defensive report', 'risk, impact and next action'],
                ].map(([title, label]) => (
                  <div key={title} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/80">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
              <p className="font-space-grotesk text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Learning outcome
              </p>
              <p className="mt-4 font-space-grotesk text-2xl font-black text-slate-950 dark:text-white">Practice-ready</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Every course is designed to connect concepts with guided observation and responsible defensive action.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

function buildHomepageSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': `${siteUrl}/#organization`,
        name: 'Cyber Lab IN',
        alternateName: 'CLI',
        url: `${siteUrl}/`,
        logo: {
          '@type': 'ImageObject',
          url: ogImageUrl,
          width: 907,
          height: 508,
        },
        email: 'hello@cyberlabin.com',
        description:
          'Cyber Lab IN is an online learning platform offering practical cybersecurity courses, guided labs and structured learning paths for beginners and aspiring security professionals.',
        knowsAbout: [
          'cybersecurity education',
          'hands-on cybersecurity labs',
          'cybersecurity learning platform',
          'ethical hacking training',
          'SOC analyst training',
          'web security training',
          'cybersecurity career paths',
          'defensive security',
        ],
        founder: {
          '@type': 'Person',
          name: 'Arghya Sikdar',
          url: `${siteUrl}/instructors/arghya-sikdar`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: 'Cyber Lab IN',
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/#webpage`,
        url: `${siteUrl}/`,
        name: metadata.title,
        description: metadata.description,
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': `${siteUrl}/#organization` },
        keywords: 'online cybersecurity courses, hands-on cybersecurity labs, ethical hacking training, SOC analyst training, web security training, defensive security',
        dateModified: '2026-06-11',
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: ogImageUrl,
          width: 907,
          height: 508,
        },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/#featured-courses`,
        name: 'Featured cybersecurity courses',
        itemListElement: courseLinks.map((course, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${siteUrl}${course.href}`,
          name: course.title,
          description: course.summary,
        })),
      },
    ],
  }
}

function HomepageHeader({ theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/82 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78">
      <nav className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10" aria-label="Primary navigation">
        <a href="/" className="flex items-center" aria-label="Cyber Lab IN homepage">
          <CLILogo variant="full" tone={theme === 'dark' ? 'dark' : 'light'} size={150} />
        </a>
        <div className="hidden items-center gap-1 lg:flex">
          <CourseDropdown />
          {[
            ['Learning Paths', '/learning-paths'],
            ['Labs', '/labs'],
            ['Resources', '/resources'],
            ['About', '/about'],
            ['Instructors', '/instructors'],
            ['For Organisations', '/for-organisations'],
            ['Contact', '/contact'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="rounded-lg px-2 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <Link
            to="/auth?mode=login&redirect=%2Fdashboard"
            className="hidden rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 sm:inline-flex dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Login
          </Link>
          <Link
            to="/courses"
            className="inline-flex rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            Explore Courses
          </Link>
        </div>
      </nav>
      <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 pb-3 text-sm font-semibold text-slate-600 sm:px-8 lg:hidden">
        {[
          ['Courses', '/courses'],
          ['Paths', '/learning-paths'],
          ['Labs', '/labs'],
          ['Resources', '/resources'],
          ['About', '/about'],
          ['Contact', '/contact'],
        ].map(([label, href]) => (
          <a key={href} href={href} className="rounded-full border border-slate-200 px-3 py-1.5 dark:border-white/10 dark:text-slate-200">
            {label}
          </a>
        ))}
      </div>
    </header>
  )
}

function HomepageFooter({ theme }) {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-12 dark:border-white/10 dark:bg-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_1.4fr]">
        <div>
          <CLILogo variant="full" tone={theme === 'dark' ? 'dark' : 'light'} size={150} />
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
            Practical online cybersecurity courses with guided labs, structured learning paths and defensive workflows for beginners and aspiring security professionals.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">hello@cyberlabin.com</p>
        </div>
        <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Footer navigation">
          {footerLinks.map(([label, href]) => (
            <a key={href} href={href} className="rounded-lg px-1 py-1 text-sm font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              {label}
            </a>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Cyber Lab IN. All rights reserved.</p>
        <p>Learn. Practice. Defend.</p>
      </div>
    </footer>
  )
}

export default function WelcomePage() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [latestBlogs, setLatestBlogs] = useState([])
  const [blogsLoading, setBlogsLoading] = useState(true)
  const [blogsError, setBlogsError] = useState('')

  const homepageSchema = useMemo(() => buildHomepageSchema(), [])

  useEffect(() => {
    document.title = metadata.title
    upsertMeta('meta[name="description"]', { name: 'description', content: metadata.description })
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: `${siteUrl}/` })
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

    let schemaElement = document.getElementById('homepage-json-ld')
    if (!schemaElement) {
      schemaElement = document.createElement('script')
      schemaElement.type = 'application/ld+json'
      schemaElement.id = 'homepage-json-ld'
      document.head.appendChild(schemaElement)
    }
    schemaElement.textContent = JSON.stringify(homepageSchema)
  }, [homepageSchema])

  useEffect(() => {
    let active = true
    api.blogs()
      .then(({ blogs }) => {
        if (!active) return
        setLatestBlogs((blogs || []).slice(0, 6))
        setBlogsError('')
      })
      .catch(err => {
        if (!active) return
        setBlogsError(err.message || 'Unable to load latest resources')
      })
      .finally(() => {
        if (active) setBlogsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const toggleTheme = () => {
    setTheme(current => {
      const next = current === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      document.documentElement.style.colorScheme = next
      localStorage.setItem('cli-theme', next)
      return next
    })
  }

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <HomepageHeader theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <section className="relative px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.11),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.12),transparent_35%)] dark:[background-image:var(--hero-glow)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <SectionLabel>Practical Cybersecurity Learning Platform</SectionLabel>
              <h1 className="mt-5 max-w-4xl font-space-grotesk text-5xl font-black leading-[0.95] tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
                Learn Cybersecurity Online with Hands-On Labs
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl sm:leading-9">
                Cyber Lab IN provides practical online cybersecurity courses for students, beginners, career switchers and early-stage IT professionals. Learn through guided lessons, secure hands-on labs, real-world security scenarios and clear defensive workflows designed to build useful skills from the beginning.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-4 text-base font-black text-white shadow-xl shadow-slate-950/12 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 dark:focus:ring-offset-slate-950"
                >
                  Explore Cybersecurity Courses
                </Link>
                <Link
                  to="/courses/cybersecurity/cyber-security-essentials"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-6 py-4 text-base font-black text-slate-800 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Start with Cyber Security Essentials
                </Link>
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Cyber Lab IN trust points">
                {trustPoints.map(point => (
                  <li key={point} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-[18px] text-sky-600 dark:text-sky-300">check_circle</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <PlatformVisual />
          </div>
        </section>

        <section id="about" className="border-y border-slate-200 bg-slate-50 px-5 py-16 dark:border-white/10 dark:bg-slate-900 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <SectionLabel>Direct Answer</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">What Is Cyber Lab IN?</h2>
              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
                Cyber Lab IN is a cybersecurity education platform for learners who want structured courses, hands-on labs and practical defensive workflows online.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950">
              <p className="text-xl font-bold leading-8 text-slate-950 dark:text-white">
                Cyber Lab IN is an online learning platform offering practical cybersecurity courses, guided labs and structured learning paths for beginners and aspiring security professionals.
              </p>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                The platform is designed around practical learning: clear concepts, safe lab exercises, real-world security scenarios and defensive workflows that help learners understand what to do and why it matters.
              </p>
            </div>
          </div>
        </section>

        <section id="courses" className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Featured Cybersecurity Courses</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Explore Our Cybersecurity Courses</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Start with beginner-friendly foundations, then move into focused learning paths for web security, SOC work, ethical hacking, cloud, network security and digital investigation.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {courseLinks.map(course => (
                <a
                  key={course.href}
                  href={course.href}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-950/8 dark:border-white/10 dark:bg-slate-900 dark:hover:border-sky-300/40"
                >
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">{course.status}</span>
                  <h3 className="mt-4 font-space-grotesk text-xl font-black text-slate-950 group-hover:text-sky-800 dark:text-white dark:group-hover:text-sky-200">
                    {course.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{course.summary}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
                    View course
                    <span className="material-symbols-outlined text-[18px] transition group-hover:translate-x-1">arrow_forward</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="learning-paths" className="border-y border-slate-200 bg-slate-50 px-5 py-16 dark:border-white/10 dark:bg-slate-900 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Learning Paths</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Choose a Cybersecurity Learning Path</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Cyber Lab IN learning paths connect cybersecurity topics to practical outcomes, helping learners move from awareness to web security, SOC, cloud, network security and digital forensics.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {learningPaths.map(([title, href, copy]) => (
                <a key={href} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg dark:border-white/10 dark:bg-slate-950">
                  <h3 className="font-space-grotesk text-lg font-black text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{copy}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Why Cyber Lab IN</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Why Learn Cybersecurity with Cyber Lab IN?</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Cyber Lab IN focuses on doing, not passive watching: learners study concepts, practise with guided labs and learn how responsible defenders think.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {whyPoints.map(([icon, title, copy]) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
                  <span className="material-symbols-outlined flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                    {icon}
                  </span>
                  <h3 className="mt-5 font-space-grotesk text-xl font-black text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 dark:border-white/10 dark:bg-slate-900 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Platform Flow</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">How Do Cyber Lab IN Courses Work?</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Each Cyber Lab IN course turns a security concept into a practical learning cycle: understand the idea, observe a scenario, complete a guided lab and report the finding.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-4">
              {platformSteps.map(([title, copy], index) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-600 font-space-grotesk text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 font-space-grotesk text-lg font-black text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionLabel>Audience</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Who Can Learn Cybersecurity on Cyber Lab IN?</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Cyber Lab IN is for curious learners who want practical cybersecurity exposure without exaggerated promises or unnecessary complexity.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {audiences.map(audience => (
                <div key={audience} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold leading-6 text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
                  {audience}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 dark:border-white/10 dark:bg-slate-900 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Skills</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Cybersecurity Skills You Can Build</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Learners can build beginner-ready security awareness, web security, defensive security, security operations and infrastructure security foundations through guided practice.
              </p>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-5">
              {skillClusters.map(([title, skills]) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950">
                  <h3 className="font-space-grotesk text-lg font-black text-slate-950 dark:text-white">{title}</h3>
                  <ul className="mt-4 space-y-2">
                    {skills.map(skill => (
                      <li key={skill} className="flex gap-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionLabel>Featured Beginner Course</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Start with Cyber Security Essentials</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                A focused beginner course for learners who want practical cybersecurity foundations before moving into deeper paths.
              </p>
              <a href="/courses/cybersecurity/cyber-security-essentials" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950">
                View Full Course Details
              </a>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {beginnerCourseFacts.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                  <dt className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</dt>
                  <dd className="mt-2 text-base font-bold text-slate-950 dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="instructors" className="border-y border-slate-200 bg-slate-50 px-5 py-16 dark:border-white/10 dark:bg-slate-900 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionLabel>Instructor and Expertise</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Learn from Cybersecurity Practitioners</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Cyber Lab IN courses are connected to practitioner-led cybersecurity education, curriculum design and real-world security workflows.
              </p>
            </div>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950">
              <p className="font-space-grotesk text-2xl font-black text-slate-950 dark:text-white">Arghya Sikdar</p>
              <p className="mt-3 text-base leading-8 text-slate-600 dark:text-slate-300">
                Founder and CEO of Cyber Lab IN, cybersecurity educator and practitioner with experience across cybersecurity, DevSecOps, cloud security, VAPT, digital forensics and practical security training.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
                His profile connects Cyber Lab IN's courses to visible expertise, authored learning paths and practical cybersecurity education.
              </p>
              <a href="/instructors/arghya-sikdar" className="mt-5 inline-flex text-sm font-black text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100">
                View instructor profile
              </a>
            </article>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Evidence and Trust</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Built Around Visible Outcomes</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Cyber Lab IN does not publish invented reviews, fake student counts or unsupported placement claims. Trust is built through structured outcomes, guided labs, clear prerequisites and an instructor-led curriculum.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {['Structured course outcomes', 'Guided cybersecurity labs', 'Certificate verification planned'].map(item => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
              <p><strong className="text-slate-950 dark:text-white">Reviewed by:</strong> Cyber Lab IN editorial and instructor team.</p>
              <p><strong className="text-slate-950 dark:text-white">Last reviewed:</strong> June 11, 2026.</p>
              <p><strong className="text-slate-950 dark:text-white">Course ownership:</strong> Cyber Lab IN courses are published by Cyber Lab IN and connected to instructor-led practical cybersecurity learning paths.</p>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 dark:border-white/10 dark:bg-slate-900 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Career Guidance</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">What Careers Can Cybersecurity Training Support?</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Training can support further study and entry-level preparation, but it does not guarantee employment. Cyber Lab IN helps learners build practical foundations for roles such as:
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {careerRoles.map(role => (
                <span key={role} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="resources" className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Latest Cybersecurity Resources</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Learn from Our Latest Cybersecurity Guides</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Cyber Lab IN resources explain cybersecurity concepts in plain language and connect each guide to practical courses, learning paths and hands-on labs.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {blogsLoading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                  Loading latest resources...
                </div>
              )}
              {!blogsLoading && blogsError && (
                <a href="/blog" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-900 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-100">
                  Latest resources are available on the blog. Open all guides.
                </a>
              )}
              {!blogsLoading && !blogsError && latestBlogs.map(blog => (
                <a key={blog.id || blog.slug} href={`/blog/${blog.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg dark:border-white/10 dark:bg-slate-900">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">{blog.category || 'Cybersecurity Guide'}</p>
                  <h3 className="mt-3 font-space-grotesk text-lg font-black text-slate-950 dark:text-white">{blog.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{blog.excerpt}</p>
                  <div className="mt-5 space-y-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <p>By {blog.authorName || 'Cyber Lab IN'}</p>
                    <p>{formatDate(blog.publishedAt || blog.createdAt)}</p>
                  </div>
                </a>
              ))}
              {!blogsLoading && !blogsError && latestBlogs.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                  Published resources will appear here after editorial review.
                </div>
              )}
            </div>
            <a href="/blog" className="mt-8 inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:text-white dark:hover:bg-white/10">
              Browse all cybersecurity resources
            </a>
          </div>
        </section>

        <section id="faq" className="border-y border-slate-200 bg-slate-50 px-5 py-16 dark:border-white/10 dark:bg-slate-900 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Frequently Asked Questions About Cybersecurity Courses</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
              These answers explain how Cyber Lab IN supports beginner-friendly cybersecurity learning, hands-on labs and responsible career preparation.
            </p>
            <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-slate-950">
              {faqs.map(faq => (
                <details key={faq.question} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-space-grotesk text-lg font-black text-slate-950 dark:text-white">
                    {faq.question}
                    <span className="material-symbols-outlined text-[20px] transition group-open:rotate-180">expand_more</span>
                  </summary>
                  <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/12 dark:border-white/10 dark:bg-slate-900 sm:p-8 lg:grid-cols-[1fr_0.9fr] lg:p-10">
            <div>
              <SectionLabel>Start Building Your Cybersecurity Skills</SectionLabel>
              <h2 className="mt-4 max-w-3xl font-space-grotesk text-4xl font-black tracking-tight sm:text-5xl">Start Building Your Cybersecurity Skills</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Explore all courses or begin with Cyber Security Essentials to build practical, beginner-friendly cybersecurity foundations.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="/courses" className="inline-flex justify-center rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100">
                  Explore All Courses
                </a>
                <a href="/courses/cybersecurity/cyber-security-essentials" className="inline-flex justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10">
                  Start with Cyber Security Essentials
                </a>
              </div>
            </div>
            <LeadCaptureForm
              dark
              source="landing_form"
              title="Request course guidance"
              defaultMessage="I would like guidance on Cyber Lab IN cybersecurity courses."
            />
          </div>
        </section>
      </main>
      <HomepageFooter theme={theme} />
      <FaqChatbot />
    </div>
  )
}
