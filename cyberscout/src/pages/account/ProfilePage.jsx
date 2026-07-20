import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import StatCard from '../../components/ui/StatCard'
import { useAppStore } from '../../store/useAppStore'
import { api } from '../../lib/api'
import SiteIcon from '../../components/ui/SiteIcon'

function formatDate(value) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not recorded' : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date)
}

export default function ProfilePage() {
  const { user } = useAppStore()
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.dashboard('student')
      .then(({ dashboard: next }) => active && setDashboard(next))
      .catch(err => active && setError(err.message || 'Profile statistics are unavailable'))
    return () => { active = false }
  }, [])

  const summary = dashboard?.summary || {}

  return (
    <AppShell>
      <main className="max-w-[1080px] mx-auto px-8 py-8 space-y-6">
        <section className="bg-white border border-slate-200 shadow-card p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-secondary-container flex items-center justify-center text-2xl font-black text-primary" aria-hidden="true">{user?.name?.[0] ?? 'U'}</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Learner account</p>
                <h1 className="mt-1 font-space-grotesk text-2xl font-black text-primary">{user?.name || 'Cyber Lab IN learner'}</h1>
                <p className="mt-1 text-sm text-on-surface-variant">{user?.email}</p>
              </div>
            </div>
            <Link to="/settings" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary"><SiteIcon name="settings" size={18} />Account settings</Link>
          </div>
          <dl className="mt-7 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-3">
            <div><dt className="text-xs font-bold uppercase tracking-widest text-slate-500">Role</dt><dd className="mt-1 text-sm font-semibold capitalize text-slate-800">{user?.role || 'Unassigned'}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-widest text-slate-500">Joined</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{formatDate(user?.createdAt)}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-widest text-slate-500">Last login</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{formatDate(user?.lastLogin)}</dd></div>
          </dl>
        </section>

        {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}

        <section aria-labelledby="learning-record-title">
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Database record</p><h2 id="learning-record-title" className="mt-1 font-space-grotesk text-xl font-bold text-primary">Your learning record</h2></div><Link to="/learn/courses" className="text-sm font-bold text-secondary hover:underline">Open my courses</Link></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Enrolled" value={summary.enrolledCourses ?? 0} unit="Courses" />
            <StatCard label="Completed" value={summary.completedCourses ?? 0} unit="Courses" />
            <StatCard label="Average" value={summary.averageProgress ?? 0} unit="% Progress" />
            <StatCard label="Resources" value={summary.materialsAvailable ?? 0} unit="Available" />
          </div>
        </section>
      </main>
    </AppShell>
  )
}
