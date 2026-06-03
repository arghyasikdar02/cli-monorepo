import { useEffect, useState } from 'react'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import DashboardMetric from '../../components/ui/DashboardMetric'
import { api } from '../../lib/api'

export default function MarketingDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboard('marketing')
      .then(({ dashboard }) => setDashboard(dashboard))
      .catch(err => setError(err.message || 'Unable to load marketing dashboard'))
  }, [])

  const analytics = dashboard?.analytics || {}

  return (
    <StaffDashboardShell
      title="Sales and Marketing Dashboard"
      subtitle="Track lead capture, course interest, lead source quality, conversion status, follow-ups, and sales suggestions."
      loginPath="/marketing/login"
    >
      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!dashboard ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500">Loading sales data...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardMetric label="Total leads" value={analytics.totalLeads ?? 0} helper="Captured from website and locked prompts" />
            <DashboardMetric label="New leads" value={analytics.stages?.new ?? 0} helper="Ready for first follow-up" />
            <DashboardMetric label="Course interests" value={analytics.courseWise?.length ?? 0} helper="Course-wise breakdowns" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-space-grotesk text-lg font-bold">Lead Queue</h2>
              <div className="mt-4 space-y-3">
                {dashboard.leads.map(lead => (
                  <div key={lead.id} className="rounded-lg bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{lead.name}</p>
                      <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-bold uppercase text-violet-700">{lead.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{lead.email} - {lead.source}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-space-grotesk text-lg font-bold">Sales Suggestions</h2>
              <div className="mt-4 space-y-3">
                {analytics.suggestions?.map(suggestion => (
                  <div key={suggestion} className="rounded-lg border border-slate-100 p-4 text-sm text-slate-600">{suggestion}</div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </StaffDashboardShell>
  )
}
