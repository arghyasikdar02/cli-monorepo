import { useEffect, useState } from 'react'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import DashboardMetric from '../../components/ui/DashboardMetric'
import { api } from '../../lib/api'

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboard('admin')
      .then(({ dashboard }) => setDashboard(dashboard))
      .catch(err => setError(err.message || 'Unable to load admin dashboard'))
  }, [])

  const analytics = dashboard?.analytics || {}

  return (
    <StaffDashboardShell
      title="Admin Dashboard"
      subtitle="Manage users, courses, enrollments, payments, live monitoring, platform analytics, and audit activity."
      loginPath="/admin/login"
    >
      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!dashboard ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500">Loading admin systems...</div>
      ) : (
        <div className="space-y-6">
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
