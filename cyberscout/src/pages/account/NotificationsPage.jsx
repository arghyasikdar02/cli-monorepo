import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { api } from '../../lib/api'

export default function NotificationsPage() {
  const [liveClasses, setLiveClasses] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.dashboard('student')
      .then(({ dashboard }) => active && setLiveClasses(dashboard.liveClasses || []))
      .catch(err => active && setError(err.message || 'Course updates are unavailable'))
    return () => { active = false }
  }, [])

  return (
    <AppShell>
      <main className="max-w-[760px] mx-auto px-8 py-8">
        <div className="mb-7"><h1 className="font-space-grotesk text-2xl font-black text-primary">Course updates</h1><p className="mt-1 text-sm text-on-surface-variant">Scheduled sessions for your enrolled courses. No promotional or invented notifications are shown.</p></div>
        {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
        {!error && liveClasses.length === 0 && <div className="border border-slate-200 bg-white p-8 text-center"><h2 className="font-space-grotesk text-lg font-bold text-primary">No upcoming updates</h2><p className="mt-2 text-sm text-slate-500">New live classes will appear here when an instructor schedules them for your enrolled course and batch.</p><Link to="/live-classes" className="mt-5 inline-flex text-sm font-bold text-secondary hover:underline">Check live classes</Link></div>}
        {liveClasses.length > 0 && <div className="space-y-3">{liveClasses.map(item => <article key={item.id} className="border border-slate-200 bg-white p-5"><p className="font-space-grotesk font-bold text-primary">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.course_title}</p><time className="mt-3 block text-xs font-bold uppercase tracking-widest text-secondary" dateTime={item.scheduled_start}>{item.scheduled_start}</time></article>)}</div>}
      </main>
    </AppShell>
  )
}
