#!/usr/bin/env node
import 'dotenv/config'
import bcrypt from 'bcrypt'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
  addEnrollment,
  assignLabToCourse,
  createCourse,
  createFollowUp,
  createLab,
  createLiveClass,
  getAdminAnalytics,
  getAuditLogs,
  getSalesDashboard,
  ingestRagSource,
  issueCertificate,
  listLeads,
  listUsers,
  publishCourse,
  recordAudit,
  suspendUser,
  createUser,
} from '../db/repositories.js'
import { databasePath, db } from '../db/index.js'
import { validatePassword } from '../lib/validation.js'

const args = process.argv.slice(2)

function parseArgs(argv) {
  const options = { _: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i]
    if (!item.startsWith('--')) {
      options._.push(item)
      continue
    }
    const [rawKey, inlineValue] = item.slice(2).split('=')
    const key = rawKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    if (inlineValue !== undefined) {
      options[key] = inlineValue
    } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
      options[key] = argv[i + 1]
      i += 1
    } else {
      options[key] = true
    }
  }
  return options
}

function print(payload, options = {}) {
  if (options.json) {
    console.log(JSON.stringify(payload, null, 2))
    return
  }
  if (typeof payload === 'string') {
    console.log(payload)
    return
  }
  console.log(JSON.stringify(payload, null, 2))
}

function requireAdminToken(options) {
  const expected = process.env.CLIADM_ADMIN_TOKEN || process.env.ADMIN_CLI_TOKEN
  if (!expected) throw new Error('CLIADM_ADMIN_TOKEN is not configured')
  if (options.adminToken !== expected) throw new Error('Valid --admin-token is required')
}

function requireSafeMutation(options, commandName, destructive = false) {
  requireAdminToken(options)
  if (options.dryRun) {
    return { dryRun: true, message: `${commandName} dry-run only. No changes were made.` }
  }
  if (destructive && options.confirm !== 'YES') {
    throw new Error(`${commandName} requires --dry-run or --confirm YES`)
  }
  return { dryRun: false }
}

function requireFields(options, fields) {
  const missing = fields.filter(field => !options[field])
  if (missing.length) throw new Error(`Missing required option(s): ${missing.map(item => `--${item}`).join(', ')}`)
}

