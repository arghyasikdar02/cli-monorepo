#!/usr/bin/env node
import 'dotenv/config'
import bcrypt from 'bcrypt'
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
  publishCourse,
  recordAudit,
  suspendUser,
  createUser,
  findUserByEmail,
  findUserById,
  publicUser,
  updateUser,
} from '../db/repositories.js'
import { checkDatabaseConnection, closeDatabase, queryMany, queryOne } from '../db/index.js'
import { validatePassword } from '../lib/validation.js'
import { normalizeRole, rolesForUser, VALID_ROLES } from '../lib/roles.js'

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
  if (options.adminToken !== undefined && options.adminToken !== expected) throw new Error('Valid --admin-token is required')
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

function passwordFromOptions(options) {
  if (options.password) return options.password
  if (!options.passwordEnv) return ''
  if (!/^[A-Z_][A-Z0-9_]*$/.test(options.passwordEnv)) throw new Error('--password-env must name a valid environment variable')
  return process.env[options.passwordEnv] || ''
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
  cliadm user create --email e --name n (--password p | --password-env ENV_NAME) --role student [--admin-token token] [--dry-run] [--json]
  cliadm user set-role (--user-id id | --email e) --role instructor [--admin-token token] --confirm YES [--dry-run] [--json]
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
    const [connection, checks] = await Promise.all([
      checkDatabaseConnection(),
      queryOne('SELECT count(*)::integer AS users FROM users'),
    ])
    print({ ok: true, service: 'cliadm', database: connection.engine, users: checks.users, timestamp: new Date().toISOString() }, options)
    return
  }

  if (command === 'analytics summary') {
    const [admin, sales] = await Promise.all([getAdminAnalytics(), getSalesDashboard()])
    print({ admin, sales: sales.analytics }, options)
    return
  }

  if (command === 'audit search') {
    const logs = await getAuditLogs(Number(options.limit || 50))
    print({ auditLogs: options.action ? logs.filter(log => log.action.includes(options.action)) : logs }, options)
    return
  }

  if (command === 'user create') {
    requireFields(options, ['email', 'name'])
    const password = passwordFromOptions(options)
    if (!password) throw new Error('Missing password. Use --password or --password-env.')
    const role = normalizeRole(options.role || 'student')
    if (!role) throw new Error(`Unsupported role. Use one of: ${VALID_ROLES.join(', ')}`)
    const passwordError = validatePassword(password)
    if (passwordError) throw new Error(passwordError)
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, user: { email: options.email, name: options.name, role } }, options)
    const existing = await findUserByEmail(options.email)
    if (existing) {
      if (!rolesForUser(existing).includes(role)) {
        throw new Error('An account with this email already exists under a different role. Use user set-role with explicit confirmation.')
      }
      return print({ user: publicUser(existing), alreadyExists: true }, options)
    }
    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_COST || 12))
    const user = await createUser({ email: options.email, name: options.name, passwordHash, role, roles: [role] })
    await recordAudit('cliadm.user.create', null, 'user', user.id, { email: user.email, role: user.role, source: 'cliadm' })
    print({ user: publicUser(user), alreadyExists: false }, options)
    return
  }

  if (command === 'user set-role') {
    requireFields(options, ['role'])
    if (!options.userId && !options.email) throw new Error('Missing required option: --user-id or --email')
    const role = normalizeRole(options.role)
    if (!role) throw new Error(`Unsupported role. Use one of: ${VALID_ROLES.join(', ')}`)
    const safety = requireSafeMutation(options, command, true)
    if (safety.dryRun) return print({ ...safety, userId: options.userId || null, email: options.email || null, role }, options)
    const existing = options.userId ? await findUserById(options.userId) : await findUserByEmail(options.email)
    if (!existing) throw new Error('User not found')
    const user = await updateUser(existing.id, { role, roles: [role] })
    await recordAudit('cliadm.user.set_role', null, 'user', user.id, { role, source: 'cliadm' })
    print({ user: publicUser(user) }, options)
    return
  }

  if (command === 'user suspend') {
    requireFields(options, ['userId'])
    const safety = requireSafeMutation(options, command, true)
    if (safety.dryRun) return print({ ...safety, userId: options.userId }, options)
    const user = await suspendUser(options.userId)
    if (!user) throw new Error('User not found')
    await recordAudit('cliadm.user.suspend', null, 'user', user.id, { source: 'cliadm' })
    print({ user }, options)
    return
  }

  if (command === 'course create') {
    requireFields(options, ['title'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, course: { title: options.title } }, options)
    print({ course: await createCourse({ title: options.title, description: options.description || '', instructorId: options.instructorId || null }, null) }, options)
    return
  }

  if (command === 'course publish') {
    requireFields(options, ['courseId'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, courseId: options.courseId }, options)
    print({ course: await publishCourse(options.courseId, null) }, options)
    return
  }

  if (command === 'enrollment add') {
    requireFields(options, ['userId', 'courseId'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, enrollment: { userId: options.userId, courseId: options.courseId, batchId: options.batchId || null } }, options)
    const enrollment = await addEnrollment({ userId: options.userId, courseId: options.courseId, batchId: options.batchId || null, source: 'cliadm' })
    await recordAudit('cliadm.enrollment.add', null, 'enrollment', enrollment.id, { userId: options.userId, courseId: options.courseId, source: 'cliadm' })
    print({ enrollment }, options)
    return
  }

  if (command === 'live create') {
    requireFields(options, ['courseId', 'instructorId', 'title', 'scheduledStart', 'scheduledEnd'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, liveClass: options }, options)
    print({ liveClass: await createLiveClass({ courseId: options.courseId, instructorId: options.instructorId, title: options.title, scheduledStart: options.scheduledStart, scheduledEnd: options.scheduledEnd, batchId: options.batchId || null }, null) }, options)
    return
  }

  if (command === 'lab assign') {
    requireFields(options, ['labId', 'courseId'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, labId: options.labId, courseId: options.courseId }, options)
    print({ lab: await assignLabToCourse(options.labId, options.courseId, null) }, options)
    return
  }

  if (command === 'lab create') {
    requireFields(options, ['courseId', 'title'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, lab: { courseId: options.courseId, title: options.title } }, options)
    print({ lab: await createLab({ courseId: options.courseId, lessonId: options.lessonId || null, title: options.title, description: options.description || '', flag: options.flag || null }, null) }, options)
    return
  }

  if (command === 'certificate issue') {
    requireFields(options, ['userId', 'courseId'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, certificate: { userId: options.userId, courseId: options.courseId } }, options)
    print({ certificate: await issueCertificate({ userId: options.userId, courseId: options.courseId }, null) }, options)
    return
  }

  if (command === 'leads list') {
    requireAdminToken(options)
    print({ leads: await listLeads({ courseId: options.courseId, stage: options.stage }) }, options)
    return
  }

  if (command === 'leads follow-up') {
    requireFields(options, ['leadId', 'dueAt'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, followUp: { leadId: options.leadId, dueAt: options.dueAt } }, options)
    const followUp = await createFollowUp(options.leadId, null, options.dueAt, options.note || '')
    if (!followUp) throw new Error('Lead not found')
    print({ followUp }, options)
    return
  }

  if (command === 'backups create') {
    const safety = requireSafeMutation(options, command, true)
    if (safety.dryRun) return print({ ...safety, backup: { status: 'provider-managed', database: 'postgresql' } }, options)
    throw new Error('Database backups are managed in Supabase. Create or restore backups through the Supabase project controls.')
  }

  if (command === 'migrations status') {
    const migrations = await queryMany('SELECT name, applied_at AS "appliedAt" FROM schema_migrations ORDER BY name')
    print({ adapter: 'postgresql', migrations }, options)
    return
  }

  if (command === 'rag ingest') {
    requireFields(options, ['courseId', 'title', 'content'])
    const safety = requireSafeMutation(options, command)
    if (safety.dryRun) return print({ ...safety, rag: { courseId: options.courseId, title: options.title } }, options)
    print({ rag: await ingestRagSource({ courseId: options.courseId, title: options.title, content: options.content }, null) }, options)
    return
  }

  throw new Error(`Unknown command: ${command}`)
}

try {
  await run()
} catch (error) {
  console.error(JSON.stringify({ error: error.message }))
  process.exitCode = 1
} finally {
  await closeDatabase().catch(() => {})
}
