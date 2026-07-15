export const learningSteps = [
  ['01', 'Learn', 'Understand phishing, accounts, web requests or another security concept in plain language.'],
  ['02', 'Observe', 'Review the supplied email, link, request, log entry or configuration evidence.'],
  ['03', 'Investigate', 'Compare indicators, record what is relevant and stay within the authorised lab scope.'],
  ['04', 'Report', 'Write a concise finding that explains the evidence, risk and recommended defensive action.'],
]

export const sampleLabs = [
  ['Phishing email analysis', 'Inspect the sender, request language and link destination, then document the indicators that make the message suspicious.', '/labs/phishing-indicator-analysis'],
  ['Account security hardening', 'Review authentication, recovery and MFA settings against a practical account-safety checklist.', '/labs/account-hardening-review'],
  ['Web request inspection', 'Compare a browser request with the application response and identify the fields that influence behaviour.', '/labs/web-request-response-practice'],
  ['Network packet inspection', 'Read a guided packet summary and identify source, destination, protocol and the evidence worth escalating.', '/labs/network-packet-inspection'],
  ['Log analysis', 'Place selected events in order, distinguish useful evidence from noise and write an investigation note.', '/labs/log-analysis'],
  ['Defensive security finding', 'Turn an observation into a report with a clear title, evidence, risk statement and practical recommendation.', '/labs/defensive-reporting-practice'],
]

export const learningPaths = [
  ['Cybersecurity Foundations', 'Available now', 'Beginner', 'Start with account safety, phishing analysis, network basics and defensive reporting.', '/learning-paths/beginner-cybersecurity'],
  ['SOC Analyst', 'Planned', 'Foundation required', 'Build alert-triage, evidence-note and investigation-timeline skills after the beginner course.', '/learning-paths/soc-analyst'],
  ['Web Security', 'Planned', 'Foundation required', 'Study request-response behaviour, unsafe input and responsible web-security reporting.', '/learning-paths/ethical-hacking'],
  ['Cloud Security', 'Planned', 'Foundation required', 'Connect identity, access and configuration decisions to practical cloud risk.', '/learning-paths/network-cloud-security'],
  ['Digital Forensics', 'Planned', 'Foundation required', 'Develop evidence-handling, timeline and incident-documentation foundations.', '/learning-paths/digital-forensics'],
]

export const homepageFaqs = [
  ['Is this course suitable for complete beginners?', 'Yes. Cyber Security Essentials starts with basic security ideas and requires only ordinary computer and internet knowledge.'],
  ['Are the classes live or recorded?', 'The published course mode is online. Live-class and recording details are attached to a course and batch when they are scheduled. Confirm the current delivery plan before enrolment.'],
  ['What practical labs are included?', 'The course covers phishing analysis, account hardening, web request inspection, unsafe-input awareness, session security and defensive reporting.'],
  ['Do I need programming experience?', 'No programming prerequisite is listed for Cyber Security Essentials. Basic computer and internet knowledge is enough to begin.'],
  ['Is there a certificate?', 'The published course includes a Certificate of Completion after the required course work is finished.'],
  ['How long does the course take?', 'Cyber Security Essentials is currently structured as a focused seven-day beginner course.'],
  ['What happens after enrolment?', 'Your account receives course access. The learner dashboard then shows the lessons, protected materials, labs and progress attached to that enrolment.'],
]

export const featuredCourseFallback = {
  id: 'c002',
  slug: 'cyber-security-essentials',
  categorySlug: 'cybersecurity',
  title: 'Cyber Security Essentials',
  level: 'Beginner',
  duration: '7 days',
  mode: 'Online',
  credential: 'Certificate of Completion',
  prerequisites: 'Basic computer and internet knowledge',
  instructorName: 'Arghya Sikdar',
  lessonCount: 3,
  moduleCount: 2,
  labs: [
    'Digital footprint review',
    'Phishing indicator analysis',
    'Account hardening checklist',
    'Web request-response practice',
    'Unsafe input observation',
    'SQL Injection awareness lab',
    'XSS awareness lab',
    'Session security basics',
    'Misconfiguration review',
    'Defensive reporting practice',
  ],
  description: 'A beginner course covering phishing analysis, account hardening, web security foundations and defensive reporting through guided practice.',
}
