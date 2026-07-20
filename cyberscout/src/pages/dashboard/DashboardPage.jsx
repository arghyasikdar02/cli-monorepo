import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import ProgressBar from '../../components/ui/ProgressBar'
import CourseCard from '../../components/ui/CourseCard'
import StatCard from '../../components/ui/StatCard'
import { useAppStore } from '../../store/useAppStore'
import { api } from '../../lib/api'
import SiteIcon from '../../components/ui/SiteIcon'

const quickActions = [
  { icon: 'school', label: 'Browse Courses', desc: 'Find practical cybersecurity courses.', to: '/learn/courses', dark: false },
  { icon: 'smart_toy', label: 'Ask Cysensei', desc: 'Open course-specific Cysensei support.', to: '/ai-tutor', dark: true },
  { icon: 'video_chat', label: 'Live Classes', desc: 'See sessions for enrolled courses.', to: '/live-classes', dark: false },
  { icon: 'account_circle', label: 'My Profile', desc: 'Manage your account.', to: '/profile', dark: false },
]

function formatDateTime(value) {
  if (!value) return 'Current session'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Current session' : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default function DashboardPage() {
  const { user } = useAppStore()
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.dashboard('student')
      .then(({ dashboard }) => {
        if (!active) return
        setDashboard(dashboard)
        setError('')
      })
      .catch(err => {
        if (active) setError(err.message || 'Unable to load dashboard')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const summary = dashboard?.summary || {}
  const activeCourse = dashboard?.activeCourse
  const enrolledCourses = dashboard?.enrolledCourses || []
  const recommendedCourses = dashboard?.recommendedCourses || []

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-space-grotesk text-3xl font-black text-primary">
              Welcome, {user?.name ?? 'Learner'}
            </h1>
            <p className="text-on-surface-variant mt-1">Your courses, progress, and resources are loaded from your account.</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Login</p>
            <p className="text-sm font-medium text-slate-700">{formatDateTime(user?.lastLogin)}</p>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500 shadow-card">Loading your courses and progress...</div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Enrolled" value={summary.enrolledCourses ?? 0} unit="Courses" />
              <StatCard label="Completed" value={summary.completedCourses ?? 0} unit="Courses" />
              <StatCard label="Average" value={summary.averageProgress ?? 0} unit="% Progress" />
              <StatCard label="Resources" value={summary.materialsAvailable ?? 0} unit="Available" />
            </div>

            {activeCourse ? (
              <section className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
                <div className="relative h-48 bg-primary-container">
                  <div className="absolute inset-0 bg-slate-900/35 p-6 flex flex-col justify-end">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <span className="bg-violet-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block">
                          Continue Learning
                        </span>
                        <h3 className="text-white font-space-grotesk text-xl font-semibold leading-tight">
                          {activeCourse.title}
                        </h3>
                      </div>
                      <Link
                        to={`/learn/courses/${activeCourse.id}`}
                        className="bg-white text-slate-900 px-5 py-2 rounded-lg font-bold font-space-grotesk flex items-center justify-center gap-2 hover:bg-violet-50 transition-colors shadow-lg flex-shrink-0"
                      >
                        <SiteIcon name="play_arrow" size={18} />
                        Open Course
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">
                      {activeCourse.moduleCount} modules · {activeCourse.lessonCount} lessons · {activeCourse.materialCount} resources
                    </span>
                    <span className="text-sm font-bold text-violet-600">{activeCourse.progress}%</span>
                  </div>
                  <ProgressBar value={activeCourse.progress} glow />
                </div>
              </section>
            ) : (
              <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
                <SiteIcon name="school" size={48} className="mx-auto mb-3 text-slate-300" />
                <h3 className="font-space-grotesk text-xl font-black text-primary">No courses enrolled yet</h3>
                <p className="mt-2 text-sm text-on-surface-variant">Browse the catalog and enroll to unlock course materials.</p>
                <Link to="/learn/courses" className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-space-grotesk text-sm font-bold text-white">
                  Browse Courses
                </Link>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-space-grotesk text-lg font-bold text-primary">My Courses</h4>
                <Link to="/learn/courses" className="text-violet-600 text-sm font-bold hover:underline">View Catalog</Link>
              </div>
              {enrolledCourses.length ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {enrolledCourses.map(course => <CourseCard key={course.id} course={course} />)}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-card">Enroll in a course to see it here.</div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-space-grotesk text-lg font-bold text-primary">Available Courses</h4>
                <Link to="/learn/courses" className="text-violet-600 text-sm font-bold hover:underline">View All</Link>
              </div>
              {recommendedCourses.length ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendedCourses.map(course => <CourseCard key={course.id} course={course} />)}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-card">You are enrolled in every currently published course.</div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-space-grotesk text-lg font-bold text-primary">Upcoming Live Classes</h4>
                <Link to="/live-classes" className="text-violet-600 text-sm font-bold hover:underline">Full Schedule</Link>
              </div>
              {dashboard.liveClasses?.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {dashboard.liveClasses.map(liveClass => (
                    <article key={liveClass.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                      <p className="font-space-grotesk font-bold text-primary">{liveClass.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{liveClass.course_title}</p>
                      <time className="mt-3 block text-xs font-bold uppercase tracking-widest text-violet-600" dateTime={liveClass.scheduled_start}>{formatDateTime(liveClass.scheduled_start)}</time>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-card">No upcoming live classes are scheduled for your enrolled courses.</div>
              )}
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {quickActions.map(({ icon, label, desc, to, dark }) => (
                <Link
                  key={to}
                  to={to}
                  className={`group p-5 rounded-xl border transition-all text-left block ${
                    dark
                      ? 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                      : 'bg-white border-slate-200 shadow-card hover:border-violet-200 hover:shadow-card-hover'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${
                    dark ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-900'
                  }`}>
                    <SiteIcon name={icon} size={20} />
                  </div>
                  <h6 className={`font-space-grotesk font-bold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>{label}</h6>
                  <p className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
                </Link>
              ))}
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}
