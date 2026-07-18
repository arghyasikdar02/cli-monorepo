import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { api } from '../../lib/api'

function formatDateTime(startValue, endValue) {
  const start = new Date(startValue)
  const end = new Date(endValue)
  return {
    day: start.toLocaleString(undefined, { day: '2-digit' }),
    month: start.toLocaleString(undefined, { month: 'short' }),
    time: `${start.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' })}`,
  }
}

export default function LiveClassDetailPage() {
  const { id } = useParams()
  const [liveClass, setLiveClass] = useState(null)
  const [viewerCount, setViewerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get(`/api/live-classes/${id}`)
      .then(({ liveClass, viewerCount }) => {
        if (!active) return
        setLiveClass(liveClass)
        setViewerCount(viewerCount)
        setError('')
      })
      .catch(err => {
        if (active) setError(err.message || 'Unable to load live class')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading) return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500 shadow-card">Loading live class...</div>
      </div>
    </AppShell>
  )

  if (error || !liveClass) return (
    <AppShell>
      <div className="flex items-center justify-center h-96 text-on-surface-variant">{error || 'Class not found'}</div>
    </AppShell>
  )

  const isLive = liveClass.status === 'live'
  const date = formatDateTime(liveClass.scheduledStart, liveClass.scheduledEnd)

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        <Link to="/live-classes" className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Schedule
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-xs font-bold font-space-grotesk rounded-full ${isLive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                  {isLive ? 'LIVE NOW' : date.time}
                </span>
                <span className="text-xs text-slate-400">{liveClass.courseTitle}</span>
              </div>
              <h1 className="font-space-grotesk text-2xl font-black text-primary mb-3">{liveClass.title}</h1>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                This session is available only to learners enrolled in the linked course.
              </p>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                  {liveClass.instructor?.[0] || 'C'}
                </div>
                <div>
                  <p className="font-space-grotesk font-bold text-on-surface">{liveClass.instructor}</p>
                  <p className="text-sm text-on-surface-variant">{liveClass.instructorTitle}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-24 bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
              <div className="text-center py-4">
                <p className="font-space-grotesk text-4xl font-black text-on-surface">{date.day}</p>
                <p className="text-sm text-on-surface-variant">{date.month} · {date.time}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">group</span>
                {viewerCount} watching now
              </div>
              {isLive ? (
                <Link to={`/live-classes/${liveClass.id}/session`}
                  className="block w-full text-center py-3.5 bg-green-500 text-white font-space-grotesk font-bold rounded-xl hover:bg-green-600 transition-colors">
                  Join Live Session
                </Link>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                  Join opens 15 minutes before start.
                </div>
              )}
              <Link to="/live-classes" className="block w-full text-center py-2.5 border border-slate-200 text-slate-600 text-sm font-space-grotesk rounded-xl hover:bg-slate-50 transition-colors">
                View Full Schedule
              </Link>
              {liveClass.meetingUrl && (
                <a href={liveClass.meetingUrl} target="_blank" rel="noreferrer" className="block w-full text-center py-2.5 border border-violet-200 text-violet-700 text-sm font-space-grotesk rounded-xl hover:bg-violet-50 transition-colors">
                  Open Google Meet
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
