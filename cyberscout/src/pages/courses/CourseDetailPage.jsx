import { useCallback, useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import ProgressBar from '../../components/ui/ProgressBar'
import { api } from '../../lib/api'
import SiteIcon from '../../components/ui/SiteIcon'

function MaterialIcon({ type }) {
  const icon = {
    pdf: 'picture_as_pdf',
    video: 'play_circle',
    link: 'link',
    text: 'article',
  }[type] || 'description'
  return <SiteIcon name={icon} size={20} className="text-secondary" />
}

export default function CourseDetailPage() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [tab, setTab] = useState('curriculum')
  const [openModule, setOpenModule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const loadCourse = useCallback(async () => {
    setLoading(true)
    try {
      const { course } = await api.course(id)
      setCourse(course)
      setOpenModule(current => current || course.modules?.[0]?.id || null)
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to load course')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadCourse()
  }, [loadCourse])

  const handleEnroll = async () => {
    if (!course) return
    if (course.enrolled) {
      const firstLessonId = course.currentLessonId || course.modules?.[0]?.lessons?.[0]?.id
      if (firstLessonId) navigate(`/lessons/${course.id}/${firstLessonId}`)
      return
    }
    setEnrolling(true)
    setError('')
    try {
      await api.enrollCourse(course.id)
      await loadCourse()
      setTab('materials')
    } catch (err) {
      setError(err.message || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-[1280px] mx-auto px-8 py-12">
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500 shadow-card">Loading course details...</div>
        </div>
      </AppShell>
    )
  }

  if (!course || error) return (
    <AppShell>
      <div className="max-w-[760px] mx-auto px-8 py-20 text-center">
        <SiteIcon name="error" size={54} className="mx-auto mb-3 text-slate-300" />
        <h1 className="font-space-grotesk text-2xl font-black text-primary">Course unavailable</h1>
        <p className="mt-2 text-on-surface-variant">{error || 'Course not found'}</p>
        <Link to="/learn/courses" className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-space-grotesk text-sm font-bold text-white">Back to courses</Link>
      </div>
    </AppShell>
  )

  const hasLessons = course.modules?.some(module => module.lessons?.length > 0)
  const privateMaterialsLocked = !course.enrolled && course.lockedMaterialCount > 0
  const visibleMaterials = course.materials || []

  return (
    <AppShell>
      <div className="bg-gradient-to-br from-primary-container to-slate-800 text-white">
        <div className="max-w-[1280px] mx-auto px-8 py-12">
          <Link to="/learn/courses" className="flex items-center gap-1 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <SiteIcon name="arrow_back" size={18} />
            Back to Courses
          </Link>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold font-space-grotesk uppercase tracking-wide">
              {course.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold font-space-grotesk uppercase tracking-wide bg-green-500/20 text-green-300">
              {course.level}
            </span>
            {course.enrolled && (
              <span className="px-3 py-1 rounded-full text-xs font-bold font-space-grotesk uppercase tracking-wide bg-cyan-400/20 text-cyan-100">
                Enrolled
              </span>
            )}
          </div>
          <h1 className="font-space-grotesk text-4xl font-black mb-4 leading-tight max-w-2xl">{course.title}</h1>
          <p className="text-white/70 text-base mb-6 max-w-xl">{course.description}</p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <SiteIcon name="schedule" size={18} />
              {course.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <SiteIcon name="view_module" size={18} />
              {course.moduleCount} modules
            </span>
            <span className="flex items-center gap-1.5">
              <SiteIcon name="description" size={18} />
              {course.materialCount} resources
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-8 py-8 flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 min-w-0">
          <div className="flex gap-1 border-b border-slate-200 mb-6">
            {['overview', 'curriculum', 'materials'].map(item => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`px-4 py-2.5 font-space-grotesk text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                  tab === item
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-slate-500 hover:text-on-surface'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
                <h3 className="font-space-grotesk font-bold text-primary mb-3">About this course</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{course.overview || course.description}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
                <h3 className="font-space-grotesk font-bold text-primary mb-4">Instructor</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                    {course.instructor?.name?.[0] || 'C'}
                  </div>
                  <div>
                    <p className="font-space-grotesk font-bold text-on-surface">{course.instructor?.name}</p>
                    <p className="text-sm text-on-surface-variant">{course.instructor?.title}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'curriculum' && (
            <div className="space-y-3">
              {course.modules?.length ? course.modules.map(module => (
                <div key={module.id} className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
                  <button
                    onClick={() => setOpenModule(openModule === module.id ? null : module.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <SiteIcon name="radio_button_unchecked" size={20} className="text-slate-300" />
                      <div className="text-left">
                        <p className="font-space-grotesk font-semibold text-sm text-on-surface">
                          Module {module.order}: {module.title}
                        </p>
                        <p className="text-xs text-on-surface-variant">{module.lessons.length} lessons</p>
                      </div>
                    </div>
                    <SiteIcon name={openModule === module.id ? 'expand_less' : 'expand_more'} size={20} className="text-slate-400" />
                  </button>

                  {openModule === module.id && (
                    <div className="border-t border-slate-100">
                      {module.lessons.map((lesson, index) => {
                        const content = (
                          <>
                            {lesson.completed ? (
                              <SiteIcon name="check_circle" size={18} className="flex-shrink-0 text-green-500" />
                            ) : (
                              <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0 flex items-center justify-center">
                                <span className="text-[9px] font-bold text-slate-400">{index + 1}</span>
                              </span>
                            )}
                            <span className={`flex-1 text-sm ${lesson.completed ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                              {lesson.title}
                            </span>
                            <span className="text-xs text-slate-400 flex-shrink-0">{lesson.duration}</span>
                          </>
                        )
                        return course.enrolled ? (
                          <Link
                            key={lesson.id}
                            to={`/lessons/${course.id}/${lesson.id}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                          >
                            {content}
                          </Link>
                        ) : (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 text-slate-400"
                          >
                            {content}
                            <SiteIcon name="lock" size={18} />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )) : (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No modules have been published for this course yet.</div>
              )}
            </div>
          )}

          {tab === 'materials' && (
            <div className="space-y-3">
              {privateMaterialsLocked && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                  Enroll in this course to unlock {course.lockedMaterialCount} private learning resources.
                </div>
              )}
              {visibleMaterials.length ? visibleMaterials.map(material => (
                <article key={material.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                  <div className="flex items-start gap-3">
                    <MaterialIcon type={material.type} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-space-grotesk font-bold text-primary">{material.title}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{material.type}</span>
                        {material.isPublic && <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-700">Public</span>}
                      </div>
                      <p className="mt-1 text-sm text-on-surface-variant">{material.description}</p>
                      {course.enrolled && material.content && (
                        <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">{material.content}</p>
                      )}
                      {course.enrolled && material.resourceUrl && (
                        <a href={material.resourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-bold text-secondary hover:underline">
                          Open resource
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              )) : (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No resources are available for this course yet.</div>
              )}
            </div>
          )}
        </div>

        <aside className="w-full flex-shrink-0 lg:w-72">
          <div className="sticky top-24 bg-white rounded-xl border border-slate-200 shadow-card p-6 space-y-4">
            {course.enrolled && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-space-grotesk">Progress</span>
                  <span className="text-sm font-bold text-violet-600">{course.progress}%</span>
                </div>
                <ProgressBar value={course.progress} glow />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <button
              onClick={handleEnroll}
              disabled={!hasLessons || enrolling}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-space-grotesk font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {enrolling ? 'Saving enrolment...' : course.enrolled ? 'Continue learning' : 'Enrol now: free'}
            </button>

            <div className="space-y-2 pt-2 text-sm text-on-surface-variant">
              {[
                [`${course.moduleCount} modules`, 'view_module'],
                [`${course.lessonCount} lessons`, 'school'],
                [`${course.materialCount} resources`, 'description'],
                [course.duration, 'schedule'],
              ].map(([text, icon]) => (
                <div key={text} className="flex items-center gap-2">
                  <SiteIcon name={icon} size={18} className="text-secondary" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  )
}
