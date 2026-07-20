import PublicLegalPage from '../../components/site/PublicLegalPage'

const SECTIONS = [
  { title: 'Acceptance of Terms', content: 'By accessing or using Cyber Lab IN, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.' },
  { title: 'Description of Service', content: 'Cyber Lab IN provides an online cybersecurity education platform including courses, labs, Cysensei, live classes, and community features. Features may change without notice.' },
  { title: 'User Accounts', content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.' },
  { title: 'Acceptable Use', content: 'The platform is for authorized educational use only. You may not use Cyber Lab IN to conduct unauthorized security testing on external systems, share credentials, circumvent access controls, or violate any applicable laws.' },
  { title: 'Intellectual Property', content: 'All course content, branding, and platform technology are owned by Cyber Lab IN. You receive a limited, non-transferable license to access content for personal educational purposes.' },
  { title: 'Payment and Refunds', content: 'Subscription fees are billed in advance. See our Refund Policy for eligibility and procedures. We reserve the right to modify pricing with 30 days notice.' },
  { title: 'Termination', content: 'We may suspend or terminate accounts that violate these terms. You may cancel your account at any time. Upon termination, your right to access the service ceases immediately.' },
  { title: 'Limitation of Liability', content: 'Cyber Lab IN is provided "as is". We are not liable for indirect, incidental, or consequential damages arising from your use of the service, to the maximum extent permitted by law.' },
]

export default function TermsOfServicePage() {
  return (
    <PublicLegalPage title="Terms of service" description="The terms that govern account access, educational use, payments, content and acceptable behaviour on Cyber Lab IN." updated="Last updated: 10 June 2026" sections={SECTIONS} />
  )
}
