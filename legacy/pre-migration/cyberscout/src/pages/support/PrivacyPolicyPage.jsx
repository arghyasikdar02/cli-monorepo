import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'

const SECTIONS = [
  { title: 'Information We Collect', content: 'We collect information you provide directly (name, email, payment info) and automatically (usage data, device info, cookies). We use this to operate the platform, personalize your experience, and improve our services.' },
  { title: 'How We Use Your Data', content: 'Your data is used to provide and improve CyberScout services, process payments, send service communications, and fulfill legal obligations. We do not sell your personal data to third parties.' },
  { title: 'Data Sharing', content: 'We share data with service providers (payment processors, hosting, analytics) under strict data processing agreements. We may disclose data when required by law or to protect rights and safety.' },
  { title: 'Your Rights', content: 'Depending on your location, you may have rights to access, correct, delete, or port your data. To exercise these rights, contact privacy@cyberscout.edu. We respond within 30 days.' },
  { title: 'Cookies', content: 'We use essential cookies for site functionality and analytics cookies (with your consent) to understand usage. You can manage cookie preferences in your browser settings.' },
  { title: 'Data Retention', content: 'We retain account data for the duration of your account plus 30 days after deletion. Payment records are retained for 7 years for tax compliance. Logs are retained for 90 days.' },
  { title: 'Security', content: 'We implement industry-standard security measures including TLS encryption, AES-256 storage encryption, and regular security audits. No method is 100% secure, but we continuously improve our protections.' },
  { title: 'Changes to This Policy', content: 'We may update this policy and will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance.' },
]

export default function PrivacyPolicyPage() {
  return (
    <AppShell>
      <div className="max-w-[760px] mx-auto px-8 py-8">
        <h1 className="font-space-grotesk text-2xl font-black text-primary mb-1">Privacy Policy</h1>
        <p className="text-on-surface-variant text-sm mb-8">Last updated: October 1, 2023</p>
        <div className="space-y-7">
          {SECTIONS.map(s => (
            <div key={s.title}>
              <h2 className="font-space-grotesk font-bold text-on-surface mb-2">{s.title}</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 flex gap-4 text-sm">
          <Link to="/terms" className="text-secondary hover:underline font-space-grotesk">Terms of Service</Link>
          <Link to="/refund" className="text-secondary hover:underline font-space-grotesk">Refund Policy</Link>
        </div>
      </div>
    </AppShell>
  )
}
