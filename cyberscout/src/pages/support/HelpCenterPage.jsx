import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'

const CATEGORIES = [
  { icon: 'lock', label: 'Account & Security', to: '/help/account-security', desc: 'Passwords, 2FA, login issues' },
  { icon: 'school', label: 'Courses & Labs', to: '/learn/courses', desc: 'Enrollment, progress, certificates' },
  { icon: 'payments', label: 'Fees and refunds', to: '/refund-policy', desc: 'Published course fee and refund information' },
  { icon: 'build', label: 'Technical Issues', to: '/report-bug', desc: 'Bugs, performance, compatibility' },
]

const ARTICLES = [
  { title: 'How do I reset my password?', views: 'Help article', to: '/help/account-security' },
  { title: 'How to download course materials?', views: 'Help article', to: '/downloads' },
  { title: 'How is course progress calculated?', views: 'Help article', to: '/learn/courses' },
  { title: 'Can I get a refund?', views: 'Help article', to: '/refund' },
  { title: 'How to enable 2FA on my account?', views: 'Help article', to: '/help/account-security' },
  { title: 'What are the system requirements for labs?', views: 'Help article', to: '/help/account-security' },
]

export default function HelpCenterPage() {
  const [search, setSearch] = useState('')
  const filtered = ARTICLES.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <AppShell>
      <div className="max-w-[960px] mx-auto px-8 py-8">
        <div className="bg-gradient-to-br from-primary-container to-slate-800 rounded-2xl p-10 text-center mb-10">
          <h1 className="font-space-grotesk text-3xl font-black text-white mb-2">How can we help?</h1>
          <p className="text-white/60 mb-6">Search our knowledge base or browse categories below.</p>
          <div className="max-w-md mx-auto flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-white/50 text-[20px]">search</span>
            <input
              className="flex-1 bg-transparent text-white outline-none placeholder:text-white/40 text-sm"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {!search && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {CATEGORIES.map(cat => (
              <Link key={cat.to} to={cat.to}
                className="bg-white rounded-xl border border-slate-200 shadow-card p-5 hover:shadow-card-hover hover:border-violet-200 transition-all group">
                <span className="material-symbols-outlined text-secondary text-[28px] block mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <p className="font-space-grotesk font-bold text-on-surface text-sm">{cat.label}</p>
                <p className="text-xs text-on-surface-variant mt-1">{cat.desc}</p>
              </Link>
            ))}
          </div>
        )}

        <div>
          <h2 className="font-space-grotesk font-bold text-primary mb-4">
            {search ? `Results for "${search}"` : 'Popular Articles'}
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-50">
            {filtered.map(article => (
              <Link key={article.title} to={article.to}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-300 text-[20px]">article</span>
                  <span className="text-sm font-medium text-on-surface">{article.title}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-400">{article.views}</span>
                  <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="px-6 py-10 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">search_off</span>
                <p className="text-sm">No articles found. <Link to="/report-bug" className="text-secondary font-bold hover:underline">Report an issue</Link></p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-on-surface-variant text-sm">Still need help?{' '}
            <Link to="/report-bug" className="text-secondary font-bold hover:underline">Report a Bug</Link>
          </p>
        </div>
      </div>
    </AppShell>
  )
}
