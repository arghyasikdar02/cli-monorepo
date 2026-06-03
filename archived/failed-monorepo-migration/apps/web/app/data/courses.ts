export const courses = [
  {
    slug: 'introduction-to-cyber-security',
    title: 'Introduction to Cyber Security',
    level: 'Beginner',
    duration: '7 days',
    description:
      'Build core cyber awareness, digital footprint auditing, scam psychology, phishing indicators, account hardening, and everyday cyber safety habits through guided practice.',
    outcomes: [
      'Audit your own digital footprint',
      'Identify emotional manipulation in scams',
      'Inspect suspicious email and message patterns',
      'Harden account security with practical checklists',
      'Explain cyber safety to another person clearly',
    ],
    tags: ['Beginner', 'Labs', 'Certificate'],
  },
  {
    slug: 'web-security-ai-abuse-defense',
    title: 'Web Security & AI Abuse Defense',
    level: 'Beginner to Intermediate',
    duration: '7 days',
    description:
      'Learn web request-response basics, unsafe input, SQL injection, XSS, session security, misconfigurations, AI-assisted abuse patterns, and defensive reporting.',
    outcomes: [
      'Understand browser, server, database, and HTTP boundaries',
      'Classify unsafe input and validation risks',
      'Explain SQL injection and XSS defensively',
      'Review session and cookie security',
      'Use AI as a scoped security assistant without leaking context',
    ],
    tags: ['Web Security', 'AI', 'Hands-On'],
  },
] as const;

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}

