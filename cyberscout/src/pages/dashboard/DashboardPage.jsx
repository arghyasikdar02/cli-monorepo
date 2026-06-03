import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import ProgressBar from '../../components/ui/ProgressBar'
import CircularProgress from '../../components/ui/CircularProgress'
import StatCard from '../../components/ui/StatCard'
import CourseCard from '../../components/ui/CourseCard'
import LiveClassCard from '../../components/ui/LiveClassCard'
import WeeklyChart from '../../components/ui/WeeklyChart'
import { useAppStore } from '../../store/useAppStore'
import { courses } from '../../data/courses'
import { liveClasses } from '../../data/liveClasses'
import { api } from '../../lib/api'

const quickActions = [
  { icon: 'smart_toy', label: 'Ask AI', desc: 'Instant help with code or theory.', to: '/ai-tutor', dark: true },
  { icon: 'school', label: 'Browse Courses', desc: 'Explore the two-course foundation program.', to: '/courses', dark: false },
  { icon: 'military_tech', label: 'Achievements', desc: 'View your earned credentials.', to: '/achievements', dark: false },
  { icon: 'account_circle', label: 'My Profile', desc: 'Manage account and badges.', to: '/profile', dark: false },
]

export default function DashboardPage() {
  const { user } = useAppStore()
  const [platformDashboard, setPlatformDashboard] = useState(null)
  const [platformError, setPlatformError] = useState('')
  const activeCourse = courses.find(c => c.id === 'c001')
  const recommended = courses.filter(c => !c.enrolled).slice(0, 2)

  useEffect(() => {
    api.dashboard('student')
      .then(({ dashboard }) => setPlatformDashboard(dashboard))
      .catch(err => setPlatformError(err.message || 'Unable to load platform access'))
  }, [])

  if (!activeCourse) return (
    <AppShell>
      <div className="flex items-center justify-center h-96 text-on-surface-variant">No active course.</div>
    </AppShell>
  )

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-8">

        {/* Greeting */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-space-grotesk text-3xl font-black text-primary">
              Good morning, {user?.name ?? 'Scout'}
            </h2>
            <p className="text-on-surface-variant mt-1">Ready to secure the perimeter today?</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Login</p>
            <p className="text-sm font-medium text-slate-700">{user?.lastLogin}</p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left: learning content */}
          <div className="col-span-12 lg:col-span-7 space-y-6">

            {/* Continue Learning */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden group">
              <div className="relative h-48 bg-gradient-to-br from-primary-container to-secondary">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent p-6 flex flex-col justify-end">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="bg-violet-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block">
                        Active Lab
                      </span>
                      <h3 className="text-white font-space-grotesk text-xl font-semibold leading-tight">
                        {activeCourse.title}
                      </h3>
                    </div>
                    <Link
                      to={`/lessons/${activeCourse.id}/${activeCourse.currentLessonId}`}
                      className="bg-white text-slate-900 px-5 py-2 rounded-lg font-bold font-space-grotesk flex items-center gap-2 hover:bg-violet-50 transition-colors shadow-lg flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                      Resume
                    </Link>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">
                    Module {activeCourse.currentModule} of {activeCourse.moduleCount}: Firewall Orchestration
                  </span>
                  <span className="text-sm font-bold text-violet-600">{activeCourse.progress}%</span>
                </div>
                <ProgressBar value={activeCourse.progress} glow />
              </div>
            </div>

            {/* Recommended */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-space-grotesk text-lg font-bold text-primary">Recommended for You</h4>
                <Link to="/courses" className="text-violet-600 text-sm font-bold hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {recommended.map(c => <CourseCard key={c.id} course={c} />)}
              </div>
            </div>
          </div>

          {/* Right: mastery + stats */}
          <div className="col-span-12 lg:col-span-5 space-y-4">

            {/* Mastery */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card flex flex-col items-center text-center">
              <h4 className="font-space-grotesk font-bold text-primary mb-5">Overall Mastery</h4>
              <CircularProgress value={user?.masteryScore ?? 0} />
              <div className="bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5 mt-5 mb-2">
                <span className="text-sm font-bold text-slate-700 font-space-grotesk">Rank: {user?.rank}</span>
              </div>
              <p className="text-sm text-slate-500">
                Only 12 points away from <span className="text-violet-600 font-bold">White Hat</span>
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Enrolled" value={user?.enrolled ?? 0} unit="Courses" />
              <StatCard label="Completed" value={user?.completed ?? 0} unit="Course" />
              <StatCard label="Learning" value={user?.learningHours ?? 0} unit="Hours" />
            </div>

            {/* Weekly activity */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h5 className="font-space-grotesk font-bold text-slate-900">Weekly Activity</h5>
                <span className="material-symbols-outlined text-slate-400">more_horiz</span>
              </div>
              <WeeklyChart />
            </div>
          </div>
        </div>

        {/* Live classes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-space-grotesk text-lg font-bold text-primary">Upcoming Live Classes</h4>
            <Link to="/live-classes" className="text-violet-600 text-sm font-bold hover:underline">Full Schedule</Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
            {liveClasses.map(cls => <LiveClassCard key={cls.id} cls={cls} />)}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h4 className="font-space-grotesk text-lg font-bold text-primary">My Platform Access</h4>
              <p className="text-sm text-slate-500">Backend-backed course isolation, live classes, labs, certificates, and AI chat state.</p>
            </div>
            {platformError && <p className="text-sm font-semibold text-red-600">{platformError}</p>}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-5">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Courses</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{platformDashboard?.enrolledCourses?.length ?? 0}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{platformDashboard?.liveClasses?.length ?? 0}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Labs</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{platformDashboard?.labs?.length ?? 0}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Certificates</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{platformDashboard?.certificates?.length ?? 0}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI chats</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{platformDashboard?.aiSessions?.length ?? 0}</p>
            </div>
          </div>
        </section>

        {/* Quick actions */}
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
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <h6 className={`font-space-grotesk font-bold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>{label}</h6>
              <p className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
            </Link>
          ))}
        </section>
      </div>

      {/* FAB */}
      <Link
        to="/courses"
        className="fixed bottom-8 right-8 bg-violet-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-violet-500 active:scale-95 transition-all z-40 group"
        title="Start New Lab"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
        <span className="absolute right-16 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Start New Lab
        </span>
      </Link>
    </AppShell>
  )
}
