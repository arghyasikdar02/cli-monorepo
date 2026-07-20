import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { api } from '../../lib/api'
import SiteIcon from '../../components/ui/SiteIcon'

function formatDate(value) {
  const date = new Date(value)
  return {
    month: date.toLocaleString(undefined, { month: 'short' }).toUpperCase(),
    day: date.toLocaleString(undefined, { day: '2-digit' }),
    time: date.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' }),
  }
}

export default function LiveClassListPage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = () => api.get('/api/live-classes/student/upcoming')
      .then(({ liveClasses }) => {
        if (!active) return
        setClasses(liveClasses)
        setError('')
      })
      .catch(err => {
        if (active) setError(err.message || 'Unable to load live classes')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    load()
    const refresh = window.setInterval(load, 60_000)
    return () => {
      active = false
      window.clearInterval(refresh)
    }
  }, [])

  const available = classes.filter(item => item.canJoin)
  const upcoming = classes.filter(item => !item.canJoin)

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="font-space-grotesk text-3xl font-black text-primary">Live Classes</h1>
          <p className="text-on-surface-variant mt-1">Course-specific sessions for your active enrollments.</p>
        </div>

        {loading && <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500 shadow-card">Loading live classes...</div>}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>}

        {!loading && !error && available.length > 0 && (
          <section className="mb-10">
            <h2 className="font-space-grotesk font-bold text-sm text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Available Now
            </h2>
            <div className="grid gap-4">
              {available.map(cls => <ClassCard key={cls.id} cls={cls} />)}
            </div>
          </section>
        )}

        {!loading && !error && (
          <section>
            <h2 className="font-space-grotesk font-bold text-sm text-slate-400 uppercase tracking-widest mb-4">Upcoming</h2>
            {upcoming.length ? (
              <div className="grid gap-4">
                {upcoming.map(cls => <ClassCard key={cls.id} cls={cls} />)}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-card">
                No live classes are scheduled for your enrolled courses.
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  )
}

function ClassCard({ cls }) {
  const isCancelled = cls.status === 'cancelled'
  const date = formatDate(cls.scheduledStart)
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 flex gap-5 hover:shadow-card-hover transition-shadow">
      <div className="flex-shrink-0 w-20 h-20 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase">{date.month}</span>
        <span className="text-3xl font-black font-space-grotesk text-slate-900">{date.day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-space-grotesk font-bold text-on-surface">{cls.title}</h3>
          {cls.canJoin && <span className="flex-shrink-0 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded">JOIN OPEN</span>}
          {isCancelled && <span className="flex-shrink-0 bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">CANCELLED</span>}
        </div>
        <p className="text-sm text-on-surface-variant mb-1">{cls.courseTitle}</p>
        <p className="text-xs text-slate-400 mb-4">{date.time} · {cls.timezone}</p>
        {!cls.canJoin && cls.denialReason && <p className="mb-4 text-xs font-semibold text-slate-500">{cls.denialReason}</p>}
        <div className="flex items-center justify-end">
          {cls.canJoin ? (
            <Link to={`/live-classes/${cls.id}/session`}
              className="px-4 py-2 bg-green-500 text-white text-xs font-bold font-space-grotesk rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1.5">
              <SiteIcon name="play_arrow" size={16} />
              Join Class
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
