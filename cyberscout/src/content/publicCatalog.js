export const learningPathData = {
  'beginner-cybersecurity': {
    title: 'Beginner Cybersecurity Learning Path',
    shortTitle: 'Cybersecurity Foundations',
    summary: 'Start with cybersecurity fundamentals, account safety, phishing analysis, web behaviour and guided defensive reporting.',
    status: 'Available now',
    startingLevel: 'Complete beginner',
    estimatedTime: '7 days to 4 weeks across the current beginner courses',
    items: ['Cybersecurity foundations', 'Phishing and scam analysis', 'Account protection', 'Beginner web security', 'Defensive reporting'],
    courses: [['Cyber Security Essentials', '/courses/cybersecurity/cyber-security-essentials'], ['Introduction to Cyber Security', '/courses/cybersecurity/introduction-to-cyber-security']],
    labs: ['Phishing email analysis', 'Account hardening review', 'Web request inspection', 'Defensive reporting'],
    roles: ['Further study toward junior cybersecurity or SOC work'],
    next: '/courses/cybersecurity/cyber-security-essentials',
  },
  'ethical-hacking': {
    title: 'Web Security Learning Path',
    shortTitle: 'Web Security',
    summary: 'A planned progression from request-response fundamentals to safe input testing and responsible application-security reporting.',
    status: 'Planned',
    startingLevel: 'Cybersecurity foundations required',
    estimatedTime: 'Not published',
    items: ['Authorised testing boundaries', 'HTTP requests and responses', 'Unsafe input awareness', 'Session-security basics', 'Web finding reports'],
    courses: [['Cyber Security Essentials', '/courses/cybersecurity/cyber-security-essentials'], ['Web Application Security Fundamentals', '/courses/cybersecurity/web-application-security']],
    labs: ['Web request inspection', 'Unsafe input observation', 'Session-security review'],
    roles: ['Further study toward application-security or web-testing work'],
    next: '/courses/cybersecurity/cyber-security-essentials',
  },
  'soc-analyst': {
    title: 'SOC Analyst Learning Path',
    shortTitle: 'SOC Analyst',
    summary: 'A planned defensive path covering alert triage, log review, investigation timelines and clear incident notes.',
    status: 'Planned',
    startingLevel: 'Cybersecurity foundations required',
    estimatedTime: 'Not published',
    items: ['Alert triage concepts', 'Log review', 'Investigation timelines', 'Evidence notes', 'Defensive escalation'],
    courses: [['Cyber Security Essentials', '/courses/cybersecurity/cyber-security-essentials'], ['SOC Analyst Foundations', '/courses/cybersecurity/soc-analyst-foundations']],
    labs: ['Phishing analysis', 'Log analysis', 'Defensive incident finding'],
    roles: ['Further study toward junior SOC or cybersecurity analyst work'],
    next: '/courses/cybersecurity/cyber-security-essentials',
  },
  'network-cloud-security': {
    title: 'Cloud Security Learning Path',
    shortTitle: 'Cloud Security',
    summary: 'A planned foundation path connecting networks, identity, access and configuration decisions to cloud risk.',
    status: 'Planned',
    startingLevel: 'Cybersecurity and networking foundations required',
    estimatedTime: 'Not published',
    items: ['Network fundamentals', 'Identity and access basics', 'Cloud configuration review', 'Secure defaults', 'Risk reporting'],
    courses: [['Introduction to Cyber Security', '/courses/cybersecurity/introduction-to-cyber-security']],
    labs: ['Account hardening', 'Network packet review', 'Configuration review'],
    roles: ['Further study toward network or cloud-security work'],
    next: '/courses/cybersecurity/introduction-to-cyber-security',
  },
  'digital-forensics': {
    title: 'Digital Forensics Learning Path',
    shortTitle: 'Digital Forensics',
    summary: 'A planned investigation path covering evidence handling, timelines, digital artefacts and incident documentation.',
    status: 'Planned',
    startingLevel: 'Cybersecurity foundations required',
    estimatedTime: 'Not published',
    items: ['Evidence handling concepts', 'Timeline thinking', 'Digital artefacts', 'Incident notes', 'Responsible escalation'],
    courses: [['Introduction to Cyber Security', '/courses/cybersecurity/introduction-to-cyber-security']],
    labs: ['Evidence review', 'Timeline reconstruction', 'Investigation note writing'],
    roles: ['Further study toward incident-response or digital-forensics support work'],
    next: '/courses/cybersecurity/introduction-to-cyber-security',
  },
}

export const plannedCourses = {
  'web-application-security': { title: 'Web Application Security Fundamentals', level: 'Foundation to intermediate', summary: 'A planned course covering responsible web-security foundations, request-response behaviour, unsafe input and defensive reporting.', topics: ['HTTP request-response basics', 'Unsafe input awareness', 'SQL injection concepts', 'Cross-site scripting concepts', 'Session security', 'Defensive reporting'] },
  'soc-analyst-foundations': { title: 'SOC Analyst Foundations', level: 'Foundation', summary: 'A planned course covering entry-level security operations, alert triage, monitoring context and incident notes.', topics: ['SOC workflow basics', 'Alert triage', 'Log review concepts', 'Incident notes', 'Monitoring fundamentals', 'Defensive escalation'] },
  'ethical-hacking-foundations': { title: 'Ethical Hacking Foundations', level: 'Foundation', summary: 'A planned course covering legal, responsible security testing foundations and beginner-safe vulnerability thinking.', topics: ['Ethics and permission', 'Scope boundaries', 'Reconnaissance awareness', 'Vulnerability basics', 'Safe lab practice', 'Reporting'] },
}

