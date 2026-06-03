import { useState, useMemo } from 'react'
import AppShell from '../../components/layout/AppShell'
import RarityBadge from '../../components/ui/RarityBadge'
import AchievementModal from '../../components/ui/AchievementModal'
import ProgressBar from '../../components/ui/ProgressBar'
import { achievements } from '../../data/achievements'

const CATEGORIES = ['All Badges', 'Cyber Safety', 'Web Security', 'Program']
const earned = achievements.filter(a => a.earned)

export default function AchievementsPage() {
  const [filter, setFilter] = useState('All Badges')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() =>
    filter === 'All Badges'
      ? achievements
      : achievements.filter(a => a.category === filter),
    [filter]
  )

  const masteryPct = Math.round((earned.length / achievements.length) * 100)

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        {/* Mastery header */}
        <div className="bg-white rounded-xl p-7 mb-8 border border-slate-100 shadow-card">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h1 className="font-space-grotesk text-2xl font-black text-primary">Academy Mastery</h1>
              <p className="text-on-surface-variant text-sm mt-1">
                You've unlocked <span className="font-bold text-on-surface">{earned.length}</span> of {achievements.length} total distinctions.
              </p>
            </div>
            <div className="text-right">
              <span className="font-space-grotesk text-2xl font-bold text-secondary">{masteryPct}%</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Progress</p>
            </div>
          </div>
          <ProgressBar value={masteryPct} glow />
          <div className="flex gap-5 mt-3">
            {[['bg-secondary-container', 'Completed'], ['bg-slate-100', 'Locked']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold font-space-grotesk border transition-all ${
                  filter === cat
                    ? 'bg-primary-container text-white border-primary-container'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-secondary hover:text-secondary'
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-lg border border-slate-100">
            <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            <span className="font-space-grotesk font-bold text-primary text-sm">{earned.length}</span>
            <span className="text-slate-400 text-xs font-space-grotesk">/ {achievements.length} Earned</span>
          </div>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filtered.map(badge => (
            <div key={badge.id}
              onClick={() => badge.earned && setSelected(badge)}
              className={`rounded-xl p-5 border flex flex-col items-center text-center relative overflow-hidden transition-all ${
                badge.earned
                  ? 'bg-white border-slate-100 shadow-card hover:shadow-card-hover cursor-pointer group'
                  : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60 hover:opacity-80 cursor-not-allowed grayscale'
              }`}>
              {badge.earned && <div className="absolute -top-4 -right-4 w-10 h-10 bg-secondary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${badge.earned ? 'bg-secondary-container/10 border border-secondary/20' : 'bg-slate-200 border border-slate-300'}`}>
                <span
                  className={`material-symbols-outlined text-3xl ${badge.earned ? 'text-secondary' : 'text-slate-400'}`}
                  style={badge.earned ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {badge.earned ? badge.icon : 'lock'}
                </span>
              </div>
              <h3 className="font-space-grotesk font-bold text-sm mb-1 text-on-surface">{badge.title}</h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{badge.description}</p>
              <RarityBadge rarity={badge.rarity} />
            </div>
          ))}
        </div>
      </div>

      {selected && <AchievementModal badge={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  )
}
