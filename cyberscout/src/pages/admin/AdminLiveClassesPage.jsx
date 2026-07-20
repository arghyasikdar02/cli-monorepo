import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import SiteIcon from '../../components/ui/SiteIcon'
import { api } from '../../lib/api'
import { adminNavigation } from './adminNavigation'
import GoogleIntegrationPanel from './GoogleIntegrationPanel'

const emptyForm = { courseId: '', instructorId: '', title: '', description: '', agenda: '', start: '', duration: 60, timezone: 'Asia/Kolkata', status: 'draft', meetingUrl: '' }

function localInput(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function classForm(liveClass) {
  const start = new Date(liveClass.scheduledStart)
  const end = new Date(liveClass.scheduledEnd)
  return {
    courseId: liveClass.courseId,
    instructorId: liveClass.instructorId || '',
    title: liveClass.title,
    description: liveClass.description || '',
    agenda: liveClass.agenda || '',
    start: localInput(liveClass.scheduledStart),
    duration: Math.max(1, Math.round((end - start) / 60_000)),
    timezone: liveClass.timezone || 'Asia/Kolkata',
    status: liveClass.status === 'cancelled' ? 'draft' : liveClass.status,
    meetingUrl: liveClass.meetingUrl || '',
  }
}

export default function AdminLiveClassesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [liveClasses, setLiveClasses] = useState([])
  const [google, setGoogle] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmCancel, setConfirmCancel] = useState('')
  const showForm = searchParams.get('create') === '1' || Boolean(editingId)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [{ courses: courseRows }, { users }, { liveClasses: classRows }] = await Promise.all([
        api.get('/api/courses/admin'), api.get('/api/users?role=instructor&status=active'), api.get('/api/live-classes'),
      ])
      setCourses(courseRows)
      setInstructors(users)
      setLiveClasses(classRows)
    } catch (err) {
      setError(err.message || 'Live classes could not be loaded')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const scheduled = useMemo(() => [...liveClasses].sort((a, b) => new Date(b.scheduledStart) - new Date(a.scheduledStart)), [liveClasses])

  const run = async (key, action, success) => {
    setWorking(key)
    setMessage('')
    setError('')
    try {
      await action()
      setMessage(success)
      await load()
    } catch (err) {
      setError(err.message || 'The live class could not be updated')
    } finally {
      setWorking('')
    }
  }

  const selectCourse = courseId => {
    const course = courses.find(item => item.id === courseId)
    setForm(current => ({ ...current, courseId, instructorId: course?.instructorId || current.instructorId }))
  }

  const save = async event => {
    event.preventDefault()
    if (!form.courseId || !form.instructorId || !form.title.trim() || !form.start) return setError('Course, instructor, title and start time are required')
    const start = new Date(form.start)
    const duration = Number(form.duration)
    if (Number.isNaN(start.getTime()) || duration < 1 || duration > 720) return setError('Enter a valid start time and a duration from 1 to 720 minutes')
    const payload = {
      courseId: form.courseId, instructorId: form.instructorId, title: form.title.trim(), description: form.description.trim(), agenda: form.agenda.trim(),
      scheduledStart: start.toISOString(), scheduledEnd: new Date(start.getTime() + duration * 60_000).toISOString(), timezone: form.timezone,
      status: form.status, provider: 'manual', meetingUrl: form.meetingUrl.trim() || null, joinUrl: form.meetingUrl.trim() || null,
    }
    setWorking('save')
    setError('')
    setMessage('')
    try {
      if (editingId) await api.patch(`/api/live-classes/${editingId}`, payload)
      else await api.post('/api/live-classes', payload)
      setMessage(editingId ? 'Live class schedule updated.' : form.status === 'scheduled' ? 'Live class scheduled for enrolled students.' : 'Live class saved as a draft.')
      setEditingId('')
      setForm(emptyForm)
      setSearchParams({})
      await load()
    } catch (err) {
      setError(err.message || 'Live class could not be saved')
    } finally {
      setWorking('')
    }
  }

  const edit = liveClass => {
    setEditingId(liveClass.id)
    setForm(classForm(liveClass))
    setSearchParams({ edit: liveClass.id })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeForm = () => { setEditingId(''); setForm(emptyForm); setSearchParams({}) }

  const createMeet = liveClass => {
    if (!google?.connected || !google?.meetScopeGranted) return setError('Connect Google and grant Meet creation permission before creating a Meet link')
    run(`meet-${liveClass.id}`, () => api.createGoogleMeet(liveClass.id), 'Google Meet created and saved to the live class.')
  }

  const copyMeet = async liveClass => {
    try {
      await navigator.clipboard.writeText(liveClass.meetingUrl)
      setMessage('Meet link copied.')
    } catch {
      setError('The Meet link could not be copied. Open it and copy it from the browser.')
    }
  }

  return (
    <StaffDashboardShell title="Live Classes" subtitle="Schedule, publish and manage course-specific live sessions." loginPath="/admin/login" navigation={adminNavigation}>
      <div className="space-y-6">
        <GoogleIntegrationPanel compact redirect="/admin/live-classes" onStatus={setGoogle} />
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-space-grotesk text-xl font-bold">Class schedule</h2><p className="mt-1 text-sm text-slate-600">Draft classes stay hidden. Scheduled classes appear only to enrolled learners in the linked course.</p></div><button type="button" onClick={() => { setForm(emptyForm); setEditingId(''); setSearchParams({ create: '1' }) }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white"><SiteIcon name="add" size={17} />Create live class</button></div>
        {message && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</div>}
        {error && <div role="alert" className="flex justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={load} className="font-bold underline">Retry</button></div>}

        {showForm && <form onSubmit={save} className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="font-space-grotesk text-lg font-bold">{editingId ? 'Reschedule or edit live class' : 'Create live class'}</h2><button type="button" onClick={closeForm} className="min-h-11 px-3 text-sm font-bold text-slate-600">Close</button></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">Course *<select required value={form.courseId} onChange={event => selectCourse(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="">Select course</option>{courses.filter(course => course.status !== 'archived').map(course => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
            <label className="text-sm font-semibold">Instructor *<select required value={form.instructorId} onChange={event => setForm({ ...form, instructorId: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="">Select instructor</option>{instructors.map(user => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}</select></label>
            <label className="text-sm font-semibold md:col-span-2">Class title *<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
            <label className="text-sm font-semibold md:col-span-2">Description<textarea rows="2" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
            <label className="text-sm font-semibold md:col-span-2">Agenda<textarea rows="3" value={form.agenda} onChange={event => setForm({ ...form, agenda: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
            <label className="text-sm font-semibold">Start date and time *<input required type="datetime-local" value={form.start} onChange={event => setForm({ ...form, start: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
            <label className="text-sm font-semibold">Duration in minutes *<input required type="number" min="1" max="720" value={form.duration} onChange={event => setForm({ ...form, duration: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
            <label className="text-sm font-semibold">Timezone<input value={form.timezone} onChange={event => setForm({ ...form, timezone: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
            <label className="text-sm font-semibold">Visibility<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="draft">Save as draft</option><option value="scheduled">Publish to enrolled students</option></select></label>
            <label className="text-sm font-semibold md:col-span-2">Manual meeting URL<input type="url" value={form.meetingUrl} onChange={event => setForm({ ...form, meetingUrl: event.target.value })} placeholder="Optional when Google Meet will be generated later" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
          </div>
          <button disabled={working === 'save'} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-violet-700 px-5 text-sm font-bold text-white disabled:opacity-60"><SiteIcon name="save" size={17} />{working === 'save' ? 'Saving class...' : 'Save live class'}</button>
        </form>}

        <section className="space-y-3">
          {loading ? <div className="border border-slate-200 bg-white p-8 text-sm text-slate-500" role="status">Loading live classes...</div> : scheduled.length === 0 ? <div className="border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No live classes have been created.</div> : scheduled.map(liveClass => <article key={liveClass.id} className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-space-grotesk text-lg font-bold text-slate-950">{liveClass.title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${liveClass.status === 'scheduled' ? 'bg-emerald-50 text-emerald-700' : liveClass.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{liveClass.status}</span></div><p className="mt-1 text-sm font-semibold text-violet-700">{liveClass.courseTitle}</p><p className="mt-2 text-sm text-slate-600">{new Date(liveClass.scheduledStart).toLocaleString()} · {Math.round((new Date(liveClass.scheduledEnd) - new Date(liveClass.scheduledStart)) / 60_000)} minutes · {liveClass.timezone}</p><p className="mt-1 text-sm text-slate-500">Instructor: {liveClass.instructor}</p>{liveClass.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{liveClass.description}</p>}{liveClass.meetingUrl && <p className="mt-3 break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{liveClass.meetingUrl}</p>}</div>
              <div className="flex max-w-md flex-wrap gap-2"><button type="button" onClick={() => edit(liveClass)} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold">Edit or reschedule</button>{liveClass.status === 'draft' && <button type="button" onClick={() => run(`publish-${liveClass.id}`, () => api.patch(`/api/live-classes/${liveClass.id}`, { status: 'scheduled' }), 'Live class published to enrolled students.')} className="min-h-10 rounded-lg bg-emerald-50 px-3 text-sm font-bold text-emerald-700">Publish</button>}{!liveClass.meetingUrl && (google?.connected && google?.meetScopeGranted ? <button type="button" disabled={working === `meet-${liveClass.id}`} onClick={() => createMeet(liveClass)} className="min-h-10 rounded-lg bg-violet-700 px-3 text-sm font-bold text-white disabled:opacity-60">{working === `meet-${liveClass.id}` ? 'Creating Meet...' : 'Create Google Meet'}</button> : <button type="button" onClick={() => window.location.assign('/admin/google')} className="min-h-10 rounded-lg bg-violet-50 px-3 text-sm font-bold text-violet-700">Connect Google</button>)}{liveClass.meetingUrl && <><button type="button" onClick={() => copyMeet(liveClass)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-bold"><SiteIcon name="content_copy" size={15} />Copy Meet link</button><a href={liveClass.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white">Start or join Meet<SiteIcon name="external_link" size={15} /></a></>}{liveClass.status !== 'cancelled' && (confirmCancel === liveClass.id ? <><button type="button" onClick={() => run(`cancel-${liveClass.id}`, () => api.patch(`/api/live-classes/${liveClass.id}`, { status: 'cancelled' }), 'Live class cancelled. Enrolled students will see the update.').then(() => setConfirmCancel(''))} className="min-h-10 rounded-lg bg-red-700 px-3 text-sm font-bold text-white">Confirm cancellation</button><button type="button" onClick={() => setConfirmCancel('')} className="min-h-10 px-3 text-sm font-bold text-slate-600">Keep class</button></> : <button type="button" onClick={() => setConfirmCancel(liveClass.id)} className="min-h-10 rounded-lg border border-red-200 px-3 text-sm font-bold text-red-700">Cancel class</button>)}</div>
            </div>
          </article>)}
        </section>
      </div>
    </StaffDashboardShell>
  )
}
