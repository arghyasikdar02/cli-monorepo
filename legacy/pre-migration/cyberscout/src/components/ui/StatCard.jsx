export default function StatCard({ label, value, unit }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card text-center">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-bold font-space-grotesk text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{unit}</p>
    </div>
  )
}
