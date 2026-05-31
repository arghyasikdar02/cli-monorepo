export default function CircularProgress({ value = 0, size = 192 }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8"
          strokeLinecap="round" className="text-violet-500"
          strokeDasharray={circ} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black font-space-grotesk text-slate-900">{value}%</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastery Score</span>
      </div>
    </div>
  )
}
