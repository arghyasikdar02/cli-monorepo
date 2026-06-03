import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { leaderboardEntries } from '../../data/leaderboard'

const top3 = leaderboardEntries.slice(0, 3)
const rest = leaderboardEntries.slice(3)

// Podium order: [rank2, rank1, rank3]
const podiumOrder = [top3[1], top3[0], top3[2]]
const podiumHeights = { 0: 'h-72', 1: 'h-80', 2: 'h-64' }
const podiumAccent = {
  0: 'bg-slate-400',       // silver
  1: 'bg-violet-500',        // gold (cyan in this design)
  2: 'bg-amber-600/50',    // bronze
}
const podiumRingColors = {
  0: 'border-slate-200',
  1: 'border-violet-400/30',
  2: 'border-slate-200',
}
const podiumAvatarSizes = { 0: 'w-24 h-24', 1: 'w-28 h-28', 2: 'w-20 h-20' }

export default function LeaderboardPage() {
  const [view, setView] = useState('global')

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-space-grotesk text-3xl font-black text-on-surface">Global Leaderboard</h1>
            <p className="text-on-surface-variant mt-1">Elite defenders competing for technical supremacy.</p>
          </div>
          <div className="bg-surface-container-low border border-outline-variant/30 p-1 rounded-xl flex gap-1">
            {['global', 'monthly'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-5 py-1.5 rounded-lg text-sm font-semibold font-space-grotesk capitalize transition-all ${
                  view === v ? 'bg-white shadow-sm text-violet-600' : 'text-slate-500 hover:text-on-surface'
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-3 gap-6 items-end pt-6">
          {podiumOrder.map((entry, i) => (
            <div key={entry.rank}
              className={`bg-white border rounded-xl p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden ${
                entry.rank === 1 ? 'border-2 border-violet-100 shadow-xl' : 'border-slate-100 shadow-card'
              } ${podiumHeights[i]} justify-end`}>
              <div className={`absolute top-0 left-0 w-full h-1.5 ${podiumAccent[i]}`} />
              <div className="relative">
                <div className={`rounded-full border-4 overflow-hidden bg-secondary-container flex items-center justify-center text-2xl font-black text-primary ${podiumAvatarSizes[i]} ${podiumRingColors[i]}`}>
                  {entry.name[0]}
                </div>
                <div className={`absolute -bottom-2 right-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white text-sm font-bold ${podiumAccent[i]}`}>
                  {entry.rank === 1
                    ? <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                    : entry.rank}
                </div>
              </div>
              <div>
                <h3 className="font-space-grotesk font-bold text-on-surface">{entry.name}</h3>
                <p className="text-violet-600 font-space-grotesk text-xs uppercase font-bold tracking-wide">{entry.title}</p>
              </div>
              <div className="w-full pt-3 border-t border-slate-50 flex justify-around">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Level</p>
                  <p className="font-bold text-on-surface">{entry.level}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">XP</p>
                  <p className={`font-bold ${entry.rank === 1 ? 'text-violet-600' : 'text-on-surface'}`}>
                    {entry.xp.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rankings table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {['Rank', 'Expert', 'Level', 'Total XP', 'Trend', ''].map(h => (
                  <th key={h} className="px-6 py-4 font-space-grotesk text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rest.map(entry => (
                <tr key={entry.rank}
                  className={`transition-colors ${entry.isCurrentUser ? 'bg-violet-50/30 border-l-4 border-l-violet-500' : 'hover:bg-slate-50/50'}`}>
                  <td className={`px-6 py-4 font-space-grotesk font-bold ${entry.isCurrentUser ? 'text-violet-600' : 'text-slate-400'}`}>
                    {String(entry.rank).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-primary flex-shrink-0 ${entry.isCurrentUser ? 'bg-violet-100 border border-violet-200' : 'bg-slate-100 border border-slate-200'}`}>
                        {entry.name[0]}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${entry.isCurrentUser ? 'font-bold' : ''}`}>{entry.isCurrentUser ? `You (${entry.name})` : entry.name}</p>
                        <p className={`text-xs ${entry.isCurrentUser ? 'text-violet-600 font-bold uppercase' : 'text-slate-400'}`}>{entry.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-space-grotesk text-sm text-on-surface">{entry.level}</td>
                  <td className="px-6 py-4 font-bold text-sm text-on-surface">{entry.xp.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {entry.weeklyTrend > 0 && (
                      <span className="flex items-center gap-1 text-green-500 font-semibold text-sm">
                        <span className="material-symbols-outlined text-sm">trending_up</span>+{entry.weeklyTrend}
                      </span>
                    )}
                    {entry.weeklyTrend < 0 && (
                      <span className="flex items-center gap-1 text-red-500 font-semibold text-sm">
                        <span className="material-symbols-outlined text-sm">trending_down</span>{entry.weeklyTrend}
                      </span>
                    )}
                    {entry.weeklyTrend === 0 && (
                      <span className="flex items-center gap-1 text-slate-400 text-sm">
                        <span className="material-symbols-outlined text-sm">horizontal_rule</span>0
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {entry.isCurrentUser
                      ? <span className="bg-violet-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Active</span>
                      : <button className="text-violet-600 hover:bg-violet-50 p-1.5 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing top {leaderboardEntries.length} experts</p>
            <div className="flex gap-2">
              {['Previous', 'Next'].map(label => (
                <button key={label} className="px-4 py-1.5 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-white transition-colors bg-slate-100/50">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
