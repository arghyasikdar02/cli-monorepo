import ProgressBar from '../ui/ProgressBar'
import SiteIcon from '../ui/SiteIcon'

export default function QuizProgress({ current, total, timeLeft }) {
  const pct = Math.round((current / total) * 100)
  const hasTimer = Number.isFinite(timeLeft)
  const mins = hasTimer ? String(Math.floor(timeLeft / 60)).padStart(2, '0') : ''
  const secs = hasTimer ? String(timeLeft % 60).padStart(2, '0') : ''

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[11px] font-bold text-slate-500 font-space-grotesk uppercase tracking-widest">
          Question {current} of {total}
        </span>
        {hasTimer && <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <SiteIcon name="timer" size={18} className="text-secondary" />
          <span className="font-space-grotesk text-sm font-bold text-primary">{mins}:{secs}</span>
        </div>}
      </div>
      <ProgressBar value={pct} glow />
    </div>
  )
}
