import RarityBadge from './RarityBadge'

export default function AchievementModal({ badge, onClose }) {
  if (!badge) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-32 bg-gradient-to-r from-primary-container to-secondary flex items-center justify-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg translate-y-12">
            <span className="material-symbols-outlined text-secondary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {badge.icon}
            </span>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8 text-center">
          <RarityBadge rarity={badge.rarity} />
          <h2 className="font-space-grotesk text-2xl font-bold text-primary mt-3 mb-2">{badge.title}</h2>
          <p className="text-on-surface-variant text-sm mb-6">{badge.description}</p>

          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Earned</p>
              <p className="font-space-grotesk text-sm font-semibold">{badge.earnedDate ?? '—'}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rarity</p>
              <p className="font-space-grotesk text-sm font-semibold text-secondary">{badge.rarity}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-primary-container text-white rounded-lg font-space-grotesk text-sm font-bold hover:opacity-90 transition-opacity">
              Share to Profile
            </button>
            <button className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-space-grotesk text-sm font-bold hover:bg-slate-50 transition-colors">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
