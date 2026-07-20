import { useEffect, useState } from 'react'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import DashboardMetric from '../../components/ui/DashboardMetric'
import { api } from '../../lib/api'
import { adminNavigation } from './adminNavigation'

export default function AdminCysenseiPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboard('admin').then(result => setDashboard(result.dashboard)).catch(err => setError(err.message || 'Cysensei usage could not be loaded'))
  }, [])

  return (
    <StaffDashboardShell title="Cysensei" subtitle="Monitor course-bound tutor usage without exposing learner messages across courses." loginPath="/admin/login" navigation={adminNavigation}>
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!dashboard ? <div className="border border-slate-200 bg-white p-8 text-sm text-slate-500" role="status">Loading Cysensei usage...</div> : <div className="space-y-6"><div className="grid gap-4 md:grid-cols-3"><DashboardMetric label="Messages" value={dashboard.analytics.aiMessages ?? 0} helper="Database-recorded tutor messages" /><DashboardMetric label="Courses" value={dashboard.courses.length} helper="Course knowledge boundaries" /><DashboardMetric label="Audit events" value={dashboard.auditLogs.length} helper="Recent recorded activity" /></div><section className="border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-space-grotesk text-lg font-bold">Course isolation remains mandatory</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Cysensei sessions, messages and retrieval remain tied to a specific user and course. Add course material through Modules and Lessons before learners use that course as a tutor context.</p></section></div>}
    </StaffDashboardShell>
  )
}
