export const quizzes = {
  q001: {
    id: 'q001',
    title: 'Introduction to Cyber Security',
    courseId: 'c001',
    level: 'Beginner / Foundation',
    timeLimit: 600,
    questions: [
      {
        id: 'q001_01',
        text: 'What is the safest first response when you receive an urgent message asking for an OTP or password?',
        options: ['Reply quickly', 'Verify through an official channel', 'Forward it to friends', 'Click the link to check'],
        correctIndex: 1,
        tip: 'Urgency is a common manipulation tactic. Pause, avoid clicking, and verify through an official app, website, or known contact path.',
      },
      {
        id: 'q001_02',
        text: 'Which activity best describes a digital footprint audit?',
        options: ['Deleting every account immediately', 'Reviewing what personal information is publicly visible', 'Installing a new browser', 'Changing your wallpaper'],
        correctIndex: 1,
        tip: 'A footprint audit helps you understand what others can find about you online so you can reduce unnecessary exposure.',
      },
      {
        id: 'q001_03',
        text: 'What is a strong sign that an email may be phishing?',
        options: ['A familiar logo only', 'A sender domain that does not match the claimed organization', 'A short subject line', 'A PDF attachment from anyone'],
        correctIndex: 1,
        tip: 'Attackers often imitate display names and logos, but the sender domain and links frequently reveal inconsistencies.',
      },
      {
        id: 'q001_04',
        text: 'Why should scam simulations stay fictional and ethical?',
        options: ['To avoid enabling misuse or targeting real people', 'To make them less useful', 'To avoid writing notes', 'To hide the learning outcome'],
        correctIndex: 0,
        tip: 'The course focuses on defensive awareness and safe learning. Simulations should never harm or manipulate real people.',
      },
      {
        id: 'q001_05',
        text: 'Which control most directly improves account protection after password hygiene?',
        options: ['Turning off updates', 'Two-factor authentication', 'Using one password everywhere', 'Sharing recovery codes'],
        correctIndex: 1,
        tip: 'Two-factor authentication adds a second proof of identity and reduces risk if a password is exposed.',
      },
    ],
  },
  q002: {
    id: 'q002',
    title: 'Cyber Security Essentials',
    courseId: 'c002',
    level: 'Beginner / Foundation',
    timeLimit: 600,
    questions: [
      {
        id: 'q002_01',
        text: 'In a basic web application, which components are commonly involved in request-response flow?',
        options: ['Browser, server, database, and HTTP data', 'Only the keyboard', 'Only the database', 'Only JavaScript animations'],
        correctIndex: 0,
        tip: 'Web security starts with understanding how browsers, servers, databases, and HTTP data elements interact.',
      },
      {
        id: 'q002_02',
        text: 'Why is user input treated as a security boundary?',
        options: ['It is always trusted', 'It can contain unexpected or unsafe values', 'It never reaches the server', 'It only changes fonts'],
        correctIndex: 1,
        tip: 'Applications must validate and handle input carefully because attackers can submit unexpected values.',
      },
      {
        id: 'q002_03',
        text: 'Which defensive control helps prevent SQL Injection?',
        options: ['Parameterized queries', 'Bigger images', 'Weak passwords', 'Directory listing'],
        correctIndex: 0,
        tip: 'Parameterized queries separate code from data, reducing the risk that input changes the intended query logic.',
      },
      {
        id: 'q002_04',
        text: 'What is Cross-Site Scripting primarily about?',
        options: ['Unsafe execution of injected browser-side script', 'Encrypting a hard drive', 'Backing up files', 'Changing DNS records'],
        correctIndex: 0,
        tip: 'XSS occurs when untrusted content is treated as executable script in a browser context.',
      },
      {
        id: 'q002_05',
        text: 'What should beginner web security testing be limited to in this course?',
        options: ['Instructor-controlled safe environments', 'Any public website', 'Random login portals', 'Production systems without permission'],
        correctIndex: 0,
        tip: 'The course is defensive and ethical. Practice belongs in controlled labs and authorized demo environments.',
      },
    ],
  },
}

export const getQuizById = (id) => quizzes[id] ?? null
