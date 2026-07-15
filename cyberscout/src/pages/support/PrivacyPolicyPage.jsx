import PublicLegalPage from '../../components/site/PublicLegalPage'

const SECTIONS = [
  { title: 'Information We Collect', content: 'We collect information you provide directly (name, email, payment info) and automatically (usage data, device info, cookies). We use this to operate the platform, personalize your experience, and improve our services.' },
  { title: 'How We Use Your Data', content: 'Your data is used to provide and improve Cyber Lab IN services, process payments, send service communications, and fulfill legal obligations. We do not sell your personal data to third parties.' },
  { title: 'Data Sharing', content: 'We share data with service providers (payment processors, hosting, analytics) under strict data processing agreements. We may disclose data when required by law or to protect rights and safety.' },
  { title: 'Your Rights', content: 'Depending on your location, you may have rights to access, correct, delete, or port your data. To exercise these rights, contact privacy@cyberlabin.com. We respond within 30 days.' },
  { title: 'Cookies', content: 'We use essential cookies for site functionality and analytics cookies (with your consent) to understand usage. You can manage cookie preferences in your browser settings.' },
  { title: 'Data Retention', content: 'We retain account data for the duration of your account plus 30 days after deletion. Payment records are retained for 7 years for tax compliance. Logs are retained for 90 days.' },
  { title: 'Security', content: 'We use production-oriented security controls such as TLS in transit, access controls, password hashing, audit logging where implemented, and ongoing review. No method is 100% secure, but we continuously improve our protections.' },
  { title: 'Changes to This Policy', content: 'We may update this policy and will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance.' },
]

export default function PrivacyPolicyPage() {
  return (
    <PublicLegalPage title="Privacy policy" description="How Cyber Lab IN collects, uses, protects and retains personal information across the public website and learning platform." updated="Last updated: 10 June 2026" sections={SECTIONS} />
  )
}
