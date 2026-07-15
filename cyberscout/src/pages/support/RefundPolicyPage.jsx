import { Link } from 'react-router-dom'
import PublicLegalPage from '../../components/site/PublicLegalPage'

const SECTIONS = [
  { title: 'Eligibility', content: 'You may request a full refund within 7 days of your initial purchase or subscription renewal if you have not accessed more than 20% of course content during that period.' },
  { title: 'How to Request a Refund', content: 'Submit a refund request via the billing section of your account settings or email billing@cyberlabin.com. Include your account email and order reference. We process requests within 5 business days.' },
  { title: 'Non-Refundable Items', content: 'Certificates, one-time lab credits, and promotional purchases are non-refundable. Partial months are not refunded when you cancel mid-cycle; you retain access until the end of the paid period.' },
  { title: 'Processing Time', content: 'Approved refunds are returned to your original payment method within 5 to 10 business days depending on your bank or card issuer.' },
  { title: 'Exceptional Circumstances', content: 'We consider refunds outside the standard window for documented technical issues that prevented access, billing errors, or other exceptional circumstances at our discretion.' },
]

export default function RefundPolicyPage() {
  return (
    <PublicLegalPage title="Refund policy" description="Eligibility, request steps and processing information for Cyber Lab IN purchases and subscription renewals." updated="Last updated: 10 June 2026" sections={SECTIONS}>
      <div className="legal-action"><p>Account holders can open billing settings after login.</p><Link to="/auth?mode=login&redirect=%2Fsettings%3Ftab%3Daccount">Go to billing settings</Link></div>
    </PublicLegalPage>
  )
}