async function run() {
  const options = parseArgs(args)
  const [domain, action] = options._
  const command = `${domain || ''} ${action || ''}`.trim()

  if (!domain || options.help) {
    print(`cliadm commands:
  cliadm system health [--json]
  cliadm analytics summary [--json]
  cliadm audit search [--action action] [--json]
  cliadm user create --email e --name n --password p --role student --admin-token token [--dry-run] [--json]
  cliadm user suspend --user-id id --admin-token token --confirm YES [--dry-run] [--json]
  cliadm course create --title t --admin-token token [--dry-run] [--json]
  cliadm course publish --course-id id --admin-token token [--dry-run] [--json]
  cliadm enrollment add --user-id id --course-id id [--batch-id id] --admin-token token [--dry-run] [--json]
  cliadm live create --course-id id --instructor-id id --title t --scheduled-start iso --scheduled-end iso --admin-token token [--dry-run] [--json]
  cliadm lab assign --lab-id id --course-id id --admin-token token [--dry-run] [--json]
  cliadm certificate issue --user-id id --course-id id --admin-token token [--dry-run] [--json]
  cliadm leads follow-up --lead-id id --due-at iso --admin-token token [--dry-run] [--json]
  cliadm backups create --admin-token token --dry-run [--json]
  cliadm migrations status [--json]
  cliadm rag ingest --course-id id --title t --content text --admin-token token [--dry-run] [--json]`, options)
    return
  }

  if (command === 'system health') {
    const checks = db.prepare('SELECT count(*) AS users FROM users').get()
    print({ ok: true, service: 'cliadm', database: 'sqlite', databasePath: databasePath(), users: checks.users, timestamp: new Date().toISOString() }, options)
    return
  }

  if (command === 'analytics summary') {
    print({ admin: getAdminAnalytics(), sales: getSalesDashboard().analytics }, options)
    return
  }

  if (command === 'audit search') {
    const logs = getAuditLogs(Number(options.limit || 50))
    print({ auditLogs: options.action ? logs.filter(log => log.action.includes(options.action)) : logs }, options)
    return
  }

  if (command === 'user create') {
    requireFields(options, ['email', 'name', 'password'])
    const passwordError = validatePassword(options.password)
    if (passwordError) throw new Error(passwordError)
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, user: { email: options.email, name: options.name, role: options.role || 'student' } }, options)
    const passwordHash = await bcrypt.hash(options.password, Number(process.env.BCRYPT_COST || 12))
    const user = createUser({ email: options.email, name: options.name, passwordHash, role: options.role || 'student', roles: [options.role || 'student'] })
    recordAudit('cliadm.user.create', null, 'user', user.id, { email: user.email, role: user.role, source: 'cliadm' })
    print({ user }, options)
    return
  }

  if (command === 'user suspend') {
    requireFields(options, ['userId'])
    const safety = requireSafeMutation(options, command, true)
    if (safety.dryRun) return print({ ...safety, userId: options.userId }, options)
    const user = suspendUser(options.userId)
    if (!user) throw new Error('User not found')
    recordAudit('cliadm.user.suspend', null, 'user', user.id, { source: 'cliadm' })
    print({ user }, options)
    return
  }

  if (command === 'course create') {
    requireFields(options, ['title'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, course: { title: options.title } }, options)
    print({ course: createCourse({ title: options.title, description: options.description || '', instructorId: options.instructorId || null }, null) }, options)
    return
  }

  if (command === 'course publish') {
    requireFields(options, ['courseId'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, courseId: options.courseId }, options)
    print({ course: publishCourse(options.courseId, null) }, options)
    return
  }

  if (command === 'enrollment add') {
    requireFields(options, ['userId', 'courseId'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, enrollment: { userId: options.userId, courseId: options.courseId, batchId: options.batchId || null } }, options)
    const enrollment = addEnrollment({ userId: options.userId, courseId: options.courseId, batchId: options.batchId || null, source: 'cliadm' })
    recordAudit('cliadm.enrollment.add', null, 'enrollment', enrollment.id, { userId: options.userId, courseId: options.courseId, source: 'cliadm' })
    print({ enrollment }, options)
    return
  }

  if (command === 'live create') {
    requireFields(options, ['courseId', 'instructorId', 'title', 'scheduledStart', 'scheduledEnd'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, liveClass: options }, options)
    print({ liveClass: createLiveClass({ courseId: options.courseId, instructorId: options.instructorId, title: options.title, scheduledStart: options.scheduledStart, scheduledEnd: options.scheduledEnd, batchId: options.batchId || null }, null) }, options)
    return
  }

  if (command === 'lab assign') {
    requireFields(options, ['labId', 'courseId'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, labId: options.labId, courseId: options.courseId }, options)
    print({ lab: assignLabToCourse(options.labId, options.courseId, null) }, options)
    return
  }

  if (command === 'lab create') {
    requireFields(options, ['courseId', 'title'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, lab: { courseId: options.courseId, title: options.title } }, options)
    print({ lab: createLab({ courseId: options.courseId, lessonId: options.lessonId || null, title: options.title, description: options.description || '', flag: options.flag || null }, null) }, options)
    return
  }

  if (command === 'certificate issue') {
    requireFields(options, ['userId', 'courseId'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, certificate: { userId: options.userId, courseId: options.courseId } }, options)
    print({ certificate: issueCertificate({ userId: options.userId, courseId: options.courseId }, null) }, options)
    return
  }

  if (command === 'leads list') {
    requireAdminToken(options)
    print({ leads: listLeads({ courseId: options.courseId, stage: options.stage }) }, options)
    return
  }

  if (command === 'leads follow-up') {
    requireFields(options, ['leadId', 'dueAt'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, followUp: { leadId: options.leadId, dueAt: options.dueAt } }, options)
    const followUp = createFollowUp(options.leadId, null, options.dueAt, options.note || '')
    if (!followUp) throw new Error('Lead not found')
    print({ followUp }, options)
    return
  }

  if (command === 'backups create') {
    const safety = requireSafeMutation(options, command, true)
    if (safety.dryRun) return print({ ...safety, backup: { status: 'planned', database: databasePath() } }, options)
    const backupDirectory = path.resolve(path.dirname(databasePath()), 'backups')
    await fs.mkdir(backupDirectory, { recursive: true })
    const backupPath = path.join(backupDirectory, `cyberlabin-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`)
    await db.backup(backupPath)
    recordAudit('cliadm.backup.create', null, 'database_backup', backupPath, { source: 'cliadm' })
    print({ backup: { status: 'created', path: backupPath } }, options)
    return
  }

  if (command === 'migrations status') {
    const migrations = db.prepare('SELECT name, applied_at AS appliedAt FROM schema_migrations ORDER BY name').all()
    print({ adapter: 'sqlite', databasePath: databasePath(), migrations }, options)
    return
  }

  if (command === 'rag ingest') {
    requireFields(options, ['courseId', 'title', 'content'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, rag: { courseId: options.courseId, title: options.title } }, options)
    print({ rag: ingestRagSource({ courseId: options.courseId, title: options.title, content: options.content }, null) }, options)
    return
  }

  throw new Error(`Unknown command: ${command}`)
}

run().catch(error => {
  console.error(JSON.stringify({ error: error.message }))
  process.exit(1)
})
