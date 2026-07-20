import { useEffect, useRef, useState } from 'react'
import SiteIcon from '../../components/ui/SiteIcon'
import { api } from '../../lib/api'
import { generateInstructorPassword, instructorPasswordIssue } from '../../lib/instructorCredentials'
import { useModalFocus } from '../../lib/useModalFocus'

const EMPTY_FORM = { name: '', email: '', username: '', temporaryPassword: '', courseIds: [] }

export default function InstructorFormModal({ courses, instructor = null, onClose, onSaved }) {
  const firstField = useRef(null)
  const dialogRef = useRef(null)
  const [form, setForm] = useState(() => instructor ? {
    name: instructor.name,
    email: instructor.email,
    username: instructor.username || '',
    temporaryPassword: '',
    courseIds: instructor.assignedCourses.map(course => course.id),
  } : { ...EMPTY_FORM, temporaryPassword: generateInstructorPassword() })
  const [usernameDirty, setUsernameDirty] = useState(Boolean(instructor))
  const [usernameState, setUsernameState] = useState({ checking: false, available: Boolean(instructor?.username), message: instructor?.username ? '' : 'Set an available username before saving.' })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useModalFocus(dialogRef, onClose, firstField)

  useEffect(() => {
    if (instructor || usernameDirty || form.name.trim().length < 2) return undefined
    const timeout = window.setTimeout(async () => {
      setUsernameState({ checking: true, available: false, message: 'Generating username...' })
      try {
        const result = await api.get(`/api/admin/usernames/check?name=${encodeURIComponent(form.name)}`)
        setForm(value => ({ ...value, username: result.username }))
        setUsernameState({ checking: false, available: result.available, message: result.error || 'Username is available.' })
      } catch (err) {
        setUsernameState({ checking: false, available: false, message: err.message || 'Username could not be checked.' })
      }
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [form.name, instructor, usernameDirty])

  const set = field => event => setForm(value => ({ ...value, [field]: event.target.value }))

  const checkUsername = async value => {
    const username = String(value || form.username).trim().toLowerCase()
    setForm(current => ({ ...current, username }))
    if (!username) return setUsernameState({ checking: false, available: false, message: 'Enter a username.' })
    setUsernameState({ checking: true, available: false, message: 'Checking username...' })
    try {
      const suffix = instructor ? `&excludeUserId=${encodeURIComponent(instructor.id)}` : ''
      const result = await api.get(`/api/admin/usernames/check?username=${encodeURIComponent(username)}${suffix}`)
      setUsernameState({ checking: false, available: result.available, message: result.error || 'Username is available.' })
    } catch (err) {
      setUsernameState({ checking: false, available: false, message: err.message || 'Username could not be checked.' })
    }
  }

  const toggleCourse = courseId => {
    setForm(value => ({
      ...value,
      courseIds: value.courseIds.includes(courseId) ? value.courseIds.filter(id => id !== courseId) : [...value.courseIds, courseId],
    }))
  }

  const submit = async event => {
    event.preventDefault()
    setError('')
    if (!usernameState.available) return setError('Choose an available username before saving.')
    if (!instructor) {
      const passwordError = instructorPasswordIssue(form.temporaryPassword)
      if (passwordError) return setError(passwordError)
    }
    setSaving(true)
    try {
      const result = instructor
        ? await api.patch(`/api/admin/instructors/${instructor.id}`, { name: form.name, email: form.email, username: form.username })
        : await api.post('/api/admin/instructors', form)
      onSaved(result, instructor ? null : form.temporaryPassword)
    } catch (err) {
      setError(err.message || 'The instructor could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/70 p-4 sm:p-8" role="presentation">
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="instructor-form-title" className="mx-auto w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-700">Admin account management</p><h2 id="instructor-form-title" className="mt-1 font-space-grotesk text-2xl font-bold text-slate-950">{instructor ? 'Edit instructor' : 'Add instructor'}</h2></div><button type="button" onClick={onClose} aria-label="Close instructor form" className="grid min-h-11 min-w-11 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><SiteIcon name="close" /></button></div>
        <form onSubmit={submit} className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" required><input ref={firstField} value={form.name} onChange={set('name')} required autoComplete="name" /></Field>
            <Field label="Email address" required><input type="email" value={form.email} onChange={set('email')} required autoComplete="email" /></Field>
            <Field label="Username" required helper={usernameState.message} valid={usernameState.available} checking={usernameState.checking}>
              <input value={form.username} onChange={event => { setUsernameDirty(true); set('username')(event); setUsernameState({ checking: false, available: false, message: 'Check availability before saving.' }) }} onBlur={event => checkUsername(event.target.value)} required autoComplete="off" pattern="[A-Za-z][A-Za-z0-9._-]{2,39}" />
            </Field>
            {!instructor && <Field label="Temporary password" required helper={instructorPasswordIssue(form.temporaryPassword) || 'Strong password ready.'} valid={!instructorPasswordIssue(form.temporaryPassword)}>
              <div className="flex gap-2"><input type={showPassword ? 'text' : 'password'} value={form.temporaryPassword} onChange={set('temporaryPassword')} required minLength="14" autoComplete="new-password" className="min-w-0 flex-1" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-slate-300"><SiteIcon name={showPassword ? 'visibility_off' : 'visibility'} /></button></div>
            </Field>}
          </div>
          {!instructor && <div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setForm(value => ({ ...value, temporaryPassword: generateInstructorPassword() })); setShowPassword(true) }} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-800"><SiteIcon name="refresh" />Generate password</button><button type="button" onClick={() => navigator.clipboard.writeText(form.temporaryPassword)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-800"><SiteIcon name="content_copy" />Copy password</button></div>}
          {!instructor && <fieldset><legend className="text-sm font-bold text-slate-950">Assigned courses</legend><p className="mt-1 text-sm text-slate-500">The instructor will only manage courses assigned here.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{courses.filter(course => course.status !== 'archived').map(course => <label key={course.id} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"><input type="checkbox" checked={form.courseIds.includes(course.id)} onChange={() => toggleCourse(course.id)} className="h-4 w-4" />{course.title}</label>)}</div></fieldset>}
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
          <div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={onClose} className="min-h-11 rounded-lg px-4 text-sm font-bold text-slate-600">Cancel</button><button disabled={saving} className="min-h-11 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : instructor ? 'Save instructor' : 'Create instructor'}</button></div>
        </form>
      </section>
    </div>
  )
}

function Field({ label, required = false, helper = '', valid = false, checking = false, children }) {
  return <label className="block text-sm font-semibold text-slate-800"><span>{label}{required ? ' *' : ''}</span><span className="mt-1 block [&_input]:min-h-11 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:px-3 [&_input]:font-normal [&_input]:outline-none [&_input]:focus:border-violet-600 [&_input]:focus:ring-2 [&_input]:focus:ring-violet-100">{children}</span>{helper && <span className={`mt-1.5 block text-xs ${checking ? 'text-slate-500' : valid ? 'text-emerald-700' : 'text-amber-700'}`}>{helper}</span>}</label>
}
