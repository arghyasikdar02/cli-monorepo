import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { useAppStore } from '../../store/useAppStore'
import { notifications } from '../../data/notifications'

const TYPE_COLORS = {
  achievement: 'bg-amber-50 text-amber-600',
  course: 'bg-blue-50 text-blue-600',
  live: 'bg-green-50 text-green-600',
  streak: 'bg-orange-50 text-orange-600',
  leaderboard: 'bg-purple-50 text-purple-600',
  system: 'bg-slate-100 text-slate-600',
}

function NotificationGroup({ title, items }) {
  if (items.length === 0) return null

  return (
    <div>
      <p className="font-space-grotesk text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{title}</p>
      <div className="space-y-2">
        {items.map(n => (
          <Link key={n.id} to={n.link}
            className={`flex gap-4 p-4 rounded-xl border transition-all ${n.read ? 'bg-white border-slate-100' : 'bg-violet-50/30 border-violet-100'} hover:shadow-card`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[n.type] ?? TYPE_COLORS.system}`}>
              <span className="material-symbols-outlined text-[20px]">{n.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold text-on-surface ${!n.read ? 'font-bold' : ''}`}>{n.title}</p>
                {!n.read && <span className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-1.5" />}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">{n.message}</p>
              <p className="text-[10px] text-slate-400 mt-1">{n.timestamp}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const { clearNotifications } = useAppStore()

  const today = notifications.filter(n => n.timestamp === 'Today' || n.timestamp.includes('hour'))
  const yesterday = notifications.filter(n => n.timestamp === 'Yesterday')
  const earlier = notifications.filter(n => !today.includes(n) && !yesterday.includes(n))

  return (
    <AppShell>
      <div className="max-w-[760px] mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-7">
          <h1 className="font-space-grotesk text-2xl font-black text-primary">Notifications</h1>
          <button onClick={clearNotifications}
            className="text-sm font-bold text-secondary hover:underline font-space-grotesk">
            Mark all read
          </button>
        </div>
        <div className="space-y-7">
          <NotificationGroup title="Today" items={today} />
          <NotificationGroup title="Yesterday" items={yesterday} />
          <NotificationGroup title="Earlier" items={earlier} />
        </div>
      </div>
    </AppShell>
  )
}
