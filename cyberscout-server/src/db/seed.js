import bcrypt from 'bcrypt'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeDatabase, execute, queryOne, transaction } from './index.js'
import {
  createUser,
  enrollUser,
  findUserByEmail,
  getCourseById,
} from './repositories.js'

const __filename = fileURLToPath(import.meta.url)

const PASSWORD = process.env.SEED_USER_PASSWORD || 'password123'
const COST = Number(process.env.BCRYPT_COST || 12)

async function insertCourse(course, client) {
  await execute(`
    INSERT INTO courses (
      id, slug, title, category, level, duration, description, overview, instructor_name, instructor_title,
      status, price, mode, credential, prerequisites, brochure_url, category_slug, audience, outcomes, labs, instructor_id
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
      $18::jsonb, $19::jsonb, $20::jsonb, $21
    )
    ON CONFLICT(id) DO NOTHING
  `, [
    course.id, course.slug, course.title, course.category, course.level, course.duration, course.description,
    course.overview, course.instructorName, course.instructorTitle, course.status, course.price,
    course.mode || 'Online', course.credential || 'Certificate of Completion',
    course.prerequisites || 'Basic computer and internet knowledge', course.brochureUrl || null,
    course.categorySlug || 'cybersecurity', JSON.stringify(course.audience || []),
    JSON.stringify(course.outcomes || []), JSON.stringify(course.labs || []), course.instructorId || null,
  ], client)
}

async function insertModule(module, client) {
  await execute(`
    INSERT INTO course_modules (id, course_id, title, sort_order)
    VALUES ($1, $2, $3, $4) ON CONFLICT(id) DO NOTHING
  `, [module.id, module.courseId, module.title, module.sortOrder], client)
}

async function insertLesson(lesson, client) {
  await execute(`
    INSERT INTO lessons (id, course_id, module_id, title, duration, content, sort_order, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'published') ON CONFLICT(id) DO NOTHING
  `, [lesson.id, lesson.courseId, lesson.moduleId, lesson.title, lesson.duration, lesson.content, lesson.sortOrder], client)
}

async function insertMaterial(material, client) {
  await execute(`
    INSERT INTO course_materials (id, course_id, lesson_id, type, title, description, content, resource_url, is_public, sort_order)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT(id) DO NOTHING
  `, [material.id, material.courseId, material.lessonId, material.type, material.title, material.description, material.content, material.resourceUrl, Boolean(material.isPublic), material.sortOrder], client)
}

async function ensureUser({ name, email, role, roles }) {
  const existing = await findUserByEmail(email)
  if (existing) return existing
  const passwordHash = await bcrypt.hash(PASSWORD, COST)
  return createUser({
    name,
    email,
    username: email.split('@')[0],
    passwordHash,
    role,
    roles,
  })
}

const courses = [
  {
    id: 'c001',
    slug: 'introduction-to-cyber-security',
    title: 'Introduction to Cyber Security',
    category: 'Cybersecurity Foundations',
    level: 'Beginner',
    duration: '4 weeks',
    description: 'Build practical cyber safety, security awareness, networking basics, and defensive thinking through guided lessons and exercises.',
    overview: 'This course turns cybersecurity fundamentals into clear, practical habits. Learners study digital safety, common threats, identity protection, network basics, and the defensive mindset needed before moving into deeper technical labs.',
    instructorName: 'Cyber Lab IN Faculty',
    instructorTitle: 'Cybersecurity Educators',
    status: 'published',
    price: 0,
    mode: 'Online',
    credential: 'Certificate of Completion',
    prerequisites: 'Basic computer and internet knowledge',
    categorySlug: 'cybersecurity',
    audience: ['Students exploring cybersecurity', 'IT beginners', 'Career switchers'],
    labs: ['Digital footprint basics', 'Phishing safety checklist', 'Account hardening practice'],
    outcomes: ['Explain cybersecurity fundamentals', 'Identify common scam indicators', 'Apply safer account practices'],
  },
  {
    id: 'c002',
    slug: 'cyber-security-essentials',
    title: 'Cyber Security Essentials',
    category: 'Practical Defense',
    level: 'Beginner',
    duration: '7 days',
    description: 'Beginner-friendly cybersecurity training with guided labs, phishing analysis, web security basics, account hardening, and defensive reporting.',
    overview: 'Cyber Security Essentials is a beginner-friendly cybersecurity course online for students, IT beginners, career switchers, and early-stage professionals who want practical security skills through guided labs, phishing analysis, web security practice, and real-world defensive thinking.',
    instructorName: 'Arghya Sikdar',
    instructorTitle: 'Assistant Professor and Cybersecurity Educator',
    status: 'published',
    price: 0,
    mode: 'Online',
    credential: 'Certificate of Completion',
    prerequisites: 'Basic computer and internet knowledge',
    categorySlug: 'cybersecurity',
    audience: [
      'Students exploring cybersecurity',
      'IT beginners',
      'Career switchers',
      'Non-technical learners',
      'Junior IT staff',
      'Learners preparing for cybersecurity certification courses',
    ],
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
    outcomes: [
      'Explain cybersecurity in simple terms',
      'Identify phishing and scam indicators',
      'Apply account hardening practices',
      'Understand beginner web security risks',
      'Recognise unsafe input patterns',
      'Describe SQL Injection and XSS at foundation level',
      'Understand network security basics',
      'Follow basic cyber investigation structure',
      'Communicate findings through defensive reporting',
    ],
  },
]

