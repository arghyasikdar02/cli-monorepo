import { useEffect, useState } from 'react'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import DashboardMetric from '../../components/ui/DashboardMetric'
import { api } from '../../lib/api'

export default function InstructorDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboard('instructor')
      .then(({ dashboard }) => setDashboard(dashboard))
      .catch(err => setError(err.message || 'Unable to load instructor dashboard'))
  }, [])

  return (
    <StaffDashboardShell
      title="Instructor Dashboard"
      subtitle="Monitor assigned courses, enrolled students, attendance, quiz results, lab attempts, and course progress."
      loginPath="/instructor/login"
    >
      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!dashboard ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500">Loading instructor workspace...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardMetric label="Assigned courses" value={dashboard.assignedCourses.length} helper="Instructor-owned" />
            <DashboardMetric label="Students" value={dashboard.students.length} helper="Course enrollments" />
            <DashboardMetric label="Attendance" value={dashboard.attendance.length} helper="Live class events" />
            <DashboardMetric label="Lab attempts" value={dashboard.labAttempts.length} helper="Submitted or started" />
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-space-grotesk text-lg font-bold">Assigned Courses</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {dashboard.assignedCourses.map(course => (
                <div key={course.id} className="rounded-lg border border-slate-100 p-4">
                  <p className="font-semibold text-slate-900">{course.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{course.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-space-grotesk text-lg font-bold">Student Progress</h2>
            <div className="mt-4 space-y-3">
              {dashboard.progress.length ? dashboard.progress.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <span className="font-semibold text-slate-900">{item.userId}</span>
                  <span className="text-sm font-bold text-violet-600">{item.completionPercentage}%</span>
                </div>
              )) : <p className="text-sm text-slate-500">No progress records yet.</p>}
            </div>
          </section>
        </div>
      )}
    </StaffDashboardShell>
  )
}
