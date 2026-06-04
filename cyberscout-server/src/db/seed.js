import bcrypt from 'bcrypt'
import { db } from './index.js'
import {
  createUser,
  enrollUser,
  findUserByEmail,
  getCourseById,
} from './repositories.js'

const PASSWORD = process.env.SEED_USER_PASSWORD || 'password123'
const COST = Number(process.env.BCRYPT_COST || 12)

function insertCourse(course) {
  db.prepare(`
    INSERT INTO courses (
      id, slug, title, category, level, duration, description, overview, instructor_name, instructor_title,
      status, price, mode, credential, prerequisites, brochure_url, category_slug, audience, outcomes, labs
    )
    VALUES (
      @id, @slug, @title, @category, @level, @duration, @description, @overview, @instructorName, @instructorTitle,
      @status, @price, @mode, @credential, @prerequisites, @brochureUrl, @categorySlug, @audience, @outcomes, @labs
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      category = excluded.category,
      level = excluded.level,
      duration = excluded.duration,
      description = excluded.description,
      overview = excluded.overview,
      instructor_name = excluded.instructor_name,
      instructor_title = excluded.instructor_title,
      status = excluded.status,
      price = excluded.price,
      mode = excluded.mode,
      credential = excluded.credential,
      prerequisites = excluded.prerequisites,
      brochure_url = excluded.brochure_url,
      category_slug = excluded.category_slug,
      audience = excluded.audience,
      outcomes = excluded.outcomes,
      labs = excluded.labs,
      updated_at = datetime('now')
  `).run({
    ...course,
    mode: course.mode || 'Online',
    credential: course.credential || 'Certificate of Completion',
    prerequisites: course.prerequisites || 'Basic computer and internet knowledge',
    brochureUrl: course.brochureUrl || null,
    categorySlug: course.categorySlug || 'cybersecurity',
    audience: JSON.stringify(course.audience || []),
    outcomes: JSON.stringify(course.outcomes || []),
    labs: JSON.stringify(course.labs || []),
  })
}

function insertModule(module) {
  db.prepare(`
    INSERT INTO course_modules (id, course_id, title, sort_order)
    VALUES (@id, @courseId, @title, @sortOrder)
    ON CONFLICT(id) DO UPDATE SET title = excluded.title, sort_order = excluded.sort_order
  `).run(module)
}

function insertLesson(lesson) {
  db.prepare(`
    INSERT INTO lessons (id, course_id, module_id, title, duration, content, sort_order, status)
    VALUES (@id, @courseId, @moduleId, @title, @duration, @content, @sortOrder, 'published')
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      duration = excluded.duration,
      content = excluded.content,
      sort_order = excluded.sort_order,
      status = excluded.status
  `).run(lesson)
}

function insertMaterial(material) {
  db.prepare(`
    INSERT INTO course_materials (id, course_id, lesson_id, type, title, description, content, resource_url, is_public, sort_order)
    VALUES (@id, @courseId, @lessonId, @type, @title, @description, @content, @resourceUrl, @isPublic, @sortOrder)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      content = excluded.content,
      resource_url = excluded.resource_url,
      is_public = excluded.is_public,
      sort_order = excluded.sort_order
  `).run(material)
}

async function ensureUser({ name, email, role, roles }) {
  const existing = findUserByEmail(email)
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

async function seed() {
  for (const course of courses) insertCourse(course)
  for (const module of modules) insertModule(module)
  for (const lesson of lessons) insertLesson(lesson)
  for (const material of materials) insertMaterial(material)

  const student = await ensureUser({ name: 'Student Learner', email: 'student@cyberlabin.com', role: 'student', roles: ['student'] })
  await ensureUser({ name: 'Cyber Lab Admin', email: 'admin@cyberlabin.com', role: 'admin', roles: ['admin'] })
  await ensureUser({ name: 'Cyber Lab Instructor', email: 'instructor@cyberlabin.com', role: 'instructor', roles: ['instructor'] })
  await ensureUser({ name: 'Cyber Lab Marketing', email: 'marketing@cyberlabin.com', role: 'marketing', roles: ['marketing'] })
  await ensureUser({ name: 'Cyber Lab Ops', email: 'ops@cyberlabin.com', role: 'ops', roles: ['ops'] })

  if (getCourseById('c001')) enrollUser(student.id, 'c001', 'seed')

  db.prepare(`
    INSERT INTO live_classes (id, course_id, instructor_id, title, provider, scheduled_start, scheduled_end, status)
    VALUES ('live_c001_01', 'c001', (SELECT id FROM users WHERE email = 'instructor@cyberlabin.com'), 'Security Foundations Live Q&A', 'external', datetime('now', '+2 days'), datetime('now', '+2 days', '+1 hour'), 'scheduled')
    ON CONFLICT(id) DO UPDATE SET title = excluded.title, scheduled_start = excluded.scheduled_start, scheduled_end = excluded.scheduled_end
  `).run()

  console.log('Seed data ready.')
}

seed().catch(error => {
  console.error(error)
  process.exit(1)
})
