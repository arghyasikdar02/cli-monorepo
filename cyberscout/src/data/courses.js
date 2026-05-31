export const courses = [
  {
    id: 'c001',
    title: 'Network Security Fundamentals',
    category: 'Network Defense',
    level: 'Beginner',
    duration: '6.5h',
    moduleCount: 12,
    enrolled: true,
    progress: 65,
    currentModule: 4,
    currentLessonId: 'l001_04_02',
    description: 'Master the fundamentals of network security, from OSI model to firewall orchestration. Build a solid foundation for your cybersecurity career.',
    instructor: { name: 'Dr. Elias Thorne', title: 'Senior Security Architect', avatar: null },
    modules: [
      {
        id: 'm001_01', title: 'Introduction to Networking', order: 1, completed: true,
        lessons: [
          { id: 'l001_01_01', title: 'OSI Model Overview', duration: '12m', completed: true },
          { id: 'l001_01_02', title: 'TCP/IP Deep Dive', duration: '18m', completed: true },
          { id: 'l001_01_03', title: 'Subnetting Basics', duration: '15m', completed: true },
        ]
      },
      {
        id: 'm001_02', title: 'Network Protocols', order: 2, completed: true,
        lessons: [
          { id: 'l001_02_01', title: 'DNS & DHCP', duration: '14m', completed: true },
          { id: 'l001_02_02', title: 'HTTP/S and TLS', duration: '20m', completed: true },
        ]
      },
      {
        id: 'm001_03', title: 'Packet Analysis', order: 3, completed: true,
        lessons: [
          { id: 'l001_03_01', title: 'Wireshark Fundamentals', duration: '22m', completed: true },
          { id: 'l001_03_02', title: 'Traffic Analysis Lab', duration: '30m', completed: true },
        ]
      },
      {
        id: 'm001_04', title: 'Firewall Orchestration', order: 4, completed: false,
        lessons: [
          { id: 'l001_04_01', title: 'Stateful Inspection', duration: '14m', completed: true },
          { id: 'l001_04_02', title: 'ACL Configuration', duration: '20m', completed: false },
          { id: 'l001_04_03', title: 'DMZ Architecture', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm001_05', title: 'Intrusion Detection', order: 5, completed: false,
        lessons: [
          { id: 'l001_05_01', title: 'IDS vs IPS', duration: '16m', completed: false },
          { id: 'l001_05_02', title: 'Snort Configuration', duration: '25m', completed: false },
        ]
      },
    ],
    quizId: 'q001',
    tags: ['Network', 'Fundamentals', 'Firewall'],
    rating: 4.8,
    students: 2400,
  },
  {
    id: 'c002',
    title: 'Advanced Pentesting Techniques',
    category: 'Penetration Testing',
    level: 'Advanced',
    duration: '4.5h',
    moduleCount: 8,
    enrolled: true,
    progress: 20,
    currentModule: 1,
    currentLessonId: 'l002_01_02',
    description: 'Deep-dive into professional penetration testing methodologies. Learn reconnaissance, exploitation, and reporting.',
    instructor: { name: 'Marcus Volkov', title: 'Lead Penetration Tester', avatar: null },
    modules: [
      {
        id: 'm002_01', title: 'Reconnaissance', order: 1, completed: false,
        lessons: [
          { id: 'l002_01_01', title: 'OSINT Techniques', duration: '20m', completed: true },
          { id: 'l002_01_02', title: 'Nmap Mastery', duration: '28m', completed: false },
        ]
      },
      {
        id: 'm002_02', title: 'Exploitation Basics', order: 2, completed: false,
        lessons: [
          { id: 'l002_02_01', title: 'Metasploit Framework', duration: '35m', completed: false },
          { id: 'l002_02_02', title: 'Buffer Overflows', duration: '40m', completed: false },
        ]
      },
    ],
    quizId: 'q002',
    tags: ['Pentesting', 'Metasploit', 'OSINT'],
    rating: 4.9,
    students: 1800,
  },
  {
    id: 'c003',
    title: 'Cloud Security Architectures',
    category: 'Cloud Security',
    level: 'Intermediate',
    duration: '8.2h',
    moduleCount: 10,
    enrolled: false,
    progress: 0,
    currentModule: null,
    currentLessonId: null,
    description: 'Secure cloud environments across AWS, Azure, and GCP. Identity management, encryption, and compliance.',
    instructor: { name: 'Sarah Jenkins', title: 'Cloud Security Engineer', avatar: null },
    modules: [
      {
        id: 'm003_01', title: 'Cloud Fundamentals', order: 1, completed: false,
        lessons: [
          { id: 'l003_01_01', title: 'Shared Responsibility Model', duration: '18m', completed: false },
          { id: 'l003_01_02', title: 'IAM Best Practices', duration: '22m', completed: false },
        ]
      },
    ],
    quizId: 'q003',
    tags: ['Cloud', 'AWS', 'Azure', 'Compliance'],
    rating: 4.7,
    students: 3200,
  },
  {
    id: 'c004',
    title: 'Incident Response & Forensics',
    category: 'Incident Response',
    level: 'Intermediate',
    duration: '5.8h',
    moduleCount: 7,
    enrolled: false,
    progress: 0,
    currentModule: null,
    currentLessonId: null,
    description: 'Respond to breaches effectively. Evidence collection, chain of custody, SIEM analysis, and post-incident reporting.',
    instructor: { name: 'Dr. Elias Thorne', title: 'DFIR Specialist', avatar: null },
    modules: [
      {
        id: 'm004_01', title: 'IR Fundamentals', order: 1, completed: false,
        lessons: [
          { id: 'l004_01_01', title: 'IR Lifecycle', duration: '15m', completed: false },
        ]
      },
    ],
    quizId: 'q004',
    tags: ['Forensics', 'SIEM', 'IR'],
    rating: 4.6,
    students: 950,
  },
  {
    id: 'c005',
    title: 'Web Application Security',
    category: 'Application Security',
    level: 'Intermediate',
    duration: '7.1h',
    moduleCount: 9,
    enrolled: false,
    progress: 0,
    currentModule: null,
    currentLessonId: null,
    description: 'Master OWASP Top 10, SQL injection, XSS, CSRF and secure coding practices for modern web apps.',
    instructor: { name: 'Jasmine Lowe', title: 'AppSec Engineer', avatar: null },
    modules: [
      {
        id: 'm005_01', title: 'OWASP Top 10', order: 1, completed: false,
        lessons: [
          { id: 'l005_01_01', title: 'Injection Attacks', duration: '20m', completed: false },
        ]
      },
    ],
    quizId: 'q005',
    tags: ['OWASP', 'XSS', 'SQLi', 'Web'],
    rating: 4.8,
    students: 4100,
  },
  {
    id: 'c006',
    title: 'Zero Trust Architecture',
    category: 'Network Defense',
    level: 'Advanced',
    duration: '6.0h',
    moduleCount: 8,
    enrolled: false,
    progress: 0,
    currentModule: null,
    currentLessonId: null,
    description: 'Implement Zero Trust principles across identity, devices, networks, and workloads in enterprise environments.',
    instructor: { name: 'Marcus Volkov', title: 'Enterprise Architect', avatar: null },
    modules: [
      {
        id: 'm006_01', title: 'Zero Trust Principles', order: 1, completed: false,
        lessons: [
          { id: 'l006_01_01', title: 'Never Trust, Always Verify', duration: '18m', completed: false },
        ]
      },
    ],
    quizId: 'q006',
    tags: ['Zero Trust', 'Identity', 'MFA'],
    rating: 4.9,
    students: 1200,
  },
  {
    id: 'c007',
    title: 'Practical Cyber Safety and Scam Awareness',
    category: 'Personal Security',
    level: 'Beginner',
    duration: '7h',
    moduleCount: 7,
    enrolled: false,
    progress: 0,
    currentModule: null,
    currentLessonId: null,
    description: 'A 7-day practical course for non-technical learners. Discover your digital footprint, decode scam psychology, harden your accounts, and teach cyber safety to others — no coding knowledge required.',
    instructor: { name: 'CyberScout Instructor', title: 'Cyber Safety Educator', avatar: null },
    modules: [
      {
        id: 'm007_01', title: 'Your Digital Footprint Audit', order: 1, completed: false,
        lessons: [
          { id: 'l007_01_01', title: 'Digital Footprint Basics', duration: '10m', completed: false },
          { id: 'l007_01_02', title: 'Public Exposure Search', duration: '12m', completed: false },
          { id: 'l007_01_03', title: 'Old Account Audit', duration: '10m', completed: false },
          { id: 'l007_01_04', title: 'Risk Classification of Exposed Data', duration: '10m', completed: false },
          { id: 'l007_01_05', title: 'Exposure Reduction Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm007_02', title: 'Emotional Manipulation Breakdown', order: 2, completed: false,
        lessons: [
          { id: 'l007_02_01', title: 'Scam Psychology Overview', duration: '10m', completed: false },
          { id: 'l007_02_02', title: 'Fear & Urgency Tactics', duration: '8m', completed: false },
          { id: 'l007_02_03', title: 'Authority & Trust Building', duration: '8m', completed: false },
          { id: 'l007_02_04', title: 'Reward & Scarcity Triggers', duration: '8m', completed: false },
          { id: 'l007_02_05', title: 'Social Engineering Patterns', duration: '8m', completed: false },
          { id: 'l007_02_06', title: 'Dissect a Scam Like a Psychologist Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm007_03', title: 'Inbox Forensics', order: 3, completed: false,
        lessons: [
          { id: 'l007_03_01', title: 'Sender Name vs Sender Domain', duration: '10m', completed: false },
          { id: 'l007_03_02', title: 'Link Inspection Without Clicking', duration: '10m', completed: false },
          { id: 'l007_03_03', title: 'Email Tone Analysis', duration: '8m', completed: false },
          { id: 'l007_03_04', title: 'Phishing Indicators', duration: '10m', completed: false },
          { id: 'l007_03_05', title: 'Attachment Red Flags', duration: '8m', completed: false },
          { id: 'l007_03_06', title: 'Investigate Your Own Inbox Lab', duration: '14m', completed: false },
        ]
      },
      {
        id: 'm007_04', title: 'Become the Attacker', order: 4, completed: false,
        lessons: [
          { id: 'l007_04_01', title: 'Social Engineering Structure', duration: '10m', completed: false },
          { id: 'l007_04_02', title: 'Scam Message Components', duration: '8m', completed: false },
          { id: 'l007_04_03', title: 'Target Profiling (Safe & Fictional)', duration: '10m', completed: false },
          { id: 'l007_04_04', title: 'Ethical Boundaries of Simulation', duration: '10m', completed: false },
          { id: 'l007_04_05', title: 'Defensive Awareness Rewrite Lab', duration: '22m', completed: false },
        ]
      },
      {
        id: 'm007_05', title: 'Live Security Makeover', order: 5, completed: false,
        lessons: [
          { id: 'l007_05_01', title: 'Password Weakness & Passphrases', duration: '10m', completed: false },
          { id: 'l007_05_02', title: 'Two-Factor Authentication', duration: '10m', completed: false },
          { id: 'l007_05_03', title: 'Authenticator Apps', duration: '8m', completed: false },
          { id: 'l007_05_04', title: 'Password Managers', duration: '8m', completed: false },
          { id: 'l007_05_05', title: 'Recovery Codes & Session Review', duration: '6m', completed: false },
          { id: 'l007_05_06', title: 'Fix Three Real Accounts Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm007_06', title: 'Scam Hunting in Real Life', order: 6, completed: false,
        lessons: [
          { id: 'l007_06_01', title: 'Phishing, Smishing & Vishing', duration: '10m', completed: false },
          { id: 'l007_06_02', title: 'Quishing & QR Code Scams', duration: '8m', completed: false },
          { id: 'l007_06_03', title: 'WhatsApp & Instagram DM Scams', duration: '8m', completed: false },
          { id: 'l007_06_04', title: 'KYC, Delivery & Job Scams', duration: '10m', completed: false },
          { id: 'l007_06_05', title: 'Red Flag Identification', duration: '6m', completed: false },
          { id: 'l007_06_06', title: 'Find a Scam in the Wild Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm007_07', title: 'Final Mission: Save Someone', order: 7, completed: false,
        lessons: [
          { id: 'l007_07_01', title: 'Teaching Cyber Safety in Simple Language', duration: '10m', completed: false },
          { id: 'l007_07_02', title: 'OTP Scam Awareness', duration: '8m', completed: false },
          { id: 'l007_07_03', title: 'Fake vs Real Links', duration: '8m', completed: false },
          { id: 'l007_07_04', title: 'Privacy Settings Review', duration: '8m', completed: false },
          { id: 'l007_07_05', title: 'Community Cyber Hygiene', duration: '8m', completed: false },
          { id: 'l007_07_06', title: 'Protect a Real Person Lab', duration: '18m', completed: false },
        ]
      },
    ],
    quizId: 'q007',
    tags: ['Scam Awareness', 'Personal Safety', 'Phishing', 'Beginner'],
    rating: 4.8,
    students: 3100,
  },
  {
    id: 'c008',
    title: 'AI-Enabled Cyber Security Essentials',
    category: 'Web Security',
    level: 'Beginner',
    duration: '7h',
    moduleCount: 7,
    enrolled: false,
    progress: 0,
    currentModule: null,
    currentLessonId: null,
    description: 'A 7-day beginner course on defensive web security with AI-assisted learning. Explore HTTP traffic, SQL Injection, XSS, authentication, and misconfigurations using Burp Suite and AI tools — all in safe demo environments.',
    instructor: { name: 'CyberScout Instructor', title: 'Web Security Educator', avatar: null },
    modules: [
      {
        id: 'm008_01', title: 'Web Fundamentals & AI-Assisted Risk Understanding', order: 1, completed: false,
        lessons: [
          { id: 'l008_01_01', title: 'Browser-Server-Database Model', duration: '10m', completed: false },
          { id: 'l008_01_02', title: 'HTTP Request Structure', duration: '12m', completed: false },
          { id: 'l008_01_03', title: 'URL, Methods, Headers & Parameters', duration: '10m', completed: false },
          { id: 'l008_01_04', title: 'Client vs Server-Side Trust', duration: '8m', completed: false },
          { id: 'l008_01_05', title: 'Burp Suite Introduction', duration: '10m', completed: false },
          { id: 'l008_01_06', title: 'AI as a Security Assistant', duration: '8m', completed: false },
          { id: 'l008_01_07', title: 'Intercept & Explain Your Own Web Traffic Lab', duration: '22m', completed: false },
        ]
      },
      {
        id: 'm008_02', title: 'Unsafe Input & AI-Assisted Input Risk Analysis', order: 2, completed: false,
        lessons: [
          { id: 'l008_02_01', title: 'Input Fields & Trust Boundaries', duration: '10m', completed: false },
          { id: 'l008_02_02', title: 'Client-Side vs Server-Side Validation', duration: '10m', completed: false },
          { id: 'l008_02_03', title: 'Normal vs Unexpected Input', duration: '8m', completed: false },
          { id: 'l008_02_04', title: 'Unsafe Input Risks', duration: '8m', completed: false },
          { id: 'l008_02_05', title: 'AI-Assisted Input Classification', duration: '8m', completed: false },
          { id: 'l008_02_06', title: 'Test a Form & Analyze Input Behavior Lab', duration: '16m', completed: false },
        ]
      },
      {
        id: 'm008_03', title: 'SQL Injection & AI-Assisted Query Risk', order: 3, completed: false,
        lessons: [
          { id: 'l008_03_01', title: 'Database & Query Concepts', duration: '10m', completed: false },
          { id: 'l008_03_02', title: 'Login Form Logic', duration: '8m', completed: false },
          { id: 'l008_03_03', title: 'SQL Injection Concept', duration: '10m', completed: false },
          { id: 'l008_03_04', title: 'Login Bypass Demonstration', duration: '8m', completed: false },
          { id: 'l008_03_05', title: 'Parameterized Queries & Least Privilege', duration: '10m', completed: false },
          { id: 'l008_03_06', title: 'AI-Assisted SQLi Explanation', duration: '6m', completed: false },
          { id: 'l008_03_07', title: 'SQL Injection Login Bypass Simulation Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm008_04', title: 'Cross-Site Scripting & Browser Risk Analysis', order: 4, completed: false,
        lessons: [
          { id: 'l008_04_01', title: 'JavaScript Basics for Security', duration: '8m', completed: false },
          { id: 'l008_04_02', title: 'Text vs Executable Code', duration: '8m', completed: false },
          { id: 'l008_04_03', title: 'Reflected XSS', duration: '8m', completed: false },
          { id: 'l008_04_04', title: 'Stored XSS', duration: '8m', completed: false },
          { id: 'l008_04_05', title: 'Output Encoding & Sanitization', duration: '8m', completed: false },
          { id: 'l008_04_06', title: 'Content Security Policy Awareness', duration: '6m', completed: false },
          { id: 'l008_04_07', title: 'AI-Assisted XSS Analysis', duration: '6m', completed: false },
          { id: 'l008_04_08', title: 'XSS Demonstration in Safe Demo Page Lab', duration: '18m', completed: false },
        ]
      },
      {
        id: 'm008_05', title: 'Authentication, Sessions & Account Security', order: 5, completed: false,
        lessons: [
          { id: 'l008_05_01', title: 'Authentication vs Session', duration: '10m', completed: false },
          { id: 'l008_05_02', title: 'Cookies & Session IDs', duration: '8m', completed: false },
          { id: 'l008_05_03', title: 'Tokens & Login Persistence', duration: '8m', completed: false },
          { id: 'l008_05_04', title: 'Secure, HttpOnly & SameSite Flags', duration: '8m', completed: false },
          { id: 'l008_05_05', title: 'Logout Behavior', duration: '6m', completed: false },
          { id: 'l008_05_06', title: 'AI-Assisted Account Security Checklist', duration: '8m', completed: false },
          { id: 'l008_05_07', title: 'Observe Sessions & Build Security Checklist Lab', duration: '22m', completed: false },
        ]
      },
      {
        id: 'm008_06', title: 'Misconfigurations & Secure Deployment Awareness', order: 6, completed: false,
        lessons: [
          { id: 'l008_06_01', title: 'Exposed Admin Panels & APIs', duration: '8m', completed: false },
          { id: 'l008_06_02', title: 'Debug Endpoints & Default Credentials', duration: '8m', completed: false },
          { id: 'l008_06_03', title: 'Directory Listing & Backup Files', duration: '8m', completed: false },
          { id: 'l008_06_04', title: 'Detailed Error Messages', duration: '6m', completed: false },
          { id: 'l008_06_05', title: 'AI Risk Classification', duration: '8m', completed: false },
          { id: 'l008_06_06', title: 'Find Weak Configs & Generate Deployment Checklist Lab', duration: '22m', completed: false },
        ]
      },
      {
        id: 'm008_07', title: 'AI-Assisted Final Security Review', order: 7, completed: false,
        lessons: [
          { id: 'l008_07_01', title: 'Attacker vs Defender Mindset', duration: '8m', completed: false },
          { id: 'l008_07_02', title: 'Vulnerability vs Risk', duration: '8m', completed: false },
          { id: 'l008_07_03', title: 'Input Validation & Output Encoding', duration: '8m', completed: false },
          { id: 'l008_07_04', title: 'Secure Session Handling & Access Control', duration: '8m', completed: false },
          { id: 'l008_07_05', title: 'AI-Assisted Reporting', duration: '8m', completed: false },
          { id: 'l008_07_06', title: 'Responsible Disclosure', duration: '6m', completed: false },
          { id: 'l008_07_07', title: 'AI-Assisted Security Review of Demo App Lab', duration: '24m', completed: false },
        ]
      },
    ],
    quizId: 'q008',
    tags: ['Web Security', 'AI Tools', 'SQL Injection', 'XSS', 'Burp Suite'],
    rating: 4.7,
    students: 2600,
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
