import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { billingTransactions, currentPlan } from '../../data/billing'

export default function BillingHistoryPage() {
  return (
    <AppShell>
      <div className="max-w-[960px] mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="font-space-grotesk text-2xl font-black text-primary">Billing History</h1>
            <p className="text-on-surface-variant text-sm mt-1">Manage your subscription and invoices.</p>
          </div>
          <Link to="/subscription"
            className="px-4 py-2 border border-slate-200 text-sm font-bold font-space-grotesk text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
            Manage Subscription
          </Link>
        </div>

        {/* Current plan card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 mb-6 flex items-center justify-between">
          <div>
            <p className="font-space-grotesk font-bold text-on-surface">Current Plan: <span className="text-secondary">{currentPlan.name}</span></p>
            <p className="text-sm text-on-surface-variant mt-1">
              {currentPlan.price} · Next renewal {currentPlan.renewsOn}
            </p>
          </div>
          <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold font-space-grotesk rounded-full border border-green-200">
            Active
          </span>
        </div>

        {/* Transactions table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Date', 'Description', 'Amount', 'Status', 'Invoice'].map(h => (
                  <th key={h} className="px-6 py-3.5 font-space-grotesk text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {billingTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">{tx.description}</td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">{tx.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wide font-space-grotesk">
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-secondary text-xs font-bold hover:underline font-space-grotesk flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      {tx.invoice}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
