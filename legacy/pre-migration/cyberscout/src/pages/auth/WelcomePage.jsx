import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'

const navItems = [
  { href: '#courses', label: 'Courses' },
  { href: '#labs', label: 'Labs' },
  { href: '#why-cli', label: 'Why CLI' },
  { href: '#roadmap', label: 'Roadmap' },
]

const trustItems = ['Learn by Doing', 'Guided Practice', 'Welcoming for Beginners', 'Built for Confidence']

const problemItems = [
  'Months of videos can still leave learners unsure what to do next.',
  'Slides and certificates do not always translate into problem-solving confidence.',
  'Cybersecurity concepts make more sense when learners can explore them safely.',
  'Real progress comes from asking questions, practicing, and understanding why it matters.',
]

const courses = [
  {
    title: 'Introduction to Cyber Security',
    description:
      'A 7-day foundation course for non-technical learners covering digital footprint audits, scam psychology, phishing indicators, account hardening, and everyday cyber safety habits.',
    tags: ['Beginner', 'Labs', 'Certificate'],
  },
  {
    title: 'Cyber Security Essentials',
    description:
      'A 7-day beginner course covering web request-response basics, unsafe input, SQL Injection, XSS, session security, misconfigurations, and responsible defensive reporting.',
    tags: ['Web Security', 'Labs', 'Hands-On'],
  },
]

const features = [
  {
    icon: 'travel_explore',
    title: 'Guided Exploration',
    description: 'Move through each concept with clear prompts, safe activities, and room to ask questions.',
  },
  {
    icon: 'science',
    title: 'Hands-On Practice',
    description: 'Build confidence by doing practical exercises instead of only watching lessons.',
  },
  {
    icon: 'psychology',
    title: 'Approachable Explanations',
    description: 'Learn technical ideas without oversimplifying the real security thinking behind them.',
  },
  {
    icon: 'hub',
    title: 'Real-World Context',
    description: 'Connect lessons to phishing, account safety, web security, and defensive decisions.',
  },
  {
    icon: 'monitoring',
    title: 'Confidence Building',
    description: 'Know what you understand, what needs practice, and how each skill supports defense.',
  },
  {
    icon: 'workspace_premium',
    title: 'Meaningful Learning',
    description: 'Focus on skills and reasoning that matter beyond completion screens and certificates.',
  },
]

const roadmap = [
  'Learn the Why',
  'Practice the Skill',
  'Explore Real Scenarios',
  'Build Confidence',
  'Defend Better',
]

