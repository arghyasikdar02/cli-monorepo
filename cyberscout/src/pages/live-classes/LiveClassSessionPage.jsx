import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import SiteIcon from '../../components/ui/SiteIcon'

export default function LiveClassSessionPage() {
  const { id } = useParams()
  const [liveClass, setLiveClass] = useState(null)
  const [viewerCount, setViewerCount] = useState(0)
  const [muted, setMuted] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let joined = false
    setLoading(true)
    api.post(`/api/live-classes/${id}/join`, {})
      .then(({ liveClass, viewerCount }) => {
        if (!active) return
        joined = true
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
      if (joined) api.post(`/api/live-classes/${id}/leave`, {}).catch(() => {})
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
          <SiteIcon name="lock" size={72} className="mx-auto mb-4 text-slate-700" />
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
          <SiteIcon name="shield" className="text-primary-fixed-dim" />
          <span className="font-space-grotesk font-bold text-white text-sm">{liveClass.title}</span>
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-2">LIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm flex items-center gap-1.5">
            <SiteIcon name="group" size={16} />
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
            {liveClass.joinUrl ? (
              <div className="max-w-lg px-6 text-center">
                <SiteIcon name="video_chat" size={72} className="mx-auto mb-4 text-slate-600" />
                <h1 className="font-space-grotesk text-2xl font-black text-white">Join the Google Meet session</h1>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Google Meet opens in a new tab. Keep this Cyber Lab IN class workspace open for agenda, notes and attendance.
                </p>
                <a href={liveClass.joinUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-slate-100">
                  Open Google Meet
                </a>
              </div>
            ) : (
              <div className="text-center">
                <SiteIcon name="video_camera_front" size={80} className="mx-auto mb-4 text-slate-700" />
                <p className="font-space-grotesk font-bold text-slate-500">{liveClass.instructor ?? 'Instructor'}</p>
                <p className="text-xs text-slate-600 mt-1">This class does not have a viewing link yet. Contact your instructor if it should already be available.</p>
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold">LIVE</span>
            </div>
          </div>

          <div className="h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
            <button onClick={() => setMuted(m => !m)}
              aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
              className={`p-3 rounded-full transition-colors ${muted ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <SiteIcon name={muted ? 'mic_off' : 'mic'} size={20} />
            </button>
            <button
              type="button"
              aria-label="Camera is unavailable"
              className="p-3 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
              <SiteIcon name="videocam_off" size={20} />
            </button>
            <button onClick={() => setHandRaised(h => !h)}
              aria-label={handRaised ? 'Lower hand' : 'Raise hand'}
              className={`p-3 rounded-full transition-colors ${handRaised ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <SiteIcon name="back_hand" size={20} />
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
              <p className="mt-1">Your join click has been recorded. Check in when your instructor asks you to confirm attendance.</p>
              <button
                type="button"
                disabled={checkedIn}
                onClick={async () => {
                  await api.checkInLiveClass(liveClass.id)
                  setCheckedIn(true)
                }}
                className="mt-3 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 disabled:cursor-default disabled:opacity-60"
              >
                {checkedIn ? 'Checked in' : 'Check in'}
              </button>
            </div>
            {liveClass.agenda && (
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Agenda</p>
                <p className="mt-1 whitespace-pre-wrap">{liveClass.agenda}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
