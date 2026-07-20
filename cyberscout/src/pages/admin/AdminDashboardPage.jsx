import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import DashboardMetric from '../../components/ui/DashboardMetric'
import { api } from '../../lib/api'
import SiteIcon from '../../components/ui/SiteIcon'
import { adminNavigation } from './adminNavigation'

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError('')
    api.dashboard('admin')
      .then(({ dashboard }) => setDashboard(dashboard))
      .catch(err => setError(err.message || 'Unable to load admin dashboard'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const analytics = dashboard?.analytics || {}

  return (
    <StaffDashboardShell
      title="Admin Dashboard"
      subtitle="Manage users, courses, enrollments, payments, live monitoring, platform analytics, and audit activity."
      loginPath="/admin/login"
      navigation={adminNavigation}
    >
      {error && <div role="alert" className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={load} className="font-bold underline">Retry</button></div>}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500" role="status">Loading admin systems...</div>
      ) : !dashboard ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500">Admin dashboard data is unavailable.</div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/courses?create=1" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
              <SiteIcon name="add" size={17} /> Create Course
            </Link>
            <Link to="/admin/live-classes?create=1" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-100">
              <SiteIcon name="calendar" size={17} /> Schedule Live Class
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardMetric label="Users" value={analytics.users ?? 0} helper="Role-aware accounts" />
            <DashboardMetric label="Courses" value={analytics.courses ?? 0} helper="Published and draft" />
            <DashboardMetric label="Enrollments" value={analytics.enrollments ?? 0} helper="Active course access" />
            <DashboardMetric label="Unique visitors" value={analytics.visitors?.totalUniqueVisitors ?? 0} helper="Privacy-conscious total" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardMetric label="Visitors today" value={analytics.visitors?.visitorsToday ?? 0} helper="First seen today" />
            <DashboardMetric label="Visitors this week" value={analytics.visitors?.visitorsThisWeek ?? 0} helper="First seen in 7 days" />
            <DashboardMetric label="Visitors this month" value={analytics.visitors?.visitorsThisMonth ?? 0} helper="First seen in 30 days" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-space-grotesk text-lg font-bold">Users</h2>
              <div className="mt-4 space-y-3">
                {dashboard.users.slice(0, 8).map(user => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">{user.role}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-space-grotesk text-lg font-bold">Courses</h2>
              <div className="mt-4 space-y-3">
                {dashboard.courses.map(course => (
                  <div key={course.id} className="rounded-lg border border-slate-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{course.title}</p>
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-600">{course.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{course.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-space-grotesk text-lg font-bold">Recent Audit Logs</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {dashboard.auditLogs.slice(0, 10).map(log => (
                <div key={log.id} className="rounded-lg bg-slate-50 px-4 py-3">
                  <p className="font-semibold text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.actorId} - {log.createdAt}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </StaffDashboardShell>
  )
}
