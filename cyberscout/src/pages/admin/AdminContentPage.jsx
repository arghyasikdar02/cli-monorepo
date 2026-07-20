import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import SiteIcon from '../../components/ui/SiteIcon'
import { api } from '../../lib/api'
import { adminNavigation } from './adminNavigation'

function field(form, name) {
  return String(new FormData(form).get(name) || '').trim()
}

function moveIds(items, index, direction) {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= items.length) return null
  const ids = items.map(item => item.id)
  ;[ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]]
  return ids
}

export default function AdminContentPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [lessonModule, setLessonModule] = useState('')

  const courseId = searchParams.get('course') || ''

  const loadCourses = useCallback(async () => {
    const result = await api.get('/api/courses/admin')
    setCourses(result.courses)
    if (!courseId && result.courses[0]) setSearchParams({ course: result.courses[0].id }, { replace: true })
  }, [courseId, setSearchParams])

  const loadCourse = useCallback(async () => {
    if (!courseId) return setCourse(null)
    const result = await api.get(`/api/courses/admin/${courseId}`)
    setCourse(result.course)
  }, [courseId])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await loadCourses()
      await loadCourse()
    } catch (err) {
      setError(err.message || 'Course content could not be loaded')
    } finally {
      setLoading(false)
    }
  }, [loadCourse, loadCourses])

  useEffect(() => { refresh() }, [refresh])

  const run = async (key, action, success) => {
    setWorking(key)
    setError('')
    setMessage('')
    try {
      await action()
      setMessage(success)
      await loadCourse()
    } catch (err) {
      setError(err.message || 'Content could not be saved')
    } finally {
      setWorking('')
    }
  }

  const createModule = event => {
    event.preventDefault()
    const form = event.currentTarget
    const title = field(form, 'title')
    const description = field(form, 'description')
    if (!title) return setError('Module title is required')
    run('module-new', () => api.post(`/api/courses/${courseId}/modules`, { title, description }), 'Module added.').then(() => form.reset())
  }

  const updateModule = (event, moduleId) => {
    event.preventDefault()
    const title = field(event.currentTarget, 'title')
    const description = field(event.currentTarget, 'description')
    if (!title) return setError('Module title is required')
    run(`module-${moduleId}`, () => api.patch(`/api/courses/${courseId}/modules/${moduleId}`, { title, description }), 'Module updated.')
  }

  const reorderModules = (index, direction) => {
    const moduleIds = moveIds(course.modules, index, direction)
    if (moduleIds) run('module-order', () => api.post(`/api/courses/${courseId}/modules/reorder`, { moduleIds }), 'Module order updated.')
  }

  const createLesson = (event, moduleId) => {
    event.preventDefault()
    const form = event.currentTarget
    const title = field(form, 'title')
    if (!title) return setError('Lesson title is required')
    const payload = {
      title,
      duration: field(form, 'duration') || '10 min',
      type: field(form, 'type') || 'text',
      resourceUrl: field(form, 'resourceUrl') || null,
      content: field(form, 'content'),
      status: field(form, 'status') || 'draft',
    }
    run(`lesson-new-${moduleId}`, () => api.post(`/api/courses/${courseId}/modules/${moduleId}/lessons`, payload), 'Lesson added.').then(() => { setLessonModule(''); form?.reset?.() })
  }

  const updateLesson = (event, moduleId, lessonId) => {
    event.preventDefault()
    const form = event.currentTarget
    const payload = {
      title: field(form, 'title'), duration: field(form, 'duration'), type: field(form, 'type'),
      resourceUrl: field(form, 'resourceUrl') || null, content: field(form, 'content'), status: field(form, 'status'),
    }
    if (!payload.title) return setError('Lesson title is required')
    run(`lesson-${lessonId}`, () => api.patch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, payload), 'Lesson updated.')
  }

  const reorderLesson = (module, index, direction) => {
    const lessonIds = moveIds(module.lessons, index, direction)
    if (lessonIds) run(`lesson-order-${module.id}`, () => api.post(`/api/courses/${courseId}/modules/${module.id}/lessons/reorder`, { lessonIds }), 'Lesson order updated.')
  }

  const createResource = event => {
    event.preventDefault()
    const form = event.currentTarget
    const title = field(form, 'title')
    const type = field(form, 'type')
    if (!title || !type) return setError('Resource title and type are required')
    run('resource-new', () => api.post(`/api/courses/${courseId}/resources`, {
      title, type, lessonId: field(form, 'lessonId') || null, description: field(form, 'description'),
      resourceUrl: field(form, 'resourceUrl') || null, content: field(form, 'content'), isPublic: new FormData(form).get('isPublic') === 'on',
    }), 'Resource added.').then(() => form?.reset?.())
  }

  return (
    <StaffDashboardShell title="Modules and Lessons" subtitle="Build the ordered course structure and attach learner resources." loginPath="/admin/login" navigation={adminNavigation}>
      <div className="space-y-6">
        <label className="block max-w-xl text-sm font-semibold text-slate-700">Course<select value={courseId} onChange={e => setSearchParams({ course: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"><option value="">Select a course</option>{courses.map(item => <option key={item.id} value={item.id}>{item.title} ({item.status})</option>)}</select></label>
        {message && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</div>}
        {error && <div role="alert" className="flex justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={refresh} className="font-bold underline">Retry</button></div>}
        {loading ? <div className="border border-slate-200 bg-white p-8 text-sm text-slate-500" role="status">Loading course structure...</div> : !course ? <div className="border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Create or select a course to manage its content.</div> : <>
          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-space-grotesk text-xl font-bold">{course.title}</h2><p className="mt-1 text-sm text-slate-500">{course.modules.length} modules, {course.lessonCount} lessons, {course.materials.length} resources</p></div>{course.status === 'published' && <Link to={`/courses/${course.categorySlug}/${course.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold"><SiteIcon name="visibility" size={17} />Preview course</Link>}</div>
            <form onSubmit={createModule} className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-[1fr_2fr_auto]">
              <label className="text-sm font-semibold">Module title<input name="title" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold">Description<input name="description" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
              <button disabled={working === 'module-new'} className="mt-6 min-h-11 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-60">{working === 'module-new' ? 'Adding...' : 'Add module'}</button>
            </form>
          </section>

          <div className="space-y-5">
            {course.modules.length === 0 && <div className="border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No modules yet. Add the first module above.</div>}
            {course.modules.map((module, moduleIndex) => <section key={module.id} className="border border-slate-200 bg-white p-5 shadow-sm">
              <form onSubmit={event => updateModule(event, module.id)} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
                <label className="text-sm font-semibold">Module title<input name="title" defaultValue={module.title} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold">Description<input name="description" defaultValue={module.description} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
                <div className="mt-6 flex gap-2"><button disabled={working === `module-${module.id}`} className="min-h-11 rounded-lg bg-violet-700 px-3 text-sm font-bold text-white">Save</button><button type="button" aria-label="Move module up" disabled={moduleIndex === 0} onClick={() => reorderModules(moduleIndex, -1)} className="min-h-11 rounded-lg border border-slate-300 px-3 disabled:opacity-40"><SiteIcon name="arrow_upward" /></button><button type="button" aria-label="Move module down" disabled={moduleIndex === course.modules.length - 1} onClick={() => reorderModules(moduleIndex, 1)} className="min-h-11 rotate-180 rounded-lg border border-slate-300 px-3 disabled:opacity-40"><SiteIcon name="arrow_upward" /></button></div>
              </form>
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                {module.lessons.length === 0 && <p className="text-sm text-slate-500">No lessons in this module.</p>}
                {module.lessons.map((lesson, lessonIndex) => <form key={lesson.id} onSubmit={event => updateLesson(event, module.id, lesson.id)} className="grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-6">
                  <label className="text-xs font-bold text-slate-600 xl:col-span-2">Lesson title<input name="title" defaultValue={lesson.title} className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-slate-600">Duration<input name="duration" defaultValue={lesson.duration} className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-slate-600">Type<select name="type" defaultValue={lesson.type} className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm font-normal"><option value="text">Text</option><option value="video">Video</option><option value="document">Document</option><option value="link">Link</option><option value="lab">Lab</option><option value="quiz">Quiz</option><option value="assignment">Assignment</option></select></label>
                  <label className="text-xs font-bold text-slate-600">Status<select name="status" defaultValue={lesson.status} className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm font-normal"><option value="draft">Draft</option><option value="published">Published</option></select></label>
                  <div className="flex items-end gap-1"><button className="min-h-10 rounded-md bg-slate-900 px-3 text-xs font-bold text-white">Save</button><button type="button" aria-label="Move lesson up" disabled={lessonIndex === 0} onClick={() => reorderLesson(module, lessonIndex, -1)} className="min-h-10 border border-slate-300 px-2 disabled:opacity-40"><SiteIcon name="arrow_upward" size={15} /></button><button type="button" aria-label="Move lesson down" disabled={lessonIndex === module.lessons.length - 1} onClick={() => reorderLesson(module, lessonIndex, 1)} className="min-h-10 rotate-180 border border-slate-300 px-2 disabled:opacity-40"><SiteIcon name="arrow_upward" size={15} /></button></div>
                  <label className="text-xs font-bold text-slate-600 md:col-span-2 xl:col-span-3">Resource URL<input name="resourceUrl" type="url" defaultValue={lesson.resourceUrl || ''} className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-slate-600 md:col-span-2 xl:col-span-3">Lesson content<textarea name="content" rows="2" defaultValue={lesson.content} className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm font-normal" /></label>
                </form>)}
              </div>
              {lessonModule === module.id ? <form onSubmit={event => createLesson(event, module.id)} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 md:grid-cols-2">
                <label className="text-sm font-semibold">Lesson title *<input name="title" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label><label className="text-sm font-semibold">Duration<input name="duration" defaultValue="10 min" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label><label className="text-sm font-semibold">Type<select name="type" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="text">Text</option><option value="video">Video</option><option value="document">Document</option><option value="link">Link</option><option value="lab">Lab</option><option value="quiz">Quiz</option><option value="assignment">Assignment</option></select></label><label className="text-sm font-semibold">Status<select name="status" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="draft">Draft</option><option value="published">Published</option></select></label><label className="text-sm font-semibold md:col-span-2">Resource URL<input name="resourceUrl" type="url" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label><label className="text-sm font-semibold md:col-span-2">Content<textarea name="content" rows="3" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label><div className="flex gap-2"><button disabled={working === `lesson-new-${module.id}`} className="min-h-11 rounded-lg bg-violet-700 px-4 text-sm font-bold text-white">Add lesson</button><button type="button" onClick={() => setLessonModule('')} className="min-h-11 px-4 text-sm font-bold text-slate-600">Cancel</button></div>
              </form> : <button type="button" onClick={() => setLessonModule(module.id)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold"><SiteIcon name="add" size={16} />Add lesson</button>}
            </section>)}
          </div>

          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-space-grotesk text-lg font-bold">Course resources</h2>
            <div className="mt-4 space-y-2">{course.materials.length ? course.materials.map(material => <div key={material.id} className="flex flex-wrap justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3"><div><p className="font-semibold">{material.title}</p><p className="text-xs text-slate-500">{material.type} · {material.isPublic ? 'Public' : 'Enrolled learners only'}</p></div>{material.resourceUrl && <a href={material.resourceUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-violet-700">Open resource</a>}</div>) : <p className="text-sm text-slate-500">No resources have been added.</p>}</div>
            <form onSubmit={createResource} className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-2 xl:grid-cols-3">
              <label className="text-sm font-semibold">Title *<input name="title" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label><label className="text-sm font-semibold">Type<select name="type" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="download">Download</option><option value="pdf">PDF</option><option value="video">Video</option><option value="link">Link</option><option value="text">Text</option></select></label><label className="text-sm font-semibold">Lesson<select name="lessonId" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"><option value="">Course level</option>{course.modules.flatMap(module => module.lessons).map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</select></label><label className="text-sm font-semibold md:col-span-2">Resource URL<input name="resourceUrl" type="url" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label><label className="text-sm font-semibold">Description<input name="description" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label><label className="text-sm font-semibold md:col-span-2 xl:col-span-3">Text content<textarea name="content" rows="2" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label><label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input name="isPublic" type="checkbox" className="h-4 w-4" />Visible before enrolment</label><button disabled={working === 'resource-new'} className="min-h-11 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white">Add resource</button>
            </form>
          </section>
        </>}
      </div>
    </StaffDashboardShell>
  )
}