function getInitialTheme() {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function SectionLabel({ children }) {
  return (
    <p className="font-space-grotesk text-xs font-bold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
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
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white/70 text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 dark:focus:ring-offset-slate-950"
    >
      <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
    </button>
  )
}

function HeroVisual() {
  return (
    <div
      className="relative mx-auto w-full max-w-[620px] rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_30px_90px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_30px_90px_rgba(0,0,0,0.40)]"
      aria-label="Cyber Lab IN learning dashboard preview"
    >
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-space-grotesk text-sm font-bold text-slate-950 dark:text-white">SOC Learning Console</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Investigation workspace</p>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-space-grotesk text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Threat Feed
              </p>
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                Guided
              </span>
            </div>
            {[
              ['Suspicious login', 'Identity signal'],
              ['Phishing domain', 'Web investigation'],
              ['Unusual process', 'Endpoint clue'],
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
                Course Progress
              </p>
              <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">Web threat analysis</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Next lab: phishing infrastructure</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-slate-100 dark:border-white/10">
              <div className="mb-3 flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                <span className="h-2 w-2 rounded-full bg-slate-600" />
              </div>
              <pre className="overflow-hidden text-xs leading-6 text-slate-300">
                <code>{'> analyze --ioc domain\nrisk: elevated\nnext: isolate signals'}</code>
              </pre>
            </div>
          </aside>
        </div>

        <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <p className="font-space-grotesk text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Investigation Panel
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {['Evidence', 'Hypothesis', 'Response'].map((item, index) => (
              <div key={item} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <p className="text-xs text-slate-500 dark:text-slate-400">0{index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-slate-900 dark:hover:border-white/20">
      <div className="mb-6 flex flex-wrap gap-2">
        {course.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="font-space-grotesk text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{course.title}</h3>
      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{course.description}</p>
      <Link
        to="/signup"
        className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition group-hover:gap-3 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-sky-300"
      >
        Start this path
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
      </Link>
    </article>
  )
}

export default function WelcomePage() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [scrolled, setScrolled] = useState(false)

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
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-slate-200 bg-white/82 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/82'
            : 'border-transparent bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10" aria-label="Primary navigation">
          <a href="#top" className="rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
            <CLILogo variant="full" tone={theme === 'dark' ? 'dark' : 'light'} size={150} />
          </a>

          <div className="hidden items-center gap-8 md:flex">
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
              to="/signup"
              className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-offset-slate-950"
            >
              Start Learning
            </Link>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="relative overflow-hidden px-5 pb-24 pt-16 sm:px-8 lg:px-10 lg:pb-32 lg:pt-24">
          <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.16),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(124,58,237,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(124,58,237,0.14),transparent_30%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.96fr_1.04fr]">
            <div className="max-w-3xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-gradient-to-b from-sky-400 to-violet-500" />
                Learn. Practice. Defend.
              </div>

              <h1 className="font-space-grotesk text-5xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
                Cybersecurity is Best Learned by Doing.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
                Cyber Lab IN creates practical, engaging, real-world learning experiences for people who want to build confidence through hands-on practice, guided exploration, and meaningful cybersecurity education.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus:ring-offset-slate-950"
                >
                  Start Learning
                </Link>
                <a
                  href="#courses"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Explore Programs
                </a>
              </div>

              <ul className="mt-8 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2 dark:text-slate-300">
                {trustItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-sky-600 dark:text-sky-300" aria-hidden="true">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <HeroVisual />
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 px-5 py-20 sm:px-8 lg:px-10 dark:border-white/10 dark:bg-slate-900/40">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionLabel>Our Belief</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Watching is not the same as knowing what to do.
              </h2>
            </div>
            <div className="space-y-5">
              <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
                Too often, people spend months watching videos, reading slides, and collecting certificates, only to discover that they still do not feel confident solving real security problems. We want to change that.
              </p>
              <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
                Cybersecurity becomes clearer when learners can investigate, practice, make sense of risk, and understand not just what to do, but why it matters.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {problemItems.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="courses" className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Programs</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Two focused starting points for practical cybersecurity learning.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {courses.map((course) => (
                <CourseCard key={course.title} course={course} />
              ))}
            </div>
          </div>
        </section>

        <section id="labs" className="bg-slate-50 px-5 py-24 sm:px-8 lg:px-10 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Learning Experience</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Practical, engaging, and rooted in the real world.
              </h2>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900 dark:hover:border-white/20"
                >
                  <span className="material-symbols-outlined mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-[22px] text-sky-700 ring-1 ring-slate-200 transition group-hover:bg-sky-50 dark:bg-white/5 dark:text-sky-300 dark:ring-white/10">
                    {feature.icon}
                  </span>
                  <h3 className="font-space-grotesk text-lg font-bold text-slate-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="why-cli" className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div>
              <SectionLabel>Why Cyber Lab IN</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Approachable without being shallow.
              </h2>
            </div>
            <div className="space-y-8 text-lg leading-8 text-slate-600 dark:text-slate-300">
              <p>
                We're passionate about making cybersecurity approachable without oversimplifying it. Curiosity should be encouraged, questions should be welcomed, and learning should feel rewarding, not overwhelming.
              </p>
              <p>
                From cybersecurity fundamentals and security operations to ethical hacking, digital forensics, and AI-powered security, our programs are designed to help learners understand not just what to do, but why it matters.
              </p>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
                <h3 className="font-space-grotesk text-2xl font-bold text-slate-950 dark:text-white">A Community for Better Defenders</h3>
                <p className="mt-4 text-base leading-8">
                  Cyber Lab IN is more than a training platform. It is a growing community of learners, educators, and professionals who share a common goal: becoming better, more capable defenders in an increasingly connected world.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="roadmap" className="border-y border-slate-200 bg-slate-50 px-5 py-24 sm:px-8 lg:px-10 dark:border-white/10 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionLabel>Roadmap</SectionLabel>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                A learning path that turns curiosity into capability.
              </h2>
            </div>
            <ol className="mt-12 grid gap-4 lg:grid-cols-5">
              {roadmap.map((step, index) => (
                <li key={step} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                  <p className="text-sm font-bold text-sky-700 dark:text-sky-300">Step {index + 1}</p>
                  <h3 className="mt-3 font-space-grotesk text-lg font-bold text-slate-950 dark:text-white">{step}</h3>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-slate-950 px-6 py-16 text-center shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:px-10 dark:border-white/10 dark:bg-white dark:text-slate-950">
            <h2 className="font-space-grotesk text-4xl font-black tracking-tight text-white sm:text-6xl dark:text-slate-950">
              Whether You're Curious or Career-Focused,
              <br />
              You're Welcome Here.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 dark:text-slate-600">
              Take your first steps, sharpen your skills, and build confidence through practical cybersecurity learning.
            </p>
            <Link
              to="/signup"
              className="mt-9 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
            >
              Learn. Practice. Defend.
            </Link>
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
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:hover:text-white">
                {item.label}
              </a>
            ))}
            <a href="mailto:hello@cyberlab.in" className="hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:hover:text-white">
              Contact
            </a>
            <a href="https://www.linkedin.com" className="hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:hover:text-white">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
