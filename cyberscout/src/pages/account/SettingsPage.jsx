import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { useAppStore } from '../../store/useAppStore'

const TABS = ['account', 'security', 'notifications', 'appearance']

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'account'
  const { user, updateUser } = useAppStore()

  const setTab = (t) => setSearchParams({ tab: t })

  return (
    <AppShell>
      <div className="max-w-[960px] mx-auto px-8 py-8">
        <h1 className="font-space-grotesk text-2xl font-black text-primary mb-8">Settings</h1>

        <div className="flex gap-8">
          {/* Sidebar tabs */}
          <nav className="w-44 flex-shrink-0 space-y-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium font-space-grotesk capitalize transition-colors ${
                  tab === t
                    ? 'bg-secondary/10 text-secondary font-bold'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}>
                {t}
              </button>
            ))}
          </nav>

          {/* Panel */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-card p-7 space-y-6">
            {tab === 'account' && <AccountTab user={user} updateUser={updateUser} />}
            {tab === 'security' && <SecurityTab />}
            {tab === 'notifications' && <NotificationsTab />}
            {tab === 'appearance' && <AppearanceTab />}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function Field({ label, value, type = 'text', onChange }) {
  return (
    <div>
      <label className="block font-space-grotesk text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={value}
        onChange={e => onChange?.(e.target.value)}
        className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
      />
    </div>
  )
}

function Toggle({ label, desc, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        {desc && <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => setOn(v => !v)}
        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? 'bg-secondary' : 'bg-slate-200'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}

function AccountTab({ user, updateUser }) {
  return (
    <>
      <h2 className="font-space-grotesk font-bold text-primary">Account Details</h2>
      <div className="space-y-4">
        <Field label="Display Name" value={user?.name} />
        <Field label="Email Address" value={user?.email} type="email" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Timezone" value="GMT+1 London" />
          <Field label="Language" value="English" />
        </div>
      </div>
      <button className="px-5 py-2.5 bg-primary text-white font-space-grotesk font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
        Save Changes
      </button>
    </>
  )
}

function SecurityTab() {
  return (
    <>
      <h2 className="font-space-grotesk font-bold text-primary">Security</h2>
      <div className="space-y-4">
        <Field label="Current Password" type="password" value="" />
        <Field label="New Password" type="password" value="" />
        <Field label="Confirm New Password" type="password" value="" />
      </div>
      <button className="px-5 py-2.5 bg-primary text-white font-space-grotesk font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
        Update Password
      </button>
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h3 className="font-space-grotesk font-semibold text-on-surface mb-4">Two-Factor Authentication</h3>
        <Toggle label="Enable 2FA" desc="Secure your account with an authenticator app" defaultOn={false} />
      </div>
      <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="font-space-grotesk text-sm font-semibold text-on-surface mb-2">Active Sessions</p>
        {[{ device: 'Chrome on Windows 11', location: 'London, UK', current: true }, { device: 'Safari on iPhone', location: 'London, UK', current: false }].map(s => (
          <div key={s.device} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-on-surface">{s.device}</p>
              <p className="text-xs text-on-surface-variant">{s.location} {s.current && '· Current'}</p>
            </div>
            {!s.current && <button className="text-xs text-error hover:underline font-bold">Revoke</button>}
          </div>
        ))}
      </div>
    </>
  )
}

function NotificationsTab() {
  return (
    <>
      <h2 className="font-space-grotesk font-bold text-primary mb-2">Notification Preferences</h2>
      <Toggle label="Achievement Unlocked" desc="When you earn a new badge or rank up" defaultOn={true} />
      <Toggle label="Course Updates" desc="New lessons and module releases" defaultOn={true} />
      <Toggle label="Live Class Reminders" desc="30 minutes before a session starts" defaultOn={true} />
      <Toggle label="Leaderboard Changes" desc="When your ranking changes" defaultOn={false} />
      <Toggle label="Email Digest" desc="Weekly summary of your progress" defaultOn={false} />
    </>
  )
}

function AppearanceTab() {
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
    setDark(d => !d)
  }

  return (
    <>
      <h2 className="font-space-grotesk font-bold text-primary mb-2">Appearance</h2>
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-semibold text-on-surface">Dark Mode</p>
          <p className="text-xs text-on-surface-variant">Toggle between light and dark theme</p>
        </div>
        <button onClick={toggleDark}
          className={`w-11 h-6 rounded-full transition-colors relative ${dark ? 'bg-secondary' : 'bg-slate-200'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? 'left-6' : 'left-1'}`} />
        </button>
      </div>
      <div className="mt-4">
        <p className="font-space-grotesk text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Font Size</p>
        <div className="flex gap-2">
          {['Small', 'Medium', 'Large'].map((size, i) => (
            <button key={size}
              className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${i === 1 ? 'border-secondary bg-secondary/5 text-secondary font-bold' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {size}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
