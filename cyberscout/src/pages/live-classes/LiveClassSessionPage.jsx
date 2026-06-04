import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../lib/api'

export default function LiveClassSessionPage() {
  const { id } = useParams()
  const [liveClass, setLiveClass] = useState(null)
  const [viewerCount, setViewerCount] = useState(0)
  const [muted, setMuted] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    api.post(`/api/live-classes/${id}/join`, {})
      .then(({ liveClass, viewerCount }) => {
        if (!active) return
        setLiveClass(liveClass)
        setViewerCount(viewerCount)
        setError('')
      })
      .catch(err => {
        if (active) setError(err.message || 'Unable to join live class')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      api.post(`/api/live-classes/${id}/leave`, {}).catch(() => {})
    }
  }, [id])

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Joining live session...
      </div>
    )
  }

  if (error || !liveClass) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-8 text-center">
        <div>
          <span className="material-symbols-outlined text-[72px] text-slate-700 block mb-4">lock</span>
          <h1 className="font-space-grotesk text-2xl font-black text-white">Live session unavailable</h1>
          <p className="mt-2 text-slate-400">{error || 'You cannot join this class right now.'}</p>
          <Link to="/live-classes" className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950">
            Back to schedule
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed-dim">shield</span>
          <span className="font-space-grotesk font-bold text-white text-sm">{liveClass.title}</span>
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-2">LIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">group</span>
            {viewerCount} watching
          </span>
          <Link to="/live-classes"
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold font-space-grotesk rounded-lg hover:bg-red-700 transition-colors">
            Leave
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-slate-900 flex items-center justify-center relative">
            {liveClass.embedUrl ? (
              <iframe
                title={liveClass.title}
                src={liveClass.embedUrl}
                className="h-full w-full border-0"
                allow="camera; microphone; fullscreen; display-capture"
              />
            ) : (
              <div className="text-center">
                <span className="material-symbols-outlined text-[80px] text-slate-700 block mb-4">video_camera_front</span>
                <p className="font-space-grotesk font-bold text-slate-500">{liveClass.instructor ?? 'Instructor'}</p>
                <p className="text-xs text-slate-600 mt-1">Video provider URL is not configured for this session.</p>
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold">LIVE</span>
            </div>
          </div>

          <div className="h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
            <button onClick={() => setMuted(m => !m)}
              className={`p-3 rounded-full transition-colors ${muted ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <span className="material-symbols-outlined text-[20px]">{muted ? 'mic_off' : 'mic'}</span>
            </button>
            <button
              className="p-3 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
              <span className="material-symbols-outlined text-[20px]">videocam_off</span>
            </button>
            <button onClick={() => setHandRaised(h => !h)}
              className={`p-3 rounded-full transition-colors ${handRaised ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <span className="material-symbols-outlined text-[20px]">back_hand</span>
            </button>
          </div>
        </div>

        <aside className="w-80 bg-slate-900 border-l border-slate-800 hidden lg:flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-space-grotesk font-bold text-white text-sm">Session Info</h3>
          </div>
          <div className="flex-1 p-4 space-y-4 text-sm text-slate-400">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Course</p>
              <p className="mt-1 text-slate-200">{liveClass.courseTitle}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Access</p>
              <p className="mt-1">Your join event has been recorded for attendance.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
