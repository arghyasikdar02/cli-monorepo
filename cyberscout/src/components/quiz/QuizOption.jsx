import SiteIcon from '../ui/SiteIcon'

const STATE_STYLES = {
  default:  'border-slate-100 hover:border-slate-300 hover:bg-slate-50',
  selected: 'border-secondary bg-secondary/5',
  correct:  'border-green-500 bg-green-50',
  wrong:    'border-error bg-red-50',
}

const LABEL_STYLES = {
  default:  'bg-slate-100 text-slate-500',
  selected: 'bg-secondary text-white',
  correct:  'bg-green-500 text-white',
  wrong:    'bg-error text-white',
}

export default function QuizOption({ label, text, state = 'default', onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={state === 'correct' || state === 'wrong'}
      className={`w-full text-left p-4 rounded-xl border-2 flex items-center justify-between transition-all ${STATE_STYLES[state]}`}
    >
      <div className="flex items-center gap-4">
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm font-space-grotesk ${LABEL_STYLES[state]}`}>
          {label}
        </span>
        <span className="text-on-surface text-sm">{text}</span>
      </div>
      {state === 'selected' && <SiteIcon name="check_circle" className="text-secondary" />}
      {state === 'correct' && <SiteIcon name="check_circle" className="text-green-500" />}
      {state === 'wrong' && <SiteIcon name="cancel" className="text-error" />}
    </button>
  )
}
