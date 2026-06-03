export const billingTransactions = [
  { id: 'b001', date: 'Oct 1, 2023', description: 'CyberScout Pro - Monthly', amount: '$29.99', status: 'paid', invoice: 'INV-2023-010' },
  { id: 'b002', date: 'Sep 1, 2023', description: 'CyberScout Pro - Monthly', amount: '$29.99', status: 'paid', invoice: 'INV-2023-009' },
  { id: 'b003', date: 'Aug 1, 2023', description: 'CyberScout Pro - Monthly', amount: '$29.99', status: 'paid', invoice: 'INV-2023-008' },
  { id: 'b004', date: 'Jul 1, 2023', description: 'CyberScout Pro - Monthly', amount: '$29.99', status: 'paid', invoice: 'INV-2023-007' },
  { id: 'b005', date: 'Jun 15, 2023', description: 'CyberScout Pro - Annual (prorated)', amount: '$299.99', status: 'paid', invoice: 'INV-2023-006' },
  { id: 'b006', date: 'Jun 10, 2023', description: 'CyberScout Free Trial Conversion', amount: '$0.00', status: 'paid', invoice: 'INV-2023-005' },
]

export const currentPlan = {
  name: 'Pro',
  price: '$29.99/mo',
  renewsOn: 'Nov 1, 2023',
  features: ['Unlimited courses', 'AI Tutor access', 'Live classes', 'Certificates', 'Offline downloads', 'Priority support'],
}
