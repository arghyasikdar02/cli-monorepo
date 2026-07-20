import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import { api } from '../../lib/api'
import { adminNavigation } from './adminNavigation'

export default function AdminPeoplePage({ mode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [students, setStudents] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmRemove, setConfirmRemove] = useState('')
  const courseId = searchParams.get('course') || ''

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [{ courses: courseRows }, { users: instructorRows }, { users: studentRows }] = await Promise.all([
        api.get('/api/courses/admin'),
        api.get('/api/users?role=instructor&status=active'),
        api.get('/api/users?role=student&status=active'),
      ])
      setCourses(courseRows)
      setInstructors(instructorRows)
      setStudents(studentRows)
      if (courseId) {
        const result = await api.get(`/api/enrollments/courses/${courseId}`)
        setEnrollments(result.enrollments)
      } else setEnrollments([])
    } catch (err) {
      setError(err.message || 'People and enrolments could not be loaded')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => { load() }, [load])

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return students
    return students.filter(user => `${user.name} ${user.email}`.toLowerCase().includes(value))
  }, [search, students])

  const run = async (key, action, success) => {
    setWorking(key)
    setError('')
    setMessage('')
    try {
      await action()
      setMessage(success)
      await load()
    } catch (err) {
      setError(err.message || 'The requested change could not be saved')
    } finally {
      setWorking('')
    }
  }

  const assignInstructor = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const selectedCourse = String(data.get('courseId') || '')
    const instructorId = String(data.get('instructorId') || '')
    if (!selectedCourse || !instructorId) return setError('Select both a course and an instructor')
    run('assign', () => api.patch(`/api/courses/${selectedCourse}`, { instructorId }), 'Instructor assigned to the course.')
  }

  const addEnrollment = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const userId = String(data.get('userId') || '')
    if (!courseId || !userId) return setError('Select a course and student')
    run('enroll', () => api.post('/api/enrollments', { courseId, userId }), 'Student enrolment is active.')
  }

  const remove = enrollment => run(`remove-${enrollment.id}`, () => api.delete(`/api/enrollments/${enrollment.id}`), 'Student enrolment removed.').then(() => setConfirmRemove(''))

  const instructorMode = mode === 'instructors'

  return (
    <StaffDashboardShell
      title={instructorMode ? 'Instructors' : 'Students and Enrolments'}
      subtitle={instructorMode ? 'Review active instructors and assign them to courses.' : 'Search students and manage course access.'}
      loginPath="/admin/login"
      navigation={adminNavigation}
    >
      <div className="space-y-6">
        {message && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</div>}
        {error && <div role="alert" className="flex justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={load} className="font-bold underline">Retry</button></div>}
        {loading ? <div className="border border-slate-200 bg-white p-8 text-sm text-slate-500" role="status">Loading people...</div> : instructorMode ? <>
          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-space-grotesk text-lg font-bold">Assign an instructor</h2>
            <form onSubmit={assignInstructor} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <label className="text-sm font-semibold">Course<select name="courseId" defaultValue="" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="">Select course</option>{courses.filter(course => course.status !== 'archived').map(course => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
              <label className="text-sm font-semibold">Instructor<select name="instructorId" defaultValue="" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="">Select instructor</option>{instructors.map(user => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}</select></label>
              <button disabled={working === 'assign'} className="mt-6 min-h-11 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-60">{working === 'assign' ? 'Assigning...' : 'Assign instructor'}</button>
            </form>
          </section>
          <section className="border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-space-grotesk text-lg font-bold">Active instructors</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{instructors.length ? instructors.map(user => <article key={user.id} className="rounded-lg border border-slate-200 p-4"><p className="font-bold text-slate-950">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p><p className="mt-2 text-xs font-bold uppercase tracking-wider text-violet-700">{courses.filter(course => course.instructorId === user.id).length} assigned courses</p></article>) : <p className="text-sm text-slate-500">No active instructor accounts are available.</p>}</div></section>
        </> : <>
          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold">Course<select value={courseId} onChange={event => setSearchParams(event.target.value ? { course: event.target.value } : {})} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="">Select course</option>{courses.filter(course => course.status !== 'archived').map(course => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><label className="text-sm font-semibold">Search students<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name or email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label></div>
            <form onSubmit={addEnrollment} className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-semibold">Student<select name="userId" defaultValue="" disabled={!courseId} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal disabled:bg-slate-100"><option value="">Select student</option>{filteredStudents.map(user => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}</select></label><button disabled={!courseId || working === 'enroll'} className="min-h-11 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-50">{working === 'enroll' ? 'Saving...' : 'Enrol student'}</button></form>
          </section>
          <section className="overflow-hidden border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-space-grotesk text-lg font-bold">Current enrolments</h2></div>{!courseId ? <p className="p-8 text-center text-sm text-slate-500">Select a course to view its students.</p> : enrollments.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No students are enrolled in this course.</p> : <div className="divide-y divide-slate-100">{enrollments.map(enrollment => <div key={enrollment.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-950">{enrollment.user_name}</p><p className="text-sm text-slate-500">{enrollment.user_email}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-violet-700">{enrollment.status}</p></div>{enrollment.status === 'active' && <div className="flex gap-2">{confirmRemove === enrollment.id ? <><button type="button" disabled={working === `remove-${enrollment.id}`} onClick={() => remove(enrollment)} className="min-h-10 rounded-lg bg-red-700 px-3 text-sm font-bold text-white">Confirm removal</button><button type="button" onClick={() => setConfirmRemove('')} className="min-h-10 px-3 text-sm font-bold text-slate-600">Cancel</button></> : <button type="button" onClick={() => setConfirmRemove(enrollment.id)} className="min-h-10 rounded-lg border border-red-200 px-3 text-sm font-bold text-red-700">Remove enrolment</button>}</div>}</div>)}</div>}</section>
        </>}
      </div>
    </StaffDashboardShell>
  )
}