const modules = [
  { id: 'm001_01', courseId: 'c001', title: 'Security Foundations', sortOrder: 1 },
  { id: 'm001_02', courseId: 'c001', title: 'Personal Digital Defense', sortOrder: 2 },
  { id: 'm002_01', courseId: 'c002', title: 'Threat Investigation Basics', sortOrder: 1 },
  { id: 'm002_02', courseId: 'c002', title: 'Web and AI Abuse Defense', sortOrder: 2 },
]

const lessons = [
  {
    id: 'l001_01',
    courseId: 'c001',
    moduleId: 'm001_01',
    title: 'What Cybersecurity Protects',
    duration: '18 min',
    sortOrder: 1,
    content: 'Cybersecurity protects people, data, devices, identities, and services. This lesson explains confidentiality, integrity, availability, and why practical defenders think in terms of risk and impact.',
  },
  {
    id: 'l001_02',
    courseId: 'c001',
    moduleId: 'm001_01',
    title: 'Networks, Accounts, and Attack Surfaces',
    duration: '22 min',
    sortOrder: 2,
    content: 'Learn how devices communicate, how accounts become targets, and how everyday systems expose attack surfaces that defenders must understand.',
  },
  {
    id: 'l001_03',
    courseId: 'c001',
    moduleId: 'm001_02',
    title: 'Passwords, MFA, and Safe Browsing',
    duration: '20 min',
    sortOrder: 3,
    content: 'Practice building safer account habits with password managers, multi-factor authentication, browser warnings, update hygiene, and trusted recovery methods.',
  },
  {
    id: 'l002_01',
    courseId: 'c002',
    moduleId: 'm002_01',
    title: 'Investigating Suspicious Messages',
    duration: '24 min',
    sortOrder: 1,
    content: 'Walk through a defensive investigation of suspicious messages using sender checks, link review, urgency indicators, and safe reporting.',
  },
  {
    id: 'l002_02',
    courseId: 'c002',
    moduleId: 'm002_01',
    title: 'Documenting an Incident',
    duration: '19 min',
    sortOrder: 2,
    content: 'Learn how to record facts, preserve evidence, avoid assumptions, and communicate security findings clearly.',
  },
  {
    id: 'l002_03',
    courseId: 'c002',
    moduleId: 'm002_02',
    title: 'Web Threats and AI-Abuse Patterns',
    duration: '26 min',
    sortOrder: 3,
    content: 'Explore common web threats, phishing infrastructure, generated abuse content, and defensive workflows for triage and escalation.',
  },
]

