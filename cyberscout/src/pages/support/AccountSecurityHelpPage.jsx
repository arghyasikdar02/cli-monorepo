import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import SiteIcon from '../../components/ui/SiteIcon'

const FAQS = [
  { q: 'How do I reset my password?', a: "Go to the login page and click 'Forgot?'. Enter your email and we'll send a reset link. Links expire after 1 hour." },
  { q: 'How do I enable Two-Factor Authentication?', a: 'Go to Settings → Security → Enable 2FA. Scan the QR code with your authenticator app and enter the 6-digit code to confirm.' },
  { q: "I can't log into my account. What should I do?", a: "First, try resetting your password. If you still can't access your account, check that you're using the correct email. Contact support if the issue persists." },
  { q: 'How do I revoke access to active sessions?', a: "Navigate to Settings → Security → Active Sessions. You can revoke any session that isn't your current one by clicking 'Revoke'." },
  { q: 'How is my account protected?', a: 'Cyber Lab IN uses TLS for data in transit and bcrypt password hashing with unique salts. Additional storage protections are managed by the database provider.' },
  { q: 'How do I delete my account?', a: 'Contact our support team. Account deletion is permanent and removes all your progress, badges, and billing history.' },
]

export default function AccountSecurityHelpPage() {
  const [open, setOpen] = useState(null)

  return (
    <AppShell>
      <div className="max-w-[760px] mx-auto px-8 py-8">
        <Link to="/help" className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors">
          <SiteIcon name="arrow_back" size={18} />
          Help Center
        </Link>
        <h1 className="font-space-grotesk text-2xl font-black text-primary mb-2">Account &amp; Security</h1>
        <p className="text-on-surface-variant mb-8">Everything you need to know about your account and security settings.</p>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left">
                <span className="font-space-grotesk font-semibold text-sm text-on-surface">{faq.q}</span>
                <SiteIcon name={open === i ? 'expand_less' : 'expand_more'} size={20} className="ml-4 flex-shrink-0 text-slate-400" />
              </button>
              {open === i && (
                <div className="px-6 pb-5 border-t border-slate-100">
                  <p className="text-sm text-on-surface-variant pt-4 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <p className="text-sm text-on-surface-variant mb-3">Didn't find your answer?</p>
          <Link to="/report-bug"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-space-grotesk font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
            <SiteIcon name="support_agent" size={18} />
            Contact Support
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
