import { useEffect, useState } from 'react'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import DashboardMetric from '../../components/ui/DashboardMetric'
import { api, API_BASE } from '../../lib/api'
import SiteIcon from '../../components/ui/SiteIcon'

export default function InstructorDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [google, setGoogle] = useState(null)
  const [error, setError] = useState('')
  const [googleError, setGoogleError] = useState('')
  const [liveMessage, setLiveMessage] = useState('')
  const [creatingMeet, setCreatingMeet] = useState('')

  useEffect(() => {
    api.dashboard('instructor')
      .then(({ dashboard }) => setDashboard(dashboard))
      .catch(err => setError(err.message || 'Unable to load instructor dashboard'))
    api.googleStatus()
      .then(({ google }) => setGoogle(google))
      .catch(err => setGoogleError(err.message || 'Unable to load Google Meet status'))
  }, [])

  const connectGoogle = () => {
    window.location.href = `${API_BASE}/api/integrations/google/connect?redirect=${encodeURIComponent('/instructor/dashboard')}`
  }

  const disconnectGoogle = async () => {
    setGoogleError('')
    try {
      const { google } = await api.disconnectGoogle()
      setGoogle(google)
    } catch (err) {
      setGoogleError(err.message || 'Google account could not be disconnected')
    }
  }

  const createMeet = async liveClassId => {
    setCreatingMeet(liveClassId)
    setLiveMessage('')
    try {
      await api.createGoogleMeet(liveClassId)
      const { dashboard: refreshed } = await api.dashboard('instructor')
      setDashboard(refreshed)
      setLiveMessage('Google Meet created for the live class.')
    } catch (err) {
      setLiveMessage(err.message || 'Google Meet could not be created')
    } finally {
      setCreatingMeet('')
    }
  }

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
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-600">Google Meet integration</p>
                <h2 className="mt-1 font-space-grotesk text-lg font-bold">Create live-class meeting spaces</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Connect your Google account to let Cyber Lab IN create Google Meet spaces for scheduled classes. Students join Meet in a new tab while the LMS keeps class details, notes and attendance separate.
                </p>
                {googleError && <p className="mt-2 text-sm font-semibold text-red-600">{googleError}</p>}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm lg:min-w-72">
                <p className="font-bold text-slate-900">{google?.connected ? google.googleEmail : 'No Google account connected'}</p>
                <p className="mt-1 text-slate-500">{google?.meetScopeGranted ? 'Meet creation permission granted' : 'Meet permission not granted yet'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={connectGoogle} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                    {google?.connected ? 'Reauthorize' : 'Connect Google Account'}
                  </button>
                  {google?.connected && (
                    <button type="button" onClick={disconnectGoogle} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white">
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

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
            <h2 className="font-space-grotesk text-lg font-bold">Assigned Live Classes</h2>
            {liveMessage && <p role="status" className="mt-2 text-sm font-semibold text-violet-700">{liveMessage}</p>}
            <div className="mt-4 space-y-3">
              {dashboard.liveClasses?.length ? dashboard.liveClasses.map(liveClass => (
                <div key={liveClass.id} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
                  <div><p className="font-semibold text-slate-900">{liveClass.title}</p><p className="mt-1 text-sm text-slate-500">{liveClass.courseTitle} · {new Date(liveClass.scheduledStart).toLocaleString()}</p></div>
                  <div className="flex flex-wrap gap-2">
                    {!liveClass.meetingUrl && <button type="button" disabled={creatingMeet === liveClass.id} onClick={() => createMeet(liveClass.id)} className="min-h-10 rounded-lg bg-violet-700 px-3 text-sm font-bold text-white disabled:opacity-60">{creatingMeet === liveClass.id ? 'Creating...' : 'Create Google Meet'}</button>}
                    {liveClass.meetingUrl && <a href={liveClass.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white">Start or join Meet<SiteIcon name="external_link" size={15} /></a>}
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">No live classes are assigned.</p>}
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
