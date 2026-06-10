import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'

const SECTIONS = [
  { title: 'Acceptance of Terms', content: 'By accessing or using Cyber Lab IN, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.' },
  { title: 'Description of Service', content: 'Cyber Lab IN provides an online cybersecurity education platform including courses, labs, AI tutoring, live classes, and community features. Features may change without notice.' },
  { title: 'User Accounts', content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.' },
  { title: 'Acceptable Use', content: 'The platform is for authorized educational use only. You may not use Cyber Lab IN to conduct unauthorized security testing on external systems, share credentials, circumvent access controls, or violate any applicable laws.' },
  { title: 'Intellectual Property', content: 'All course content, branding, and platform technology are owned by Cyber Lab IN. You receive a limited, non-transferable license to access content for personal educational purposes.' },
  { title: 'Payment and Refunds', content: 'Subscription fees are billed in advance. See our Refund Policy for eligibility and procedures. We reserve the right to modify pricing with 30 days notice.' },
  { title: 'Termination', content: 'We may suspend or terminate accounts that violate these terms. You may cancel your account at any time. Upon termination, your right to access the service ceases immediately.' },
  { title: 'Limitation of Liability', content: 'Cyber Lab IN is provided "as is". We are not liable for indirect, incidental, or consequential damages arising from your use of the service, to the maximum extent permitted by law.' },
]

export default function TermsOfServicePage() {
  return (
    <AppShell>
      <div className="max-w-[760px] mx-auto px-8 py-8">
        <h1 className="font-space-grotesk text-2xl font-black text-primary mb-1">Terms of Service</h1>
        <p className="text-on-surface-variant text-sm mb-8">Last updated: June 10, 2026</p>
        <div className="space-y-7">
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 className="font-space-grotesk font-bold text-on-surface mb-2">{s.title}</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 flex gap-4 text-sm">
          <Link to="/privacy-policy" className="text-secondary hover:underline font-space-grotesk">Privacy Policy</Link>
          <Link to="/refund-policy" className="text-secondary hover:underline font-space-grotesk">Refund Policy</Link>
        </div>
      </div>
    </AppShell>
  )
}
