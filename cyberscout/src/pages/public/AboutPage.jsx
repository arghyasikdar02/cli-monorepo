import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import CLILogo from '../../components/CLILogo'

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Cyber Lab IN'
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/"><CLILogo variant="full" tone="light" size={150} /></Link>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
            <Link to="/courses" className="hover:text-slate-950">Courses</Link>
            <Link to="/blog" className="hover:text-slate-950">Blog</Link>
            <Link to="/login" className="rounded-lg bg-slate-950 px-4 py-2.5 text-white">Login</Link>
          </div>
        </nav>
      </header>
      <main>
        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="font-space-grotesk text-xs font-bold uppercase tracking-[0.18em] text-sky-700">About Cyber Lab IN</p>
            <h1 className="mt-4 max-w-4xl font-space-grotesk text-4xl font-black tracking-tight sm:text-6xl">
              Cybersecurity is best learned by doing.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Cyber Lab IN creates practical, beginner-friendly cybersecurity learning experiences rooted in guided labs, real-world defensive thinking, and clear explanations.
            </p>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
            {[
              ['Mission', 'Help learners build confidence through hands-on practice, guided exploration, and meaningful security learning.'],
              ['What we teach', 'Cybersecurity fundamentals, security operations, ethical hacking foundations, digital forensics, DevSecOps, cloud security, and AI-powered security concepts.'],
              ['Why hands-on matters', 'Passive videos rarely build confidence. Practical labs help learners connect concepts to investigation, reporting, and safer decisions.'],
            ].map(([title, copy]) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-space-grotesk text-xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-space-grotesk text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Founder</p>
              <h2 className="mt-4 font-space-grotesk text-3xl font-black tracking-tight sm:text-5xl">Arghya Sikdar</h2>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-lg leading-8 text-slate-700">
                Arghya Sikdar is an Assistant Professor and cybersecurity educator with experience across cybersecurity, DevSecOps, cloud security, VAPT, digital forensics, and practical security training.
              </p>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Cyber Lab IN is built to make cybersecurity approachable without oversimplifying it. Curiosity is encouraged, questions are welcomed, and learning should feel rewarding, not overwhelming.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
