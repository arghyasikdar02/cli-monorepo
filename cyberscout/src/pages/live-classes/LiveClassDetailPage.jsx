import { useParams, Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { getLiveClassById } from '../../data/liveClasses'

export default function LiveClassDetailPage() {
  const { id } = useParams()
  const cls = getLiveClassById(id)

  if (!cls) return (
    <AppShell>
      <div className="flex items-center justify-center h-96 text-on-surface-variant">Class not found</div>
    </AppShell>
  )

  const isLive = cls.status === 'live'

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        <Link to="/live-classes" className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Schedule
        </Link>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-xs font-bold font-space-grotesk rounded-full ${isLive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                  {isLive ? '🔴 LIVE NOW' : cls.time}
                </span>
                <span className="text-xs text-slate-400">{cls.duration}</span>
              </div>
              <h1 className="font-space-grotesk text-2xl font-black text-primary mb-3">{cls.title}</h1>
              <p className="text-on-surface-variant leading-relaxed mb-6">{cls.description}</p>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                  {cls.instructor[0]}
                </div>
                <div>
                  <p className="font-space-grotesk font-bold text-on-surface">{cls.instructor}</p>
                  <p className="text-sm text-on-surface-variant">{cls.instructorTitle}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
              <h2 className="font-space-grotesk font-bold text-primary mb-4">What You'll Learn</h2>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                {['Advanced threat detection methodologies', 'Real-world incident response procedures', 'SIEM configuration and alert tuning', 'Post-incident forensic analysis'].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-24 bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
              <div className="text-center py-4">
                <p className="font-space-grotesk text-4xl font-black text-on-surface">{cls.day}</p>
                <p className="text-sm text-on-surface-variant">{cls.month} · {cls.time}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">group</span>
                {cls.attendees.toLocaleString()} enrolled
              </div>
              {isLive ? (
                <Link to={`/live-classes/${cls.id}/session`}
                  className="block w-full text-center py-3.5 bg-green-500 text-white font-space-grotesk font-bold rounded-xl hover:bg-green-600 transition-colors">
                  Join Live Session
                </Link>
              ) : (
                <button className="w-full py-3.5 bg-primary text-white font-space-grotesk font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Set Reminder
                </button>
              )}
              <Link to="/live-classes" className="block w-full text-center py-2.5 border border-slate-200 text-slate-600 text-sm font-space-grotesk rounded-xl hover:bg-slate-50 transition-colors">
                View Full Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
