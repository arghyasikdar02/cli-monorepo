import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(testDir, '../../cyberscout/src')

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(filePath)
    return /\.(?:js|jsx|ts|tsx|css)$/.test(entry.name) ? [filePath] : []
  })
}

function combinedSource() {
  return sourceFiles(frontendRoot).map(file => fs.readFileSync(file, 'utf8')).join('\n')
}

describe('authenticated frontend icon and role regressions', () => {
  it('uses bundled React icons instead of Material ligature markup or remote icon fonts', () => {
    const source = combinedSource()
    assert.doesNotMatch(source, /material-symbols-outlined|Material\+Symbols|AuthenticatedIconFont/)
    const navigation = fs.readFileSync(path.join(frontendRoot, 'components/layout/SideNav.jsx'), 'utf8')
    assert.match(navigation, /import SiteIcon/)
    assert.match(navigation, /<SiteIcon name=\{icon\}/)
  })

  it('uses Cysensei in tutor-facing navigation and copy', () => {
    const source = combinedSource()
    assert.match(source, /Cysensei/)
    assert.doesNotMatch(source, /\bAI Tutor\b|\bAI tutor\b|Ask AI/)
  })

  it('renders an explicit access-denied state for an authenticated wrong-role user', () => {
    const routeGuard = fs.readFileSync(path.join(frontendRoot, 'components/layout/RoleProtectedRoute.jsx'), 'utf8')
    assert.match(routeGuard, /<AccessDenied loginPath=\{loginPath\}/)
    assert.doesNotMatch(routeGuard, /!hasAnyRole\(user, roles\)\) return <Navigate/)
  })

  it('exposes protected operational admin controls through same-origin API paths', () => {
    const app = fs.readFileSync(path.join(frontendRoot, 'App.jsx'), 'utf8')
    const courses = fs.readFileSync(path.join(frontendRoot, 'pages/admin/AdminCoursesPage.jsx'), 'utf8')
    const content = fs.readFileSync(path.join(frontendRoot, 'pages/admin/AdminContentPage.jsx'), 'utf8')
    const liveClasses = fs.readFileSync(path.join(frontendRoot, 'pages/admin/AdminLiveClassesPage.jsx'), 'utf8')
    assert.match(app, /path="\/admin\/courses"/)
    assert.match(app, /path="\/admin\/content"/)
    assert.match(app, /path="\/admin\/live-classes"/)
    assert.match(courses, /api\.post\('\/api\/courses'/)
    assert.match(courses, /api\.patch\(`\/api\/courses\/\$\{course\.id\}\/\$\{action\}`/)
    assert.match(courses, /'publish'/)
    assert.match(courses, /'unpublish'/)
    assert.match(courses, /'archive'/)
    assert.match(courses, /'restore'/)
    assert.match(content, /\/modules/)
    assert.match(content, /\/lessons/)
    assert.match(liveClasses, /api\.post\('\/api\/live-classes'/)
    assert.match(liveClasses, /api\.createGoogleMeet/)
    assert.doesNotMatch(`${courses}\n${content}\n${liveClasses}`, /https:\/\/cyberlabin\.onrender\.com/)
  })

  it('provides instructor account management and mandatory password-change UI', () => {
    const app = fs.readFileSync(path.join(frontendRoot, 'App.jsx'), 'utf8')
    const instructors = fs.readFileSync(path.join(frontendRoot, 'pages/admin/AdminInstructorsPage.jsx'), 'utf8')
    const form = fs.readFileSync(path.join(frontendRoot, 'pages/admin/InstructorFormModal.jsx'), 'utf8')
    const credentials = fs.readFileSync(path.join(frontendRoot, 'pages/admin/InstructorCredentialModal.jsx'), 'utf8')
    const requiredChange = fs.readFileSync(path.join(frontendRoot, 'pages/auth/RequiredPasswordChangePage.jsx'), 'utf8')
    const login = fs.readFileSync(path.join(frontendRoot, 'pages/auth/LoginPage.jsx'), 'utf8')
    assert.match(app, /path="\/admin\/instructors"/)
    assert.match(app, /path="\/change-password"/)
    assert.match(instructors, /\/api\/admin\/instructors/)
    assert.match(form, /Generate password/)
    assert.match(credentials, /One-time display/)
    assert.match(requiredChange, /Change temporary password/)
    assert.match(login, /Email or username/)
    assert.doesNotMatch(`${instructors}\n${form}\n${credentials}`, /Math\.random/)
    assert.doesNotMatch(`${instructors}\n${form}\n${credentials}`, /https:\/\/cyberlabin\.onrender\.com/)
  })

  it('renders student live-class access from the backend join state', () => {
    const list = fs.readFileSync(path.join(frontendRoot, 'pages/live-classes/LiveClassListPage.jsx'), 'utf8')
    const detail = fs.readFileSync(path.join(frontendRoot, 'pages/live-classes/LiveClassDetailPage.jsx'), 'utf8')
    const session = fs.readFileSync(path.join(frontendRoot, 'pages/live-classes/LiveClassSessionPage.jsx'), 'utf8')
    assert.match(list, /cls\.canJoin/)
    assert.match(list, /cls\.denialReason/)
    assert.match(detail, /liveClass\.canJoin/)
    assert.match(detail, /liveClass\.joinAvailableAt/)
    assert.match(session, /liveClass\.joinUrl/)
    assert.doesNotMatch(list, /\{isLive \? \(/)
  })
})