export const publicLabs = {
  'phishing-indicator-analysis': { title: 'Phishing indicator analysis', summary: 'Review message context, sender details and link destinations before documenting the indicators that require defensive action.', evidence: 'A safe email sample, sender information, destination summary and reporting context.', actions: 'Compare the sender, wording and destination without opening unsafe content.', submission: 'A concise phishing finding with evidence and recommended next action.', feedback: 'The guide compares the learner’s observations with the expected indicators.' },
  'account-hardening-review': { title: 'Account hardening review', summary: 'Apply a structured checklist to authentication, recovery options and account settings.', evidence: 'A fictional account configuration and recovery-state summary.', actions: 'Identify weak settings and select practical hardening actions.', submission: 'A prioritised account-hardening checklist.', feedback: 'The guide explains why each setting changes account risk.' },
  'web-request-response-practice': { title: 'Web request-response practice', summary: 'Observe the relationship between a browser request and application response in a guided scenario.', evidence: 'A sanitised request, response status, headers and selected body fields.', actions: 'Identify which values came from the request and how the application responded.', submission: 'A short explanation of the request-response flow and security-relevant fields.', feedback: 'The expected flow is shown with notes for each field.' },
  'network-packet-inspection': { title: 'Network packet inspection', summary: 'Read a guided packet summary and identify protocol, source, destination and relevant evidence.', evidence: 'Sanitised packet metadata from a controlled example.', actions: 'Compare endpoints, protocol and sequence without interacting with a live target.', submission: 'An evidence note stating what the packet shows and what remains unknown.', feedback: 'The guide separates defensible observations from unsupported assumptions.' },
  'log-analysis': { title: 'Log analysis', summary: 'Review selected events, place them in order and identify the evidence worth escalating.', evidence: 'A small, sanitised event set with timestamps and source context.', actions: 'Build a timeline, identify repeated activity and note gaps.', submission: 'A short incident timeline and escalation note.', feedback: 'The expected sequence and relevant indicators are explained.' },
  'unsafe-input-awareness': { title: 'Unsafe input awareness', summary: 'Observe how untrusted input can change application behaviour and document the defensive implication.', evidence: 'A controlled input and application-response example.', actions: 'Compare normal and unexpected input inside the authorised scenario.', submission: 'A foundation-level finding explaining the observed behaviour.', feedback: 'The guide links the behaviour to input validation and safe handling.' },
  'session-security-basics': { title: 'Session security basics', summary: 'Review beginner session risks, secure handling concepts and decisions that reduce exposure.', evidence: 'A fictional session configuration and browser-behaviour summary.', actions: 'Identify settings that affect session lifetime and exposure.', submission: 'A session-risk checklist and practical recommendation.', feedback: 'The guide explains secure defaults without exposing real session secrets.' },
  'defensive-reporting-practice': { title: 'Defensive reporting practice', summary: 'Turn an observation into a concise finding with risk, evidence and a practical recommendation.', evidence: 'A completed observation from a safe beginner scenario.', actions: 'Separate fact from assumption and write for a technical reader.', submission: 'A finding with title, evidence, risk and recommendation.', feedback: 'The report is checked against a clear structure and example wording.' },
}

export const instructorExpertise = ['Cybersecurity Education', 'Vulnerability Assessment and Penetration Testing', 'Web Application Security', 'Cloud Security', 'DevSecOps', 'Security Operations (SOC)', 'Digital Forensics', 'Security Awareness and Training', 'Cybersecurity Curriculum Design', 'AI Applications in Cybersecurity']
export const academicSubjects = ['Ethical Hacking', 'Vulnerability Assessment and Penetration Testing', 'Digital Forensics', 'DevSecOps', 'Cloud Security', 'AI in Cybersecurity', 'Malware Analysis', 'Blockchain Security', 'Network Security']
export const enterpriseEnvironments = ['FIS', 'Deloitte', 'EY', 'Airbus', 'Boeing', 'Amdocs', 'Safran']
export const instructorTimeline = [
  ['Founder and CEO', 'Cyber Lab IN', 'Built a cybersecurity education platform focused on structured training and guided exercises.'],
  ['Cybersecurity practitioner', 'Industry and enterprise environments', 'Worked across vulnerability management, application security, DevSecOps, cloud security and security operations.'],
  ['Assistant Professor and educator', 'Higher-education institutions and universities', 'Taught cybersecurity subjects to technical and non-technical learners.'],
  ['Curriculum designer', 'Practical cybersecurity learning', 'Designed guided learning for ethical hacking, VAPT, forensics, cloud security, DevSecOps and AI in cybersecurity.'],
]
export const authoredCourseLinks = [['Cyber Security Essentials', '/courses/cybersecurity/cyber-security-essentials'], ['Introduction to Cyber Security', '/courses/cybersecurity/introduction-to-cyber-security']]
export const authoredBlogLinks = [['What is cybersecurity?', '/blog/what-is-cybersecurity'], ['What is phishing and how to prevent it?', '/blog/what-is-phishing-and-how-to-prevent-it'], ['What is ethical hacking?', '/blog/what-is-ethical-hacking'], ['How to learn cybersecurity for beginners?', '/blog/how-to-learn-cybersecurity-for-beginners']]
