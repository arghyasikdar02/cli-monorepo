import { Link } from 'react-router-dom'

export default function LiveClassCard({ cls }) {
  const isLive = cls.status === 'live'

  return (
    <div className="min-w-[380px] bg-white p-5 rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow flex gap-4">
      <div className="flex-shrink-0 w-20 h-20 bg-slate-50 rounded-lg flex flex-col items-center justify-center border border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase">{cls.month}</span>
        <span className="text-3xl font-black font-space-grotesk text-slate-900">{cls.day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h6 className="font-bold text-slate-900 text-sm leading-snug">{cls.title}</h6>
          {isLive && (
            <span className="flex-shrink-0 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded">LIVE</span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-3 line-clamp-1">{cls.description}</p>
        <div className="flex items-center justify-between">
          {isLive ? (
            <Link to={`/live-classes/${cls.id}/session`}
              className="text-violet-600 text-sm font-bold flex items-center gap-1 hover:underline">
              Join Session <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          ) : (
            <>
              <span className="text-xs text-slate-400">{cls.time}</span>
              <Link to={`/live-classes/${cls.id}`}
                className="border border-violet-600 text-violet-600 px-3 py-1 rounded-lg text-xs font-bold font-space-grotesk hover:bg-violet-50 transition-colors">
                Details
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
