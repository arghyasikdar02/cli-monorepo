import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import SiteIcon from '../../components/ui/SiteIcon'
import { api } from '../../lib/api'
import { adminNavigation } from './adminNavigation'

const emptyCourse = {
  title: '', slug: '', description: '', overview: '', category: 'Cybersecurity', level: 'Beginner',
  duration: '', mode: 'Online', credential: 'Certificate of Completion', prerequisites: '', price: 0,
  instructorId: '', outcomes: '', status: 'draft',
}

function formFromCourse(course) {
  return {
    ...emptyCourse,
    ...course,
    instructorId: course.instructorId || '',
    outcomes: (course.outcomes || []).join('\n'),
  }
}

function statusClass(status) {
  if (status === 'published') return 'bg-emerald-50 text-emerald-700'
  if (status === 'archived') return 'bg-slate-200 text-slate-700'
  if (status === 'unpublished') return 'bg-amber-50 text-amber-700'
  return 'bg-violet-50 text-violet-700'
}

export default function AdminCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [form, setForm] = useState(emptyCourse)
  const [editingId, setEditingId] = useState(null)
  const [confirmArchive, setConfirmArchive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const showForm = searchParams.get('create') === '1' || Boolean(editingId)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [{ courses: courseRows }, { users }] = await Promise.all([
        api.get('/api/courses/admin'),
        api.get('/api/users?role=instructor&status=active'),
      ])
      setCourses(courseRows)
      setInstructors(users)
    } catch (err) {
      setError(err.message || 'Course management data could not be loaded')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const sortedCourses = useMemo(() => [...courses].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)), [courses])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyCourse)
    setSearchParams({ create: '1' })
    setError('')
    setMessage('')
  }

  const openEdit = course => {
    setEditingId(course.id)
    setForm(formFromCourse(course))
    setSearchParams({ edit: course.id })
    setError('')
    setMessage('')
  }

  const closeForm = () => {
    setEditingId(null)
    setForm(emptyCourse)
    setSearchParams({})
  }

  const saveCourse = async event => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!form.title.trim()) return setError('Course title is required')
    if (!form.duration.trim()) return setError('Course duration is required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price || 0),
        instructorId: form.instructorId || null,
        outcomes: form.outcomes.split('\n').map(item => item.trim()).filter(Boolean),
      }
      if (editingId) await api.patch(`/api/courses/${editingId}`, payload)
      else await api.post('/api/courses', payload)
      setMessage(editingId ? 'Course changes saved.' : 'Course created as a draft.')
      closeForm()
      await load()
    } catch (err) {
      setError(err.message || 'Course could not be saved')
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (course, action) => {
    setError('')
    setMessage('')
    try {
      await api.patch(`/api/courses/${course.id}/${action}`, {})
      setConfirmArchive(null)
      setMessage(`${course.title} is now ${action === 'publish' ? 'published' : action === 'restore' ? 'a draft' : action === 'unpublish' ? 'unpublished' : 'archived'}.`)
      await load()
    } catch (err) {
      setError(err.message || 'Course status could not be changed')
    }
  }

  return (
    <StaffDashboardShell title="Courses" subtitle="Create, assign, publish and maintain the course catalogue." loginPath="/admin/login" navigation={adminNavigation}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-space-grotesk text-xl font-bold text-slate-950">Course catalogue</h2>
            <p className="mt-1 text-sm text-slate-600">Only published courses appear in the public catalogue and learner enrolment flow.</p>
          </div>
          <button type="button" onClick={openCreate} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
            <SiteIcon name="add" size={17} /> Create Course
          </button>
        </div>

        {message && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</div>}
        {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={load} className="font-bold underline">Retry</button></div>}

        {showForm && (
          <form onSubmit={saveCourse} className="border border-slate-200 bg-white p-5 shadow-sm" aria-label={editingId ? 'Edit course' : 'Create course'}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-space-grotesk text-lg font-bold">{editingId ? 'Edit course' : 'Create course'}</h2>
              <button type="button" onClick={closeForm} className="min-h-11 px-3 text-sm font-bold text-slate-600">Close</button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Course title *<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Slug<input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="generated when left blank" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Category<input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Level<input value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Duration *<input required value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="7 days" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Delivery mode<input value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Credential<input value={form.credential} onChange={e => setForm({ ...form, credential: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Fee in INR<input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Assigned instructor<select value={form.instructorId} onChange={e => setForm({ ...form, instructorId: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="">Unassigned</option>{instructors.map(user => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}</select></label>
              <label className="text-sm font-semibold text-slate-700">Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="draft">Draft</option><option value="unpublished">Unpublished</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
              <label className="text-sm font-semibold text-slate-700 md:col-span-2">Short description<textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700 md:col-span-2">Full overview<textarea rows="4" value={form.overview} onChange={e => setForm({ ...form, overview: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700 md:col-span-2">Prerequisites<textarea rows="2" value={form.prerequisites} onChange={e => setForm({ ...form, prerequisites: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700 md:col-span-2">Learning outcomes, one per line<textarea rows="4" value={form.outcomes} onChange={e => setForm({ ...form, outcomes: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
            </div>
            <button disabled={saving} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-violet-700 px-5 text-sm font-bold text-white disabled:opacity-60"><SiteIcon name="save" size={17} />{saving ? 'Saving course...' : 'Save course'}</button>
          </form>
        )}

        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          {loading ? <div className="p-8 text-sm text-slate-500" role="status">Loading courses...</div> : sortedCourses.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No courses have been created.</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Instructor</th><th className="px-4 py-3">Content</th><th className="px-4 py-3">Enrolled</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedCourses.map(course => <tr key={course.id} className="align-top">
                    <td className="px-4 py-4"><p className="font-bold text-slate-950">{course.title}</p><p className="mt-1 text-xs text-slate-500">/{course.categorySlug}/{course.slug}</p></td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass(course.status)}`}>{course.status}</span></td>
                    <td className="px-4 py-4 text-slate-600">{course.instructorName || 'Unassigned'}</td>
                    <td className="px-4 py-4 text-slate-600">{course.moduleCount} modules<br />{course.lessonCount} lessons</td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{course.enrollmentCount}</td>
                    <td className="px-4 py-4 text-slate-500">{new Date(course.updatedAt || course.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4"><div className="flex max-w-sm flex-wrap gap-2">
                      <button type="button" onClick={() => openEdit(course)} className="rounded-md border border-slate-300 px-2.5 py-1.5 font-semibold">Edit</button>
                      <Link to={`/admin/content?course=${course.id}`} className="rounded-md border border-slate-300 px-2.5 py-1.5 font-semibold">Content</Link>
                      <Link to={`/admin/enrolments?course=${course.id}`} className="rounded-md border border-slate-300 px-2.5 py-1.5 font-semibold">Enrolments</Link>
                      {course.status === 'published' ? <><Link to={`/courses/${course.categorySlug}/${course.slug}`} className="rounded-md border border-slate-300 px-2.5 py-1.5 font-semibold">Preview</Link><button type="button" onClick={() => changeStatus(course, 'unpublish')} className="rounded-md bg-amber-50 px-2.5 py-1.5 font-semibold text-amber-800">Unpublish</button></> : course.status === 'archived' ? <button type="button" onClick={() => changeStatus(course, 'restore')} className="rounded-md bg-violet-50 px-2.5 py-1.5 font-semibold text-violet-700">Restore</button> : <button type="button" onClick={() => changeStatus(course, 'publish')} className="rounded-md bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-700">Publish</button>}
                      {course.status !== 'archived' && (confirmArchive === course.id ? <><button type="button" onClick={() => changeStatus(course, 'archive')} className="rounded-md bg-red-700 px-2.5 py-1.5 font-semibold text-white">Confirm archive</button><button type="button" onClick={() => setConfirmArchive(null)} className="px-2.5 py-1.5 font-semibold text-slate-500">Cancel</button></> : <button type="button" onClick={() => setConfirmArchive(course.id)} className="rounded-md bg-red-50 px-2.5 py-1.5 font-semibold text-red-700">Archive</button>)}
                    </div></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </StaffDashboardShell>
  )
}
