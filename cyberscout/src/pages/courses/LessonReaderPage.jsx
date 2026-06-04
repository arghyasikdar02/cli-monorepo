import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { api } from '../../lib/api'

function flattenLessons(course) {
  return (course?.modules || []).flatMap(module =>
    (module.lessons || []).map(lesson => ({ ...lesson, moduleTitle: module.title }))
  )
}

export default function LessonReaderPage() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    api.course(courseId)
      .then(({ course }) => {
        if (!active) return
        setCourse(course)
        setError('')
      })
      .catch(err => {
        if (active) setError(err.message || 'Unable to load lesson')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [courseId])

  const lessons = useMemo(() => flattenLessons(course), [course])
  const lesson = lessons.find(item => item.id === lessonId)
  const lessonIndex = lessons.findIndex(item => item.id === lessonId)
  const prevLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex >= 0 && lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null

  if (loading) return (
    <AppShell focusMode>
      <div className="flex items-center justify-center h-96 text-on-surface-variant">Loading lesson...</div>
    </AppShell>
  )

  if (error || !course || !lesson) return (
    <AppShell focusMode>
      <div className="max-w-[720px] mx-auto px-8 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 block mb-3">error</span>
        <h1 className="font-space-grotesk text-2xl font-black text-primary">Lesson unavailable</h1>
        <p className="mt-2 text-on-surface-variant">{error || 'Lesson not found'}</p>
        <Link to={`/learn/courses/${courseId}`} className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-space-grotesk text-sm font-bold text-white">Back to course</Link>
      </div>
    </AppShell>
  )

  if (!course.enrolled) return (
    <AppShell focusMode>
      <div className="max-w-[720px] mx-auto px-8 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 block mb-3">lock</span>
        <h1 className="font-space-grotesk text-2xl font-black text-primary">Enrollment required</h1>
        <p className="mt-2 text-on-surface-variant">This lesson belongs to {course.title}. Enroll before opening private course content.</p>
        <Link to={`/learn/courses/${courseId}`} className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-space-grotesk text-sm font-bold text-white">Open course</Link>
      </div>
    </AppShell>
  )

  return (
    <AppShell focusMode>
      <div className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/learn/courses/${courseId}`)} className="text-slate-500 hover:text-primary transition-colors" aria-label="Close lesson">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <p className="font-space-grotesk text-sm font-semibold text-on-surface">{lesson.title}</p>
            <p className="text-[10px] text-on-surface-variant">{course.title} · {lesson.moduleTitle}</p>
          </div>
        </div>
        <span className="font-space-grotesk text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
          {lesson.duration} read
        </span>
      </div>

      <div className="max-w-[860px] mx-auto px-8 py-10 flex gap-10">
        <article className="flex-1 min-w-0">
          <h1 className="font-space-grotesk text-3xl font-black text-primary mb-8">{lesson.title}</h1>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <p className="text-on-surface-variant leading-7 text-[15px] whitespace-pre-line">{lesson.content}</p>
          </div>

          <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-200">
            {prevLesson ? (
              <Link to={`/lessons/${courseId}/${prevLesson.id}`}
                className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                {prevLesson.title}
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link to={`/lessons/${courseId}/${nextLesson.id}`}
                className="flex items-center gap-2 text-sm font-semibold text-secondary hover:underline">
                {nextLesson.title}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            ) : (
              <Link to={`/learn/courses/${courseId}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold font-space-grotesk rounded-xl hover:opacity-90 transition-opacity">
                Back to Course
                <span className="material-symbols-outlined text-[18px]">school</span>
              </Link>
            )}
          </div>
        </article>

        <aside className="w-52 flex-shrink-0 hidden lg:block">
          <div className="sticky top-20">
            <p className="font-space-grotesk text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">This Course</p>
            {lessons.map(item => (
              <Link key={item.id} to={`/lessons/${courseId}/${item.id}`}
                className={`flex items-center gap-2 py-1.5 text-xs transition-colors ${item.id === lessonId ? 'text-secondary font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}>
                {item.completed
                  ? <span className="material-symbols-outlined text-green-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  : <span className="w-3 h-3 rounded-full border border-slate-300 flex-shrink-0" />}
                <span className="line-clamp-1">{item.title}</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  )
}
