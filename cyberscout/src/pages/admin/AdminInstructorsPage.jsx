import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import SiteIcon from '../../components/ui/SiteIcon'
import { api } from '../../lib/api'
import { adminNavigation } from './adminNavigation'
import InstructorCredentialModal from './InstructorCredentialModal'
import InstructorFormModal from './InstructorFormModal'
import { useModalFocus } from '../../lib/useModalFocus'

const STATUS_OPTIONS = ['all', 'active', 'suspended', 'archived']

function formatDate(value) {
  if (!value) return 'Never'
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function statusStyle(status) {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700'
  if (status === 'suspended') return 'bg-amber-50 text-amber-800'
  return 'bg-slate-200 text-slate-700'
}

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState([])
  const [courses, setCourses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ search: '', status: 'all', courseId: '', page: 1 })
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [formInstructor, setFormInstructor] = useState(undefined)
  const [credentials, setCredentials] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [courseEditor, setCourseEditor] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filters.search.trim()) params.set('search', filters.search.trim())
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.courseId) params.set('courseId', filters.courseId)
      params.set('page', String(filters.page))
      const [people, catalogue] = await Promise.all([
        api.get(`/api/admin/instructors?${params}`),
        api.get('/api/courses/admin'),
      ])
      setInstructors(people.instructors)
      setPagination(people.pagination)
      setCourses(catalogue.courses)
    } catch (err) {
      setError(err.message || 'Instructor accounts could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const timeout = window.setTimeout(load, 250)
    return () => window.clearTimeout(timeout)
  }, [load])

  const closeForm = () => setFormInstructor(undefined)

  const formSaved = (result, fallbackPassword) => {
    closeForm()
    const instructor = result.instructor
    if (result.temporaryPassword || fallbackPassword) {
      setCredentials({ ...instructor, temporaryPassword: result.temporaryPassword || fallbackPassword })
      setMessage('Instructor account created. Save the one-time credentials now.')
    } else {
      setMessage('Instructor profile updated.')
    }
    load()
  }

  const run = async (key, operation, success) => {
    setWorking(key)
    setError('')
    setMessage('')
    try {
      const result = await operation()
      setMessage(success)
      await load()
      return result
    } catch (err) {
      setError(err.message || 'The account change could not be completed.')
      throw err
    } finally {
      setWorking('')
    }
  }

  const resetPassword = async instructor => {
    try {
      const result = await run(`reset-${instructor.id}`, () => api.post(`/api/admin/instructors/${instructor.id}/reset-password`, {}), 'A new temporary password was issued.')
      setConfirmAction(null)
      setCredentials({ ...result.instructor, temporaryPassword: result.temporaryPassword })
    } catch {
      setConfirmAction(null)
    }
  }

  const changeStatus = async (instructor, action, confirmFutureClasses = false) => {
    try {
      await run(`${action}-${instructor.id}`, () => api.post(`/api/admin/instructors/${instructor.id}/${action}`, { confirmFutureClasses }), `Instructor ${action === 'reactivate' ? 'reactivated' : action === 'suspend' ? 'suspended' : 'archived'}.`)
      setConfirmAction(null)
    } catch (err) {
      if (err.code === 'FUTURE_LIVE_CLASSES' && !confirmFutureClasses) {
        setConfirmAction({
          title: 'Future live classes need attention',
          body: `${err.message} Archiving invalidates the instructor’s sessions but does not delete those classes.`,
          confirmLabel: 'Archive after review',
          onConfirm: () => changeStatus(instructor, action, true),
        })
      } else setConfirmAction(null)
    }
  }

  const saveCourses = async (instructor, courseIds, confirmFutureClasses = false) => {
    setWorking(`courses-${instructor.id}`)
    setError('')
    try {
      await api.put(`/api/admin/instructors/${instructor.id}/courses`, { courseIds, confirmFutureClasses })
      setCourseEditor(null)
      setMessage('Course assignments updated.')
      await load()
    } catch (err) {
      if (err.code === 'FUTURE_LIVE_CLASSES' && !confirmFutureClasses) {
        setConfirmAction({
          title: 'Review future live classes',
          body: `${err.message} Continue only after checking the Live Classes page.`,
          confirmLabel: 'Update assignments',
          onConfirm: () => saveCourses(instructor, courseIds, true),
        })
      } else setError(err.message || 'Course assignments could not be updated.')
    } finally {
      setWorking('')
    }
  }

  const activeCourses = useMemo(() => courses.filter(course => course.status !== 'archived'), [courses])

  return (
    <StaffDashboardShell title="Instructors" subtitle="Create instructor logins, control account access and assign course ownership." loginPath="/admin/login" navigation={adminNavigation}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-slate-600">{pagination.total} instructor account{pagination.total === 1 ? '' : 's'}</p></div><button type="button" onClick={() => setFormInstructor(null)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white"><SiteIcon name="add" />Add Instructor</button></div>
        {message && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</div>}
        {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={load} className="min-h-10 font-bold underline">Retry</button></div>}
        <section className="border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-3"><label className="text-sm font-semibold text-slate-700">Search<input type="search" value={filters.search} onChange={event => setFilters(value => ({ ...value, search: event.target.value, page: 1 }))} placeholder="Name, username or email" className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 font-normal" /></label><label className="text-sm font-semibold text-slate-700">Status<select value={filters.status} onChange={event => setFilters(value => ({ ...value, status: event.target.value, page: 1 }))} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 font-normal capitalize">{STATUS_OPTIONS.map(status => <option key={status} value={status}>{status === 'all' ? 'All statuses' : status}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Assigned course<select value={filters.courseId} onChange={event => setFilters(value => ({ ...value, courseId: event.target.value, page: 1 }))} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 font-normal"><option value="">All courses</option>{activeCourses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label></div></section>
        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          {loading ? <div className="p-8 text-sm text-slate-500" role="status">Loading instructor accounts...</div> : instructors.length === 0 ? <div className="p-10 text-center"><SiteIcon name="presentation" size={28} className="mx-auto text-slate-400" /><h2 className="mt-3 font-space-grotesk text-lg font-bold">No instructors found</h2><p className="mt-1 text-sm text-slate-500">Create an instructor or adjust the search filters.</p></div> : <div className="overflow-x-auto"><table className="min-w-[1050px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Instructor</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Assigned courses</th><th className="px-4 py-3">Created / last login</th><th className="px-4 py-3">Password</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{instructors.map(instructor => <InstructorRow key={instructor.id} instructor={instructor} working={working} onView={() => setViewing(instructor)} onEdit={() => setFormInstructor(instructor)} onCourses={() => setCourseEditor(instructor)} onReset={() => setConfirmAction({ title: 'Reset instructor password?', body: 'The current password and active sessions will stop working. A new temporary password will be shown once.', confirmLabel: 'Reset password', onConfirm: () => resetPassword(instructor) })} onStatus={action => setConfirmAction({ title: `${action === 'reactivate' ? 'Reactivate' : action === 'suspend' ? 'Suspend' : 'Archive'} ${instructor.name}?`, body: action === 'reactivate' ? 'The instructor will be able to log in again.' : action === 'suspend' ? 'Current sessions will be invalidated and login will be blocked.' : 'The account will be removed from active use but retained for audit history.', confirmLabel: action === 'reactivate' ? 'Reactivate instructor' : action === 'suspend' ? 'Suspend instructor' : 'Archive instructor', onConfirm: () => changeStatus(instructor, action) })} />)}</tbody></table></div>}
        </section>
        {pagination.pages > 1 && <nav aria-label="Instructor pages" className="flex items-center justify-between"><button type="button" disabled={pagination.page <= 1} onClick={() => setFilters(value => ({ ...value, page: value.page - 1 }))} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold disabled:opacity-50">Previous</button><span className="text-sm text-slate-600">Page {pagination.page} of {pagination.pages}</span><button type="button" disabled={pagination.page >= pagination.pages} onClick={() => setFilters(value => ({ ...value, page: value.page + 1 }))} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold disabled:opacity-50">Next</button></nav>}
      </div>
      {formInstructor !== undefined && <InstructorFormModal courses={activeCourses} instructor={formInstructor} onClose={closeForm} onSaved={formSaved} />}
      {credentials && <InstructorCredentialModal credentials={credentials} onClose={() => setCredentials(null)} />}
      {viewing && <InstructorDetailsModal instructor={viewing} onClose={() => setViewing(null)} />}
      {courseEditor && <CourseAssignmentModal instructor={courseEditor} courses={activeCourses} saving={working === `courses-${courseEditor.id}`} onClose={() => setCourseEditor(null)} onSave={courseIds => saveCourses(courseEditor, courseIds)} />}
      {confirmAction && <ConfirmationModal {...confirmAction} busy={Boolean(working)} onClose={() => setConfirmAction(null)} />}
    </StaffDashboardShell>
  )
}

function InstructorRow({ instructor, working, onView, onEdit, onCourses, onReset, onStatus }) {
  return <tr className="align-top"><td className="px-4 py-4"><p className="font-bold text-slate-950">{instructor.name}</p><p className="mt-1 text-slate-600">{instructor.username ? `@${instructor.username}` : 'No username set'}</p><p className="text-slate-500">{instructor.email}</p></td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyle(instructor.status)}`}>{instructor.status}</span></td><td className="max-w-xs px-4 py-4">{instructor.assignedCourses.length ? <div className="flex flex-wrap gap-1.5">{instructor.assignedCourses.map(course => <span key={course.id} className="rounded-md bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800">{course.title}</span>)}</div> : <span className="text-slate-500">No courses assigned</span>}</td><td className="px-4 py-4 text-xs leading-5 text-slate-600"><p>Created {formatDate(instructor.createdAt)}</p><p>Last login {formatDate(instructor.lastLogin)}</p></td><td className="px-4 py-4"><span className={`text-xs font-bold ${instructor.mustChangePassword ? 'text-amber-700' : 'text-emerald-700'}`}>{instructor.mustChangePassword ? 'Change required' : 'Current'}</span></td><td className="px-4 py-4"><div className="flex max-w-xs flex-wrap gap-1.5"><Action label="View" onClick={onView} /><Action label="Edit" onClick={onEdit} /><Action label="Courses" onClick={onCourses} /><Action label="Reset password" onClick={onReset} disabled={Boolean(working)} />{instructor.status === 'active' ? <Action label="Suspend" onClick={() => onStatus('suspend')} tone="warning" /> : <Action label="Reactivate" onClick={() => onStatus('reactivate')} tone="success" />}{instructor.status !== 'archived' && <Action label="Archive" onClick={() => onStatus('archive')} tone="danger" />}</div></td></tr>
}

function Action({ label, onClick, disabled = false, tone = 'default' }) {
  const color = tone === 'danger' ? 'border-red-200 text-red-700' : tone === 'warning' ? 'border-amber-200 text-amber-800' : tone === 'success' ? 'border-emerald-200 text-emerald-700' : 'border-slate-300 text-slate-700'
  return <button type="button" disabled={disabled} onClick={onClick} className={`min-h-10 rounded-md border px-2.5 text-xs font-bold disabled:opacity-50 ${color}`}>{label}</button>
}

function InstructorDetailsModal({ instructor, onClose }) {
  return <SimpleModal title={instructor.name} onClose={onClose}><dl className="grid gap-4 text-sm sm:grid-cols-2"><Detail label="Username" value={instructor.username ? `@${instructor.username}` : 'Not set'} /><Detail label="Email" value={instructor.email} /><Detail label="Status" value={instructor.status} /><Detail label="Password status" value={instructor.mustChangePassword ? 'Change required at next login' : 'Password set by instructor'} /><Detail label="Created" value={formatDate(instructor.createdAt)} /><Detail label="Last login" value={formatDate(instructor.lastLogin)} /></dl><div className="mt-5"><h3 className="text-sm font-bold">Assigned courses</h3><p className="mt-2 text-sm text-slate-600">{instructor.assignedCourses.map(course => course.title).join(', ') || 'No courses assigned.'}</p></div></SimpleModal>
}

function Detail({ label, value }) { return <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value}</dd></div> }

function CourseAssignmentModal({ instructor, courses, saving, onClose, onSave }) {
  const [selected, setSelected] = useState(instructor.assignedCourses.map(course => course.id))
  return <SimpleModal title={`Assign courses to ${instructor.name}`} onClose={onClose}><p className="text-sm text-slate-600">Removing a course never deletes the instructor account. Future live classes must be reviewed before ownership changes.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{courses.map(course => <label key={course.id} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"><input type="checkbox" checked={selected.includes(course.id)} onChange={() => setSelected(value => value.includes(course.id) ? value.filter(id => id !== course.id) : [...value, course.id])} className="h-4 w-4" />{course.title}</label>)}</div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="min-h-11 px-4 text-sm font-bold text-slate-600">Cancel</button><button type="button" disabled={saving} onClick={() => onSave(selected)} className="min-h-11 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save assignments'}</button></div></SimpleModal>
}

function ConfirmationModal({ title, body, confirmLabel, onConfirm, onClose, busy }) {
  return <SimpleModal title={title} onClose={onClose}><p className="text-sm leading-6 text-slate-600">{body}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="min-h-11 px-4 text-sm font-bold text-slate-600">Cancel</button><button type="button" disabled={busy} onClick={onConfirm} className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-bold text-white disabled:opacity-60">{busy ? 'Working...' : confirmLabel}</button></div></SimpleModal>
}

function SimpleModal({ title, onClose, children }) {
  const dialogRef = useRef(null)
  useModalFocus(dialogRef, onClose)
  return <div className="fixed inset-0 z-[95] grid place-items-center overflow-y-auto bg-slate-950/70 p-4" role="presentation"><section ref={dialogRef} role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><h2 className="font-space-grotesk text-xl font-bold text-slate-950">{title}</h2><button type="button" onClick={onClose} aria-label="Close" className="grid min-h-11 min-w-11 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><SiteIcon name="close" /></button></div><div className="mt-4">{children}</div></section></div>
}
