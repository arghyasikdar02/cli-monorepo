const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function WeeklyChart({ data = [30, 50, 80, 40, 20, 60, 45], todayIdx = 2 }) {
  return (
    <>
      <div className="flex items-end gap-2 h-20">
        {data.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t transition-all ${i === todayIdx ? 'bg-violet-500 shadow-[0_0_12px_rgba(124,58,237,0.3)]' : 'bg-slate-100'}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {DAYS.map((d, i) => (
          <span key={d} className={`text-[9px] font-bold uppercase ${i === todayIdx ? 'text-violet-600' : 'text-slate-400'}`}>{d}</span>
        ))}
      </div>
    </>
  )
}
