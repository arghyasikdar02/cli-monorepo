import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import CircularProgress from '../../components/ui/CircularProgress'
import StatCard from '../../components/ui/StatCard'
import RarityBadge from '../../components/ui/RarityBadge'
import { useAppStore } from '../../store/useAppStore'
import { getEarnedAchievements } from '../../data/achievements'

const recentBadges = getEarnedAchievements().slice(0, 4)

export default function ProfilePage() {
  const { user } = useAppStore()

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8 space-y-6">
        {/* Profile header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-primary-container to-slate-700" />
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-10 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-secondary-container border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-primary">
                {user?.name?.[0] ?? 'U'}
              </div>
              <Link to="/settings"
                className="px-4 py-2 border border-slate-200 text-sm font-bold font-space-grotesk text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Profile
              </Link>
            </div>
            <h1 className="font-space-grotesk text-2xl font-black text-primary">{user?.name}</h1>
            <p className="text-on-surface-variant text-sm mt-1">{user?.email}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold font-space-grotesk border border-secondary/20 rounded-full">
                {user?.rank}
              </span>
              <span className="text-xs text-slate-400">Level {user?.level} Â· {user?.xp?.toLocaleString()} XP</span>
              <span className="text-xs text-slate-400">Joined {user?.joinedDate}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: stats + mastery */}
          <div className="col-span-2 space-y-5">
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Enrolled" value={user?.enrolled ?? 0} unit="Courses" />
              <StatCard label="Completed" value={user?.completed ?? 0} unit="Courses" />
              <StatCard label="Hours" value={user?.learningHours ?? 0} unit="Learned" />
              <StatCard label="Streak" value={user?.streakDays ?? 0} unit="Days" />
            </div>

            {/* Recent badges */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-space-grotesk font-bold text-primary">Recent Achievements</h2>
                <Link to="/achievements" className="text-secondary text-sm font-bold hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {recentBadges.map(badge => (
                  <div key={badge.id} className="flex flex-col items-center text-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-violet-200 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-secondary-container/10 border border-secondary/20 flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{badge.icon}</span>
                    </div>
                    <p className="text-xs font-bold text-on-surface leading-snug">{badge.title}</p>
                    <div className="mt-1"><RarityBadge rarity={badge.rarity} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: mastery circle */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 flex flex-col items-center text-center">
              <h3 className="font-space-grotesk font-bold text-primary mb-4">Overall Mastery</h3>
              <CircularProgress value={user?.masteryScore ?? 0} size={160} />
              <div className="mt-4 bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5">
                <span className="text-sm font-bold font-space-grotesk text-slate-700">{user?.rank}</span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
              <h3 className="font-space-grotesk font-bold text-primary text-sm mb-3">Quick Links</h3>
              {[
                { to: '/learn/courses', icon: 'school', label: 'My Courses' },
                { to: '/achievements', icon: 'military_tech', label: 'All Badges' },
                { to: '/subscription', icon: 'workspace_premium', label: 'Subscription' },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} className="flex items-center gap-3 py-2.5 text-sm text-on-surface-variant hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
