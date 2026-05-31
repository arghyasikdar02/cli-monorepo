export const courses = [
  {
    id: 'c001',
    title: 'Introduction to Cyber Security',
    category: 'Personal Security',
    level: 'Beginner',
    duration: '7h',
    moduleCount: 7,
    enrolled: true,
    progress: 0,
    currentModule: 1,
    currentLessonId: 'l001_01_01',
    description: 'A 7-day practical course for non-technical learners. Discover your digital footprint, decode scam psychology, harden your accounts, and teach cyber safety to others — no coding knowledge required.',
    instructor: { name: 'Cyber Lab IN Instructor', title: 'Cyber Safety Educator', avatar: null },
    modules: [
      {
        id: 'm001_01', title: 'Your Digital Footprint Audit', order: 1, completed: false,
        lessons: [
          { id: 'l001_01_01', title: 'Digital Footprint Basics', duration: '10m', completed: false },
          { id: 'l001_01_02', title: 'Public Exposure Search', duration: '12m', completed: false },
          { id: 'l001_01_03', title: 'Old Account Audit', duration: '10m', completed: false },
          { id: 'l001_01_04', title: 'Risk Classification of Exposed Data', duration: '10m', completed: false },
          { id: 'l001_01_05', title: 'Exposure Reduction Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm001_02', title: 'Emotional Manipulation Breakdown', order: 2, completed: false,
        lessons: [
          { id: 'l001_02_01', title: 'Scam Psychology Overview', duration: '10m', completed: false },
          { id: 'l001_02_02', title: 'Fear & Urgency Tactics', duration: '8m', completed: false },
          { id: 'l001_02_03', title: 'Authority & Trust Building', duration: '8m', completed: false },
          { id: 'l001_02_04', title: 'Reward & Scarcity Triggers', duration: '8m', completed: false },
          { id: 'l001_02_05', title: 'Social Engineering Patterns', duration: '8m', completed: false },
          { id: 'l001_02_06', title: 'Dissect a Scam Like a Psychologist Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm001_03', title: 'Inbox Forensics', order: 3, completed: false,
        lessons: [
          { id: 'l001_03_01', title: 'Sender Name vs Sender Domain', duration: '10m', completed: false },
          { id: 'l001_03_02', title: 'Link Inspection Without Clicking', duration: '10m', completed: false },
          { id: 'l001_03_03', title: 'Email Tone Analysis', duration: '8m', completed: false },
          { id: 'l001_03_04', title: 'Phishing Indicators', duration: '10m', completed: false },
          { id: 'l001_03_05', title: 'Attachment Red Flags', duration: '8m', completed: false },
          { id: 'l001_03_06', title: 'Investigate Your Own Inbox Lab', duration: '14m', completed: false },
        ]
      },
      {
        id: 'm001_04', title: 'Become the Attacker', order: 4, completed: false,
        lessons: [
          { id: 'l001_04_01', title: 'Social Engineering Structure', duration: '10m', completed: false },
          { id: 'l001_04_02', title: 'Scam Message Components', duration: '8m', completed: false },
          { id: 'l001_04_03', title: 'Target Profiling (Safe & Fictional)', duration: '10m', completed: false },
          { id: 'l001_04_04', title: 'Ethical Boundaries of Simulation', duration: '10m', completed: false },
          { id: 'l001_04_05', title: 'Defensive Awareness Rewrite Lab', duration: '22m', completed: false },
        ]
      },
      {
        id: 'm001_05', title: 'Live Security Makeover', order: 5, completed: false,
        lessons: [
          { id: 'l001_05_01', title: 'Password Weakness & Passphrases', duration: '10m', completed: false },
          { id: 'l001_05_02', title: 'Two-Factor Authentication', duration: '10m', completed: false },
          { id: 'l001_05_03', title: 'Authenticator Apps', duration: '8m', completed: false },
          { id: 'l001_05_04', title: 'Password Managers', duration: '8m', completed: false },
          { id: 'l001_05_05', title: 'Recovery Codes & Session Review', duration: '6m', completed: false },
          { id: 'l001_05_06', title: 'Fix Three Real Accounts Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm001_06', title: 'Scam Hunting in Real Life', order: 6, completed: false,
        lessons: [
          { id: 'l001_06_01', title: 'Phishing, Smishing & Vishing', duration: '10m', completed: false },
          { id: 'l001_06_02', title: 'Quishing & QR Code Scams', duration: '8m', completed: false },
          { id: 'l001_06_03', title: 'WhatsApp & Instagram DM Scams', duration: '8m', completed: false },
          { id: 'l001_06_04', title: 'KYC, Delivery & Job Scams', duration: '10m', completed: false },
          { id: 'l001_06_05', title: 'Red Flag Identification', duration: '6m', completed: false },
          { id: 'l001_06_06', title: 'Find a Scam in the Wild Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm001_07', title: 'Final Mission: Save Someone', order: 7, completed: false,
        lessons: [
          { id: 'l001_07_01', title: 'Teaching Cyber Safety in Simple Language', duration: '10m', completed: false },
          { id: 'l001_07_02', title: 'OTP Scam Awareness', duration: '8m', completed: false },
          { id: 'l001_07_03', title: 'Fake vs Real Links', duration: '8m', completed: false },
          { id: 'l001_07_04', title: 'Privacy Settings Review', duration: '8m', completed: false },
          { id: 'l001_07_05', title: 'Community Cyber Hygiene', duration: '8m', completed: false },
          { id: 'l001_07_06', title: 'Protect a Real Person Lab', duration: '18m', completed: false },
        ]
      },
    ],
    quizId: 'q001',
    tags: ['Scam Awareness', 'Personal Safety', 'Phishing', 'Beginner'],
    rating: 4.8,
  },
  {
    id: 'c002',
    title: 'Cyber Security Essentials',
    category: 'Web Security',
    level: 'Beginner',
    duration: '7h',
    moduleCount: 7,
    enrolled: false,
    progress: 0,
    currentModule: null,
    currentLessonId: null,
    description: 'A 7-day beginner foundation course in practical web security. Explore browsers, servers, databases, HTTP traffic, unsafe input, SQL Injection, XSS, sessions, cookies, misconfigurations, and responsible defensive reporting in safe guided environments.',
    instructor: { name: 'Cyber Lab IN Instructor', title: 'Cyber Security Educator', avatar: null },
    modules: [
      {
        id: 'm002_01', title: 'Web Fundamentals & AI-Assisted Risk Understanding', order: 1, completed: false,
        lessons: [
          { id: 'l002_01_01', title: 'Browser-Server-Database Model', duration: '10m', completed: false },
          { id: 'l002_01_02', title: 'HTTP Request Structure', duration: '12m', completed: false },
          { id: 'l002_01_03', title: 'URL, Methods, Headers & Parameters', duration: '10m', completed: false },
          { id: 'l002_01_04', title: 'Client vs Server-Side Trust', duration: '8m', completed: false },
          { id: 'l002_01_05', title: 'Burp Suite Introduction', duration: '10m', completed: false },
          { id: 'l002_01_06', title: 'AI as a Security Assistant', duration: '8m', completed: false },
          { id: 'l002_01_07', title: 'Intercept & Explain Your Own Web Traffic Lab', duration: '22m', completed: false },
        ]
      },
      {
        id: 'm002_02', title: 'Unsafe Input & AI-Assisted Input Risk Analysis', order: 2, completed: false,
        lessons: [
          { id: 'l002_02_01', title: 'Input Fields & Trust Boundaries', duration: '10m', completed: false },
          { id: 'l002_02_02', title: 'Client-Side vs Server-Side Validation', duration: '10m', completed: false },
          { id: 'l002_02_03', title: 'Normal vs Unexpected Input', duration: '8m', completed: false },
          { id: 'l002_02_04', title: 'Unsafe Input Risks', duration: '8m', completed: false },
          { id: 'l002_02_05', title: 'AI-Assisted Input Classification', duration: '8m', completed: false },
          { id: 'l002_02_06', title: 'Test a Form & Analyze Input Behavior Lab', duration: '16m', completed: false },
        ]
      },
      {
        id: 'm002_03', title: 'SQL Injection & AI-Assisted Query Risk', order: 3, completed: false,
        lessons: [
          { id: 'l002_03_01', title: 'Database & Query Concepts', duration: '10m', completed: false },
          { id: 'l002_03_02', title: 'Login Form Logic', duration: '8m', completed: false },
          { id: 'l002_03_03', title: 'SQL Injection Concept', duration: '10m', completed: false },
          { id: 'l002_03_04', title: 'Login Bypass Demonstration', duration: '8m', completed: false },
          { id: 'l002_03_05', title: 'Parameterized Queries & Least Privilege', duration: '10m', completed: false },
          { id: 'l002_03_06', title: 'AI-Assisted SQLi Explanation', duration: '6m', completed: false },
          { id: 'l002_03_07', title: 'SQL Injection Login Bypass Simulation Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm002_04', title: 'Cross-Site Scripting & Browser Risk Analysis', order: 4, completed: false,
        lessons: [
          { id: 'l002_04_01', title: 'JavaScript Basics for Security', duration: '8m', completed: false },
          { id: 'l002_04_02', title: 'Text vs Executable Code', duration: '8m', completed: false },
          { id: 'l002_04_03', title: 'Reflected XSS', duration: '8m', completed: false },
          { id: 'l002_04_04', title: 'Stored XSS', duration: '8m', completed: false },
          { id: 'l002_04_05', title: 'Output Encoding & Sanitization', duration: '8m', completed: false },
          { id: 'l002_04_06', title: 'Content Security Policy Awareness', duration: '6m', completed: false },
          { id: 'l002_04_07', title: 'AI-Assisted XSS Analysis', duration: '6m', completed: false },
          { id: 'l002_04_08', title: 'XSS Demonstration in Safe Demo Page Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm002_05', title: 'Authentication, Sessions & Account Security', order: 5, completed: false,
        lessons: [
          { id: 'l002_05_01', title: 'Authentication vs Session', duration: '10m', completed: false },
          { id: 'l002_05_02', title: 'Cookies & Session IDs', duration: '8m', completed: false },
          { id: 'l002_05_03', title: 'Tokens & Login Persistence', duration: '8m', completed: false },
          { id: 'l002_05_04', title: 'Secure, HttpOnly & SameSite Flags', duration: '8m', completed: false },
          { id: 'l002_05_05', title: 'Logout Behavior', duration: '6m', completed: false },
          { id: 'l002_05_06', title: 'AI-Assisted Account Security Checklist', duration: '8m', completed: false },
          { id: 'l002_05_07', title: 'Observe Sessions & Build Security Checklist Lab', duration: '22m', completed: false },
        ]
      },
      {
        id: 'm002_06', title: 'Misconfigurations & Secure Deployment Awareness', order: 6, completed: false,
        lessons: [
          { id: 'l002_06_01', title: 'Exposed Admin Panels & APIs', duration: '8m', completed: false },
          { id: 'l002_06_02', title: 'Debug Endpoints & Default Credentials', duration: '8m', completed: false },
          { id: 'l002_06_03', title: 'Directory Listing & Backup Files', duration: '8m', completed: false },
          { id: 'l002_06_04', title: 'Detailed Error Messages', duration: '6m', completed: false },
          { id: 'l002_06_05', title: 'AI Risk Classification', duration: '8m', completed: false },
          { id: 'l002_06_06', title: 'Find Weak Configs & Generate Deployment Checklist Lab', duration: '22m', completed: false },
        ]
      },
      {
        id: 'm002_07', title: 'AI-Assisted Final Security Review', order: 7, completed: false,
        lessons: [
          { id: 'l002_07_01', title: 'Attacker vs Defender Mindset', duration: '8m', completed: false },
          { id: 'l002_07_02', title: 'Vulnerability vs Risk', duration: '8m', completed: false },
          { id: 'l002_07_03', title: 'Input Validation & Output Encoding', duration: '8m', completed: false },
          { id: 'l002_07_04', title: 'Secure Session Handling & Access Control', duration: '8m', completed: false },
          { id: 'l002_07_05', title: 'AI-Assisted Reporting', duration: '8m', completed: false },
          { id: 'l002_07_06', title: 'Responsible Disclosure', duration: '6m', completed: false },
          { id: 'l002_07_07', title: 'AI-Assisted Security Review of Demo App Lab', duration: '24m', completed: false },
        ]
      },
    ],
    quizId: 'q002',
    tags: ['Web Security', 'HTTP', 'SQL Injection', 'XSS', 'Burp Suite'],
    rating: 4.7,
  },
]

export const getCourseById = (id) => courses.find(c => c.id === id) ?? null

export const getLessonById = (lessonId) => {
  for (const course of courses) {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find(l => l.id === lessonId)
      if (lesson) return { ...lesson, courseId: course.id, moduleId: mod.id, moduleTitle: mod.title }
    }
  }
  return null
}

export const getAdjacentLesson = (courseId, lessonId, direction) => {
  const course = getCourseById(courseId)
  if (!course) return null
  const allLessons = course.modules.flatMap(m => m.lessons)
  const idx = allLessons.findIndex(l => l.id === lessonId)
  if (idx === -1) return null
  const next = direction === 'next' ? allLessons[idx + 1] : allLessons[idx - 1]
  return next ?? null
}
