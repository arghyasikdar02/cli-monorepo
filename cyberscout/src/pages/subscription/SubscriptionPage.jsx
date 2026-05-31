import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { useAppStore } from '../../store/useAppStore'
import { currentPlan } from '../../data/billing'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Start your cybersecurity journey.',
    features: ['5 starter courses', 'Community access', 'Basic labs', 'Email support'],
    cta: 'Current Plan',
    active: false,
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: '/month',
    desc: 'Full access for serious learners.',
    features: ['Unlimited courses', 'AI Tutor access', 'Live classes', 'Certificates', 'Offline downloads', 'Priority support'],
    cta: 'Upgrade to Pro',
    active: true,
    highlight: true,
  },
  {
    name: 'Team',
    price: '$19.99',
    period: '/seat/month',
    desc: 'For security teams of 5+.',
    features: ['Everything in Pro', 'Team analytics', 'Custom learning paths', 'Dedicated success manager', 'SSO & SCIM', 'Invoice billing'],
    cta: 'Contact Sales',
    active: false,
  },
]

export default function SubscriptionPage() {
  const { user, updateUser } = useAppStore()

  const handleUpgrade = () => {
    updateUser({ isPro: true })
  }

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="font-space-grotesk text-3xl font-black text-primary mb-2">Choose Your Path</h1>
          <p className="text-on-surface-variant">Invest in your cybersecurity career. Cancel anytime.</p>
        </div>

        {/* Current plan banner */}
        {user?.isPro && (
          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-5 flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <div>
                <p className="font-space-grotesk font-bold text-on-surface">You're on the Pro plan</p>
                <p className="text-sm text-on-surface-variant">Renews {currentPlan.renewsOn} · {currentPlan.price}</p>
              </div>
            </div>
            <Link to="/billing/history" className="text-sm font-bold text-secondary hover:underline font-space-grotesk">
              Billing History
            </Link>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          {PLANS.map(plan => (
            <div key={plan.name}
              className={`bg-white rounded-2xl border p-7 flex flex-col relative overflow-hidden ${plan.highlight ? 'border-2 border-secondary shadow-xl' : 'border-slate-200 shadow-card'}`}>
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-secondary" />
              )}
              {plan.highlight && (
                <span className="absolute top-5 right-5 bg-secondary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide font-space-grotesk">
                  Most Popular
                </span>
              )}
              <div className="mb-6">
                <h2 className="font-space-grotesk text-lg font-bold text-on-surface mb-1">{plan.name}</h2>
                <p className="text-on-surface-variant text-sm">{plan.desc}</p>
              </div>
              <div className="mb-6">
                <span className="font-space-grotesk text-4xl font-black text-primary">{plan.price}</span>
                <span className="text-on-surface-variant text-sm ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={plan.name === 'Pro' ? handleUpgrade : undefined}
                className={`w-full py-3.5 rounded-xl font-space-grotesk font-bold text-sm transition-all ${
                  plan.highlight
                    ? 'bg-secondary text-white hover:opacity-90 active:scale-[0.98] shadow-lg'
                    : 'border-2 border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                }`}>
                {user?.isPro && plan.name === 'Pro' ? 'Current Plan' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-space-grotesk font-bold text-primary text-center mb-6">Common Questions</h2>
          {[
            ['Can I cancel anytime?', 'Yes. Cancel anytime from your billing settings. You keep Pro access until the end of your billing period.'],
            ['Is there a free trial?', 'All paid plans include a 7-day free trial. No credit card required to start.'],
            ['What payment methods are accepted?', 'We accept all major credit/debit cards and PayPal. Teams can request invoice billing.'],
          ].map(([q, a]) => (
            <div key={q} className="py-4 border-b border-slate-200">
              <p className="font-space-grotesk font-semibold text-on-surface text-sm mb-1">{q}</p>
              <p className="text-on-surface-variant text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
