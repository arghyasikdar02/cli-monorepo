import { useEffect, useState } from 'react'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import DashboardMetric from '../../components/ui/DashboardMetric'
import { api } from '../../lib/api'

export default function OpsDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboard('ops')
      .then(({ dashboard }) => setDashboard(dashboard))
      .catch(err => setError(err.message || 'Unable to load ops dashboard'))
  }, [])

  return (
    <StaffDashboardShell
      title="Lab and Admin Ops Dashboard"
      subtitle="Operate labs, monitor sessions, review attempts, inspect protected document access, and check system health."
      loginPath="/ops/login"
    >
      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!dashboard ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500">Loading ops workspace...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardMetric label="Labs" value={dashboard.labs.length} helper="Course-specific lab catalog" />
            <DashboardMetric label="Lab attempts" value={dashboard.labAttempts.length} helper="Started or submitted" />
            <DashboardMetric label="Live events" value={dashboard.liveClassAttendance.length} helper="Join and leave tracking" />
            <DashboardMetric label="Doc accesses" value={dashboard.documentAccessLogs.length} helper="Protected viewer logs" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-space-grotesk text-lg font-bold">Labs</h2>
              <div className="mt-4 space-y-3">
                {dashboard.labs.map(lab => (
                  <div key={lab.id} className="rounded-lg bg-slate-50 px-4 py-3">
                    <p className="font-semibold text-slate-900">{lab.title}</p>
                    <p className="text-xs text-slate-500">{lab.courseId} - {lab.status}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-space-grotesk text-lg font-bold">System Health</h2>
              <div className="mt-4 rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-100">
                <p>status: {dashboard.systemHealth.status}</p>
                <p>store: {dashboard.systemHealth.store}</p>
                <p>generatedAt: {dashboard.systemHealth.generatedAt}</p>
              </div>
            </section>
          </div>
        </div>
      )}
    </StaffDashboardShell>
  )
}