const materials = [
  {
    id: 'mat001_01',
    courseId: 'c001',
    lessonId: 'l001_01',
    type: 'text',
    title: 'Cybersecurity Foundations Field Notes',
    description: 'A practical summary of the core goals and language of cybersecurity.',
    content: 'Use the CIA triad to ask: what data must remain private, what must remain accurate, and what service must remain available?',
    resourceUrl: null,
    isPublic: 0,
    sortOrder: 1,
  },
  {
    id: 'mat001_02',
    courseId: 'c001',
    lessonId: 'l001_03',
    type: 'pdf',
    title: 'Personal Security Checklist',
    description: 'A checklist for account safety, MFA, browsers, device updates, and backup habits.',
    content: 'Protected PDF metadata. The raw file is never exposed from the public frontend path.',
    resourceUrl: null,
    isPublic: 0,
    sortOrder: 2,
  },
  {
    id: 'mat001_public',
    courseId: 'c001',
    lessonId: null,
    type: 'text',
    title: 'Course Overview',
    description: 'Public overview visible before enrollment.',
    content: 'This beginner course is designed for learners taking their first practical steps into cybersecurity.',
    resourceUrl: null,
    isPublic: 1,
    sortOrder: 0,
  },
  {
    id: 'mat002_01',
    courseId: 'c002',
    lessonId: 'l002_01',
    type: 'text',
    title: 'Suspicious Message Investigation Worksheet',
    description: 'A guided workflow for reviewing suspicious messages safely.',
    content: 'Check sender identity, link destination, request urgency, attachment behavior, and reporting path.',
    resourceUrl: null,
    isPublic: 0,
    sortOrder: 1,
  },
  {
    id: 'mat002_02',
    courseId: 'c002',
    lessonId: 'l002_03',
    type: 'link',
    title: 'Safe Web Review Lab Guide',
    description: 'A controlled defensive review workflow for web-risk indicators.',
    content: 'Use only authorized lab targets and document observations without exploiting systems.',
    resourceUrl: 'https://cyberlabin.com/resources/safe-web-review',
    isPublic: 0,
    sortOrder: 2,
  },
  {
    id: 'mat002_public',
    courseId: 'c002',
    lessonId: null,
    type: 'text',
    title: 'Course Overview',
    description: 'Public overview visible before enrollment.',
    content: 'This course focuses on practical defense against web, phishing, and AI-assisted abuse patterns.',
    resourceUrl: null,
    isPublic: 1,
    sortOrder: 0,
  },
]

const blogs = [
  {
    id: 'blog_cybersecurity',
    slug: 'what-is-cybersecurity',
    title: 'What is cybersecurity?',
    excerpt: 'A beginner-friendly explanation of cybersecurity and why hands-on practice matters.',
    body: 'Cybersecurity is the practice of protecting systems, accounts, networks, websites, and digital information from attacks, misuse, and unauthorised access.\n\nFor beginners, the best starting point is learning how real risks appear in everyday systems.\n\nExplore Cyber Security Essentials for guided defensive practice.',
    metaTitle: 'What is Cybersecurity? Beginner Guide',
    metaDescription: 'Learn what cybersecurity means, why it matters, and how beginners can start with guided labs and practical defensive skills.',
    category: 'Beginner Cybersecurity',
  },
  {
    id: 'blog_phishing',
    slug: 'what-is-phishing-and-how-to-prevent-it',
    title: 'What is phishing and how to prevent it?',
    excerpt: 'Learn how phishing works and the simple habits that reduce risk.',
    body: 'Phishing is a social engineering attack that tries to trick someone into clicking a link, opening an attachment, sharing credentials, or taking urgent action.\n\nCheck the sender, domain, destination, urgency, and reporting route before acting.',
    metaTitle: 'What is Phishing and How to Prevent It?',
    metaDescription: 'Understand phishing indicators, prevention habits, and beginner-safe practice through guided labs.',
    category: 'Beginner Cybersecurity',
  },
  {
    id: 'blog_ethical_hacking',
    slug: 'what-is-ethical-hacking',
    title: 'What is ethical hacking?',
    excerpt: 'A practical explanation of ethical hacking, authorisation, and responsible learning.',
    body: 'Ethical hacking is authorised security testing. The goal is to find weaknesses safely, document risk clearly, and help improve defence.\n\nBeginners should first learn security fundamentals and responsible reporting.',
    metaTitle: 'What is Ethical Hacking?',
    metaDescription: 'Learn what ethical hacking means, why authorisation matters, and which cybersecurity foundations beginners should learn first.',
    category: 'Ethical Hacking',
  },
  {
    id: 'blog_beginners',
    slug: 'how-to-learn-cybersecurity-for-beginners',
    title: 'How to learn cybersecurity for beginners?',
    excerpt: 'A practical learning path for students, IT beginners, and career switchers.',
    body: 'The best way to learn cybersecurity for beginners is to combine simple explanations with practical exercises. Start with account safety, phishing prevention, network basics, web security, and defensive reporting.',
    metaTitle: 'How to Learn Cybersecurity for Beginners',
    metaDescription: 'A beginner-friendly cybersecurity learning path with hands-on labs and defensive reporting.',
    category: 'Career Guidance',
  },
]

async function insertBlog(blog, client) {
  await execute(`
    INSERT INTO blogs (id, slug, title, excerpt, body, meta_title, meta_description, category, author_name, published_at, last_reviewed_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Arghya Sikdar', CURRENT_TIMESTAMP, CURRENT_DATE)
    ON CONFLICT(id) DO NOTHING
  `, [blog.id, blog.slug, blog.title, blog.excerpt, blog.body, blog.metaTitle, blog.metaDescription, blog.category], client)
}

