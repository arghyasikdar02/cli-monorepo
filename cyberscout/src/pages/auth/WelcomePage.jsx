import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'
import LeadCaptureForm from '../../components/ui/LeadCaptureForm'
import FaqChatbot from '../../components/ui/FaqChatbot'

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://cyberlabin.com').replace(/\/+$/, '')
const configuredFee = import.meta.env.VITE_CSE_COURSE_FEE ?? '0'
const courseFee = Number(configuredFee)
const feeLabel = Number.isFinite(courseFee) && courseFee > 0 ? `INR ${courseFee.toLocaleString('en-IN')}` : 'Free'

const navItems = [
  { href: '#why', label: 'Why This Course' },
  { href: '#learn', label: 'What You Learn' },
  { href: '#labs', label: 'Labs' },
  { href: '#faq', label: 'FAQ' },
]

const navLinks = [
  { to: '/courses', label: 'Courses' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
]
const loginDashboardHref = '/auth?mode=login&redirect=%2Fdashboard'
const loginCourseHref = '/auth?mode=login&redirect=%2Flearn%2Fcourses%2Fc002'

const trustBadges = ['Beginner Friendly', 'Hands-On Labs', 'Certificate of Completion', 'Online Mode']

const cybersecurityTopics = [
  'Network security',
  'Phishing prevention',
  'Web security',
  'Account protection',
  'Ethical hacking',
  'Digital forensics',
  'Security operations',
]

const audiences = [
  ['Students exploring cybersecurity', 'A clear first step before deeper security specialisation.'],
  ['IT beginners', 'Build practical security language and safe defensive habits.'],
  ['Career switchers', 'Understand the work before committing to a cyber career path.'],
  ['Non-technical learners', 'Learn security concepts without getting buried in jargon.'],
  ['Junior IT staff', 'Add phishing, web, account, and reporting skills to daily work.'],
  ['Certification learners', 'Prepare for cybersecurity certification courses with practical context.'],
]

const learnItems = [
  ['shield', 'Cybersecurity fundamentals'],
  ['mark_email_read', 'Phishing prevention'],
  ['travel_explore', 'Digital footprint risks'],
  ['language', 'Suspicious emails, links, and domains'],
  ['admin_panel_settings', 'Account hardening'],
  ['router', 'Network security basics'],
  ['sync_alt', 'Web request-response basics'],
  ['input', 'Unsafe input'],
  ['database', 'SQL Injection awareness'],
  ['code_blocks', 'XSS awareness'],
  ['cookie', 'Session security'],
  ['settings_alert', 'Misconfiguration risks'],
  ['assignment', 'Defensive reporting'],
]

const labItems = [
  ['Digital footprint review', 'Map what attackers can learn from public information and reduce unnecessary exposure.'],
  ['Phishing indicator analysis', 'Review sender, link, urgency, attachment, and domain clues safely.'],
  ['Account hardening checklist', 'Apply stronger passwords, MFA, recovery, update, and backup practices.'],
  ['Web request-response practice', 'Understand how browsers and websites exchange requests and responses.'],
  ['Unsafe input observation', 'Spot where untrusted input can create risk in web applications.'],
  ['SQL Injection awareness lab', 'Learn what SQL Injection is at a foundation level without unsafe exploitation.'],
  ['XSS awareness lab', 'Understand how reflected content can become a browser-side risk.'],
  ['Session security basics', 'Explore cookies, sessions, logout behaviour, and account safety.'],
  ['Misconfiguration review', 'Recognise risky defaults, exposed panels, and weak access settings.'],
  ['Defensive reporting practice', 'Turn observations into clear, responsible findings and next steps.'],
]

const careerPaths = [
  'Ethical hacking',
  'SOC analysis',
  'Network security',
  'Digital forensics',
  'Cloud security',
  'AI-powered security',
]

const outcomes = [
  'Explain cybersecurity in simple terms',
  'Identify phishing and scam indicators',
  'Apply account hardening practices',
  'Understand beginner web security risks',
  'Recognise unsafe input patterns',
  'Describe SQL Injection and XSS at foundation level',
  'Understand network security basics',
  'Follow basic cyber investigation structure',
  'Communicate findings through defensive reporting',
]

const faqs = [
  {
    question: 'What is the best way to learn cybersecurity for beginners?',
    answer:
      'The best way to learn cybersecurity as a beginner is to combine clear explanations with guided practice. This course teaches core ideas and then reinforces them through hands-on labs, phishing analysis, web security basics, and defensive reporting.',
  },
  {
    question: 'Is this cybersecurity course suitable for non-technical learners?',
    answer:
      'Yes. Cyber Security Essentials is built for students, IT beginners, career switchers, and non-technical learners who have basic computer and internet knowledge and want a practical introduction to cybersecurity.',
  },
  {
    question: 'Does the course include hands-on cybersecurity labs?',
    answer:
      'Yes. The course includes guided labs for digital footprint review, phishing indicators, account hardening, web request-response behaviour, unsafe input, SQL Injection awareness, XSS awareness, session security, misconfiguration review, and defensive reporting.',
  },
  {
    question: 'Will this course help me prepare for a cybersecurity career?',
    answer:
      'Yes. The course builds foundational confidence for paths such as ethical hacking, SOC analysis, network security, digital forensics, cloud security, and AI-powered security. It is a starting point, not a substitute for advanced professional experience.',
  },
]

const courseDetails = [
  ['Course name', 'Cyber Security Essentials'],
  ['Level', 'Beginner'],
  ['Mode', 'Online'],
  ['Duration', '7 days'],
  ['Credential', 'Certificate of Completion'],
  ['Prerequisites', 'Basic computer and internet knowledge'],
  ['Instructor', 'Arghya Sikdar'],
  ['Fee', feeLabel],
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

function SectionLabel({ children }) {
  return (
    <p className="font-space-grotesk text-xs font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
      {children}
    </p>
  )
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white/75 text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 dark:focus:ring-offset-slate-950"
    >
      <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
    </button>
  )
}

function PremiumLearningVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[620px]" aria-label="Cyber Security Essentials learning journey preview">
      <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_30px_90px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_30px_90px_rgba(0,0,0,0.40)]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-space-grotesk text-sm font-bold text-slate-950 dark:text-white">Guided Lab Workspace</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cyber Security Essentials</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
              Online
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-space-grotesk text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Lab Queue
                </p>
                <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">Day 3 of 7</span>
              </div>
              {[
                ['Phishing indicator analysis', 'Inspect sender and domain clues'],
                ['Unsafe input observation', 'Trace input to response behaviour'],
                ['Defensive report', 'Summarise risk and recommendation'],
              ].map(([title, label]) => (
                <div key={title} className="mb-3 rounded-xl border border-slate-100 bg-slate-50 p-3 last:mb-0 dark:border-white/10 dark:bg-slate-950/80">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
                    <span className="h-2 w-2 rounded-full bg-gradient-to-b from-sky-400 to-violet-500" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              ))}
            </section>

            <aside className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                <p className="font-space-grotesk text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Skill Progress
                </p>
                <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">Web security basics</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Next: session security</p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_85%_70%,rgba(124,58,237,0.12),transparent_35%)]" />
                <div className="relative">
                  <p className="font-space-grotesk text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Secure Learning Path
                  </p>
                  <div className="mt-5 grid grid-cols-3 items-center gap-2" aria-hidden="true">
                    {[
                      ['shield', 'Learn'],
                      ['hub', 'Practice'],
                      ['gpp_good', 'Defend'],
                    ].map(([icon, label], index) => (
                      <div key={label} className="text-center">
                        <span className={`material-symbols-outlined mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-[22px] ${
                          index === 1
                            ? 'bg-gradient-to-br from-sky-400 to-violet-500 text-white shadow-lg shadow-sky-500/20'
                            : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200'
                        }`}>
                          {icon}
                        </span>
                        <p className="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full w-[74%] rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500" />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

function IconCard({ icon, title, children }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900 dark:hover:border-white/20">
      <span className="material-symbols-outlined mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[22px] text-sky-700 ring-1 ring-sky-100 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-300/10">
        {icon}
      </span>
      <h3 className="font-space-grotesk text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
      {children && <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{children}</p>}
    </article>
  )
}

export default function WelcomePage() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [scrolled, setScrolled] = useState(false)

  const schema = useMemo(() => {
    const pageUrl = `${siteUrl}/`
    const courseUrl = `${siteUrl}/courses/cybersecurity/cyber-security-essentials`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
          name: 'Cyber Lab IN',
          url: siteUrl,
          logo: `${siteUrl}/brand/cyber-lab-in-full-light.png`,
        },
        {
          '@type': 'WebPage',
          '@id': `${pageUrl}#webpage`,
          url: pageUrl,
          name: 'Cybersecurity Course Online with Hands-On Labs',
          description:
            'Join a cybersecurity certification course with guided labs, phishing practice, web security basics, and beginner-friendly cyber training.',
          isPartOf: { '@id': `${siteUrl}/#organization` },
          about: { '@id': `${courseUrl}#course` },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${pageUrl}#breadcrumbs`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
            { '@type': 'ListItem', position: 2, name: 'Courses', item: `${siteUrl}/courses` },
            { '@type': 'ListItem', position: 3, name: 'Cybersecurity', item: `${siteUrl}/courses/cybersecurity` },
            { '@type': 'ListItem', position: 4, name: 'Cyber Security Essentials', item: courseUrl },
          ],
        },
        {
          '@type': 'Course',
          '@id': `${courseUrl}#course`,
          name: 'Cyber Security Essentials',
          description:
            'Beginner-friendly cybersecurity course online with guided labs, phishing analysis, web security practice, account hardening, and defensive reporting.',
          educationalLevel: 'Beginner',
          educationalCredentialAwarded: 'Certificate of Completion',
          coursePrerequisites: 'Basic computer and internet knowledge',
          provider: { '@id': `${siteUrl}/#organization` },
          instructor: {
            '@type': 'Person',
            name: 'Arghya Sikdar',
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: Number.isFinite(courseFee) ? String(courseFee) : '0',
            availability: 'https://schema.org/InStock',
            url: courseUrl,
          },
          hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'Online',
            courseWorkload: 'P7D',
          },
        },
        {
          '@type': 'FAQPage',
          '@id': `${pageUrl}#faq`,
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    }
  }, [])

  useEffect(() => {
    const title = 'Cybersecurity Course Online with Hands-On Labs'
    const description =
      'Join a cybersecurity certification course with guided labs, phishing practice, web security basics, and beginner-friendly cyber training.'
    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: 'Learn Cybersecurity by Doing, Not Just Watching' })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content:
        'Build real cybersecurity confidence through guided labs, phishing analysis, web security practice, SOC-style workflows, and beginner-friendly training.',
    })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: `${siteUrl}/` })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `${siteUrl}/`)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    document.documentElement.style.colorScheme = nextTheme
    localStorage.setItem('cli-theme', nextTheme)
  }

  return (
    <div className="min-h-screen scroll-smooth bg-white text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-slate-200 bg-white/85 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85'
            : 'border-transparent bg-white/70 backdrop-blur-md dark:bg-slate-950/70'
        }`}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10" aria-label="Primary navigation">
          <Link to="/" className="rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
            <CLILogo variant="full" tone={theme === 'dark' ? 'dark' : 'light'} size={150} />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-300 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-300 dark:hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Link
              to={loginDashboardHref}
              className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-offset-slate-950"
            >
              Start Learning
            </Link>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="relative overflow-hidden px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 lg:pt-16">
          <div className="absolute inset-x-0 top-0 -z-10 h-[700px] bg-[radial-gradient(circle_at_20%_8%,rgba(14,165,233,0.14),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.11),transparent_32%)] dark:bg-[radial-gradient(circle_at_20%_8%,rgba(14,165,233,0.13),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.14),transparent_32%)]" />
          <div className="mx-auto max-w-7xl">
            <nav className="mb-12 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
              <Link to="/" className="font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Home</Link>
              <span>/</span>
              <Link to="/courses" className="font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Courses</Link>
              <span>/</span>
              <Link to="/courses/cybersecurity" className="font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Cybersecurity</Link>
              <span>/</span>
              <span>Cyber Security Essentials</span>
            </nav>

            <div className="grid items-center gap-14 lg:grid-cols-[0.96fr_1.04fr]">
              <div className="max-w-3xl">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-b from-sky-400 to-violet-500" />
                  Learn by doing, not just watching
                </div>

                <h1 className="font-space-grotesk text-4xl font-black leading-[1.03] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
                  Cyber Security Essentials Course with Hands-On Labs
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
                  Cyber Security Essentials is a beginner-friendly cybersecurity course online for students, IT beginners, career switchers, and early-stage professionals who want practical security skills through guided labs, phishing analysis, web security practice, and real-world defensive thinking.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={loginDashboardHref}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-offset-slate-950"
                  >
                    Start Learning
                  </Link>
                  <a
                    href="#labs"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    View Course Labs
                  </a>
                </div>

                <ul className="mt-8 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2 dark:text-slate-300">
                  {trustBadges.map((item) => (
                    <li key={item} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                      <span className="material-symbols-outlined text-[18px] text-sky-600 dark:text-sky-300" aria-hidden="true">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <PremiumLearningVisual />
            </div>
          </div>
        </section>

        <section id="why" className="border-y border-slate-200 bg-slate-50 px-5 py-20 sm:px-8 lg:px-10 dark:border-white/10 dark:bg-slate-900/40">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionLabel>Why Choose This Course</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                You do not just watch cybersecurity. You practise it.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              <p>
                Learners practise cybersecurity through guided labs, real-world scenarios, phishing indicators, unsafe input, web request-response behaviour, and defender-style thinking.
              </p>
              <p>
                The course is designed to turn abstract security concepts into repeatable habits: observe carefully, verify safely, identify risk, document evidence, and communicate clear defensive recommendations.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div>
              <SectionLabel>What Is Cybersecurity?</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                A simple definition for beginners.
              </h2>
            </div>
            <div>
              <p className="text-xl leading-9 text-slate-700 dark:text-slate-300">
                Cybersecurity is the practice of protecting systems, accounts, networks, websites, and digital information from attacks, misuse, and unauthorised access.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {cybersecurityTopics.map((topic) => (
                  <span key={topic} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-5 py-24 sm:px-8 lg:px-10 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Who This Course Is For</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Built for learners who want a practical first step.
              </h2>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {audiences.map(([title, description]) => (
                <IconCard key={title} icon="person_search" title={title}>{description}</IconCard>
              ))}
            </div>
          </div>
        </section>

        <section id="learn" className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>What You Will Learn</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Cybersecurity foundations with web, phishing, and defensive reporting practice.
              </h2>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {learnItems.map(([icon, title]) => (
                <IconCard key={title} icon={icon} title={title} />
              ))}
            </div>
          </div>
        </section>

        <section id="labs" className="border-y border-slate-200 bg-slate-50 px-5 py-24 sm:px-8 lg:px-10 dark:border-white/10 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Practical Cybersecurity Labs</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Premium guided labs without unsafe offensive infrastructure.
              </h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {labItems.map(([title, description], index) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 font-space-grotesk text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-space-grotesk text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <SectionLabel>Course Details</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Everything visible before you enroll.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                The fee is configurable from the frontend environment so launch, cohort, and paid pricing can be changed without editing the page copy.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {courseDetails.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 font-space-grotesk text-lg font-bold text-slate-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-5 py-24 text-white sm:px-8 lg:px-10 dark:bg-white dark:text-slate-950">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionLabel>Career Value</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">
                Build a foundation for serious cybersecurity paths.
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-300 dark:text-slate-600">
                This course helps learners understand the language, habits, and defensive thinking that support future study in technical cybersecurity areas.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {careerPaths.map((path) => (
                <div key={path} className="rounded-2xl border border-white/10 bg-white/5 p-5 dark:border-slate-200 dark:bg-slate-50">
                  <span className="material-symbols-outlined text-sky-300 dark:text-sky-700">trending_up</span>
                  <p className="mt-3 font-space-grotesk text-lg font-bold">{path}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Course Outcomes</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                What learners should be able to do after the course.
              </h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {outcomes.map((outcome) => (
                <div key={outcome} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                  <span className="material-symbols-outlined shrink-0 text-[20px] text-emerald-600 dark:text-emerald-300">check_circle</span>
                  <p className="text-sm font-semibold leading-7 text-slate-700 dark:text-slate-200">{outcome}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-y border-slate-200 bg-slate-50 px-5 py-24 sm:px-8 lg:px-10 dark:border-white/10 dark:bg-slate-900/40">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Clear answers for beginner learners.
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:border-sky-200 dark:border-white/10 dark:bg-slate-900">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-space-grotesk text-lg font-bold text-slate-950 dark:text-white">
                    {faq.question}
                    <span className="material-symbols-outlined text-slate-400 transition group-open:rotate-180">expand_more</span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:px-10 dark:border-white/10 dark:bg-slate-900">
            <h2 className="font-space-grotesk text-4xl font-black tracking-tight text-slate-950 sm:text-6xl dark:text-white">
              Start Learning Cybersecurity Online
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Begin your cybersecurity learning journey with guided labs, practical scenarios, and clear explanations.
            </p>
            <Link
              to={loginCourseHref}
              className="mt-9 inline-flex items-center justify-center rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Enroll Now
            </Link>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <LeadCaptureForm source="landing_form" title="Questions before enrolling?" defaultMessage="I want guidance about Cyber Security Essentials." />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-5 py-10 sm:px-8 lg:px-10 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <CLILogo variant="full" tone={theme === 'dark' ? 'dark' : 'light'} size={140} />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Cyber Lab IN. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {navLinks.map((item) => (
              <Link key={item.to} to={item.to} className="hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:hover:text-white">
                {item.label}
              </Link>
            ))}
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:hover:text-white">
                {item.label}
              </a>
            ))}
            <a href="mailto:hello@cyberlab.in" className="hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
      <FaqChatbot />
    </div>
  )
}
