export default function ProgressBar({ value = 0, glow = false, className = '' }) {
  return (
    <div className={`h-2 w-full bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full bg-violet-500 rounded-full transition-all duration-500 ${glow ? 'shadow-[0_0_8px_rgba(124,58,237,0.5)]' : ''}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