async function catalogSeedIsReady() {
  const row = await queryOne(`
    SELECT
      (SELECT count(*) FROM courses WHERE id IN ('c001', 'c002'))::integer AS courses,
      (SELECT count(*) FROM course_materials WHERE id IN ('mat001_public', 'mat002_public'))::integer AS materials,
      (SELECT count(*) FROM blogs WHERE id IN ('blog_cybersecurity', 'blog_phishing', 'blog_ethical_hacking', 'blog_beginners'))::integer AS blogs
  `)
  return row.courses === 2 && row.materials === 2 && row.blogs === 4
}

async function developmentSeedIsReady() {
  const row = await queryOne(`
    SELECT
      (SELECT count(*) FROM live_classes WHERE id = 'live_c001_01')::integer AS live_classes,
      (SELECT count(*) FROM courses WHERE id = 'c002' AND instructor_id IS NOT NULL)::integer AS instructor_assignments,
      (SELECT count(*) FROM users WHERE email IN (
        'student@cyberlabin.com', 'neel0409@gmail.com', 'admin@cyberlabin.com',
        'instructor@cyberlabin.com', 'marketing@cyberlabin.com', 'ops@cyberlabin.com'
      ))::integer AS users
  `)
  return row.live_classes === 1 && row.users === 6 && row.instructor_assignments === 1
}

export async function seedBaselineData({
  force = false,
  log = true,
  includeTestUsers = process.env.SEED_DEVELOPMENT_USERS === '1',
} = {}) {
  const allowTestUsers = includeTestUsers && process.env.NODE_ENV !== 'production'
  const catalogReady = await catalogSeedIsReady()
  const developmentReady = !allowTestUsers || await developmentSeedIsReady()

  if (!force && catalogReady && developmentReady) {
    if (log) console.log(allowTestUsers ? 'Development seed data already ready.' : 'Public catalogue already ready.')
    return { seeded: false }
  }

  await transaction(async client => {
    await execute(`
      INSERT INTO course_categories (id, name, slug, description)
      VALUES ('cat_cybersecurity', 'Cybersecurity', 'cybersecurity', 'Beginner-friendly and practical cybersecurity training.')
      ON CONFLICT(id) DO NOTHING
    `, [], client)
    for (const course of courses) await insertCourse(course, client)
    for (const module of modules) await insertModule(module, client)
    for (const lesson of lessons) await insertLesson(lesson, client)
    for (const material of materials) await insertMaterial(material, client)
    for (const blog of blogs) await insertBlog(blog, client)
  })

  if (!allowTestUsers) {
    if (log) console.log('Public catalogue ready. Test identities were not created.')
    return { seeded: true, testUsersSeeded: false }
  }

  const student = await ensureUser({ name: 'Student Learner', email: 'student@cyberlabin.com', role: 'student', roles: ['student'] })
  const neel = await ensureUser({ name: 'Neel Cyber Lab Learner', email: 'neel0409@gmail.com', role: 'student', roles: ['student'] })
  await ensureUser({ name: 'Cyber Lab Admin', email: 'admin@cyberlabin.com', role: 'admin', roles: ['admin'] })
  const instructor = await ensureUser({ name: 'Cyber Lab Instructor', email: 'instructor@cyberlabin.com', role: 'instructor', roles: ['instructor'] })
  await ensureUser({ name: 'Cyber Lab Marketing', email: 'marketing@cyberlabin.com', role: 'marketing', roles: ['marketing'] })
  await ensureUser({ name: 'Cyber Lab Ops', email: 'ops@cyberlabin.com', role: 'ops', roles: ['ops'] })

  await execute("UPDATE courses SET instructor_id = $1 WHERE instructor_name = 'Arghya Sikdar' AND instructor_id IS NULL", [instructor.id])

  if (await getCourseById('c001')) await enrollUser(student.id, 'c001', 'seed')
  if (await getCourseById('c002')) await enrollUser(neel.id, 'c002', 'seed')

  await execute(`
    INSERT INTO live_classes (id, course_id, instructor_id, title, provider, scheduled_start, scheduled_end, status)
    VALUES ('live_c001_01', 'c001', (SELECT id FROM users WHERE email = 'instructor@cyberlabin.com'), 'Security Foundations Live Q&A', 'external', CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 days 1 hour', 'scheduled')
    ON CONFLICT(id) DO NOTHING
  `)

  if (log) console.log('Development seed data ready.')
  return { seeded: true, testUsersSeeded: true }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  try {
    await seedBaselineData()
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  } finally {
    await closeDatabase()
  }
}
