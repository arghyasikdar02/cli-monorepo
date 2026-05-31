import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'

const interests = [
  { id: 'safety', icon: 'shield_person', label: 'Personal Cyber Safety' },
  { id: 'scams', icon: 'report', label: 'Scam Awareness' },
  { id: 'phishing', icon: 'mail_lock', label: 'Phishing Detection' },
  { id: 'web', icon: 'language', label: 'Web Security Basics' },
  { id: 'accounts', icon: 'lock', label: 'Account Security' },
  { id: 'reporting', icon: 'assignment', label: 'Defensive Reporting' },
]

const levels = [
  { id: 'beginner', label: 'Beginner', desc: 'New to cybersecurity' },
  { id: 'nontechnical', label: 'Non-Technical Learner', desc: 'Want practical safety skills' },
  { id: 'web-foundation', label: 'Web Foundations', desc: 'Ready to learn browser and web risks' },
]

export default function GettingStartedPage() {
  const [selected, setSelected] = useState([])
  const [level, setLevel] = useState('beginner')
  const navigate = useNavigate()

  const toggleInterest = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-8 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <CLILogo variant="full" tone="light" size={190} className="mx-auto mb-6" />
          <span className="material-symbols-outlined text-[56px] text-secondary mb-4 block">rocket_launch</span>
          <h1 className="font-space-grotesk text-3xl font-bold text-primary mb-2">Welcome to Cyber Lab IN</h1>
          <p className="text-on-surface-variant">Tell us about yourself so we can personalize your learning path.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_24px_80px_rgba(15,23,42,0.10)] p-8 space-y-8">
          <div>
            <h2 className="font-space-grotesk font-bold text-primary mb-4">What interests you?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interests.map(({ id, icon, label }) => {
                const active = selected.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleInterest(id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      active
                        ? 'border-secondary bg-secondary/5 text-secondary'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="font-space-grotesk font-bold text-primary mb-4">Your experience level?</h2>
            <div className="flex flex-col gap-3">
              {levels.map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setLevel(id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                    level === id
                      ? 'border-secondary bg-secondary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <p className={`font-space-grotesk font-semibold text-sm ${level === id ? 'text-secondary' : 'text-slate-900'}`}>
                      {label}
                    </p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  {level === id && <span className="material-symbols-outlined text-secondary">check_circle</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-primary text-white py-4 rounded-xl font-space-grotesk font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/10"
          >
            Enter the Academy →
          </button>
        </div>
      </div>
    </div>
  )
}
