import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'

const SECTIONS = [
  { title: 'Eligibility', content: 'You may request a full refund within 7 days of your initial purchase or subscription renewal if you have not accessed more than 20% of course content during that period.' },
  { title: 'How to Request a Refund', content: 'Submit a refund request via the billing section of your account settings or email billing@cyberlabin.com. Include your account email and order reference. We process requests within 5 business days.' },
  { title: 'Non-Refundable Items', content: 'Certificates, one-time lab credits, and promotional purchases are non-refundable. Partial months are not refunded when you cancel mid-cycle; you retain access until the end of the paid period.' },
  { title: 'Processing Time', content: 'Approved refunds are returned to your original payment method within 5 to 10 business days depending on your bank or card issuer.' },
  { title: 'Exceptional Circumstances', content: 'We consider refunds outside the standard window for documented technical issues that prevented access, billing errors, or other exceptional circumstances at our discretion.' },
]

export default function RefundPolicyPage() {
  return (
    <AppShell>
      <div className="max-w-[760px] mx-auto px-8 py-8">
        <h1 className="font-space-grotesk text-2xl font-black text-primary mb-1">Refund Policy</h1>
        <p className="text-on-surface-variant text-sm mb-8">Last updated: June 10, 2026</p>
        <div className="space-y-7">
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 className="font-space-grotesk font-bold text-on-surface mb-2">{s.title}</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
          <p className="font-space-grotesk font-semibold text-on-surface text-sm mb-2">Need a refund?</p>
          <Link to="/settings?tab=account"
            className="inline-flex items-center gap-2 text-secondary text-sm font-bold hover:underline">
            Go to Billing Settings
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-200 flex gap-4 text-sm">
          <Link to="/privacy-policy" className="text-secondary hover:underline font-space-grotesk">Privacy Policy</Link>
          <Link to="/terms" className="text-secondary hover:underline font-space-grotesk">Terms of Service</Link>
        </div>
      </div>
    </AppShell>
  )
}
