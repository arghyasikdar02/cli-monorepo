import { Link } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'

const features = [
  { icon: 'school', title: '50+ Security Courses', desc: 'From network fundamentals to advanced red teaming.' },
  { icon: 'smart_toy', title: 'AI-Powered Tutor', desc: 'Get instant answers to complex security questions.' },
  { icon: 'military_tech', title: 'Gamified Learning', desc: 'Earn badges, climb the leaderboard, track mastery.' },
  { icon: 'video_chat', title: 'Live Classes', desc: 'Weekly sessions with industry security experts.' },
]

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between">
        <CLILogo variant="mark" size={32} />
        <Link to="/login" className="text-sm font-semibold text-secondary hover:underline">
          Sign In
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 border border-secondary/20 rounded-full mb-8">
          <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          <span className="font-space-grotesk text-[11px] font-bold text-secondary uppercase tracking-widest">
            2,400+ Security Professionals Enrolled
          </span>
        </div>

        <h1 className="font-space-grotesk text-5xl font-black text-primary leading-tight mb-6">
          Master the Craft of<br />
          <span className="text-secondary">Digital Defense</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-xl mb-10">
          The premium cybersecurity learning platform. Hands-on labs, AI tutoring, and a gamified path from script kiddie to master architect.
        </p>

        <div className="flex gap-4">
          <Link
            to="/signup"
            className="px-8 py-4 bg-primary text-white font-space-grotesk font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
          >
            Start Free Training
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 border-2 border-primary text-primary font-space-grotesk font-bold rounded-xl hover:bg-primary/5 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 w-full">
          {features.map(f => (
            <div key={f.icon} className="bg-white p-5 rounded-xl border border-slate-200 shadow-card text-left">
              <span className="material-symbols-outlined text-secondary mb-3 block text-[28px]">{f.icon}</span>
              <h3 className="font-space-grotesk font-bold text-sm text-slate-900 mb-1">{f.title}</h3>
              <p className="text-xs text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
