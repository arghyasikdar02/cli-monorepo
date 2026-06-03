import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { liveClasses } from '../../data/liveClasses'

export default function LiveClassListPage() {
  const live = liveClasses.filter(c => c.status === 'live')
  const upcoming = liveClasses.filter(c => c.status === 'upcoming')

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="font-space-grotesk text-3xl font-black text-primary">Live Classes</h1>
          <p className="text-on-surface-variant mt-1">Expert-led sessions on the latest cybersecurity topics.</p>
        </div>

        {live.length > 0 && (
          <section className="mb-10">
            <h2 className="font-space-grotesk font-bold text-sm text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Happening Now
            </h2>
            <div className="grid gap-4">
              {live.map(cls => <ClassCard key={cls.id} cls={cls} />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-space-grotesk font-bold text-sm text-slate-400 uppercase tracking-widest mb-4">Upcoming</h2>
          <div className="grid gap-4">
            {upcoming.map(cls => <ClassCard key={cls.id} cls={cls} />)}
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function ClassCard({ cls }) {
  const isLive = cls.status === 'live'
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 flex gap-5 hover:shadow-card-hover transition-shadow">
      <div className="flex-shrink-0 w-20 h-20 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase">{cls.month}</span>
        <span className="text-3xl font-black font-space-grotesk text-slate-900">{cls.day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-space-grotesk font-bold text-on-surface">{cls.title}</h3>
          {isLive && <span className="flex-shrink-0 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded">LIVE NOW</span>}
        </div>
        <p className="text-sm text-on-surface-variant mb-1">{cls.instructor} · {cls.instructorTitle}</p>
        <p className="text-xs text-slate-400 mb-4 line-clamp-1">{cls.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {!isLive && <span>{cls.time}</span>}
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">group</span>
              {cls.attendees.toLocaleString()} enrolled
            </span>
          </div>
          {isLive ? (
            <Link to={`/live-classes/${cls.id}/session`}
              className="px-4 py-2 bg-green-500 text-white text-xs font-bold font-space-grotesk rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              Join Now
            </Link>
          ) : (
            <Link to={`/live-classes/${cls.id}`}
              className="px-4 py-2 border border-secondary text-secondary text-xs font-bold font-space-grotesk rounded-lg hover:bg-secondary/5 transition-colors">
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
