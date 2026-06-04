import { useEffect, useMemo, useState } from 'react'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import DashboardMetric from '../../components/ui/DashboardMetric'
import { api } from '../../lib/api'

const statuses = ['new', 'contacted', 'converted', 'closed']
const sources = ['', 'landing_form', 'chatbot', 'course_popup', 'course_page', 'locked_prompt', 'website']

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function MarketingDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [leads, setLeads] = useState([])
  const [filters, setFilters] = useState({ search: '', source: '', status: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')

  const load = async (nextFilters = filters) => {
    setLoading(true)
    try {
      const [{ dashboard }, { leads }] = await Promise.all([
        api.dashboard('marketing'),
        api.leads(nextFilters),
      ])
      setDashboard(dashboard)
      setLeads(leads)
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to load marketing dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const analytics = dashboard?.analytics || {}
  const visitorAnalytics = dashboard?.visitorAnalytics || {}

  const filteredCount = useMemo(() => leads.length, [leads])

  const updateStatus = async (leadId, status) => {
    setUpdatingId(leadId)
    try {
      const { lead } = await api.updateLead(leadId, { status })
      setLeads(current => current.map(item => item.id === leadId ? lead : item))
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to update lead')
    } finally {
      setUpdatingId('')
    }
  }

  const applyFilters = (event) => {
    event.preventDefault()
    load(filters)
  }

  return (
    <StaffDashboardShell
      title="Sales and Marketing Dashboard"
      subtitle="Database-backed leads, source quality, follow-up priorities, visitor analytics, and conversion status."
      loginPath="/marketing/login"
    >
      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardMetric label="Total leads" value={analytics.totalLeads ?? 0} helper="All captured sources" />
          <DashboardMetric label="New leads" value={analytics.stages?.new ?? 0} helper="Ready for first contact" />
          <DashboardMetric label="Chatbot leads" value={analytics.sources?.chatbot ?? 0} helper="Guided FAQ assistant" />
          <DashboardMetric label="Unique visitors" value={visitorAnalytics.totalUniqueVisitors ?? 0} helper="Privacy-conscious count" />
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={applyFilters} className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
            <input
              value={filters.search}
              onChange={event => setFilters(value => ({ ...value, search: event.target.value }))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="Search name, phone, or email"
            />
            <select
              value={filters.source}
              onChange={event => setFilters(value => ({ ...value, source: event.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-300"
            >
              {sources.map(source => <option key={source} value={source}>{source || 'All sources'}</option>)}
            </select>
            <select
              value={filters.status}
              onChange={event => setFilters(value => ({ ...value, status: event.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-300"
            >
              <option value="">All statuses</option>
              {statuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <button type="submit" className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-bold text-white">
              Filter
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-space-grotesk text-lg font-bold">Lead submissions</h2>
            <p className="text-sm text-slate-500">{loading ? 'Loading...' : `${filteredCount} shown`}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  {['Name', 'Phone', 'Email', 'Message', 'Source', 'Created date/time', 'Status'].map(header => (
                    <th key={header} className="px-4 py-3 font-bold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map(lead => (
                  <tr key={lead.id} className="align-top">
                    <td className="px-4 py-4 font-semibold text-slate-900">{lead.name}</td>
                    <td className="px-4 py-4 text-slate-600">{lead.phone}</td>
                    <td className="px-4 py-4 text-slate-600">{lead.email}</td>
                    <td className="max-w-xs px-4 py-4 text-slate-600">{lead.message}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{lead.source}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-4">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={event => updateStatus(lead.id, event.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold capitalize outline-none focus:ring-2 focus:ring-sky-300"
                      >
                        {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {!loading && !leads.length && (
                  <tr>
                    <td colSpan="7" className="px-4 py-10 text-center text-slate-500">No leads match these filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {analytics.suggestions?.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-space-grotesk text-lg font-bold">Rule-based follow-up suggestions</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {analytics.suggestions.map(suggestion => (
                <div key={suggestion} className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">{suggestion}</div>
              ))}
            </div>
          </section>
        )}
      </div>
    </StaffDashboardShell>
  )
}
