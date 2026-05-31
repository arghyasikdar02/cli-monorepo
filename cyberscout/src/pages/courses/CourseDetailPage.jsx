import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import ProgressBar from '../../components/ui/ProgressBar'
import { getCourseById } from '../../data/courses'

export default function CourseDetailPage() {
  const { id } = useParams()
  const course = getCourseById(id)
  const [tab, setTab] = useState('curriculum')
  const [openModule, setOpenModule] = useState(course?.modules?.[0]?.id ?? null)
  const navigate = useNavigate()

  if (!course) return (
    <AppShell>
      <div className="flex items-center justify-center h-96 text-on-surface-variant">Course not found</div>
    </AppShell>
  )

  const hasLessons = course.modules.some(m => m.lessons.length > 0)

  const handleEnroll = () => {
    if (course.enrolled && course.currentLessonId) {
      navigate(`/lessons/${course.id}/${course.currentLessonId}`)
      return
    }
    const firstLesson = course.modules[0]?.lessons[0]
    if (firstLesson) {
      navigate(`/lessons/${course.id}/${firstLesson.id}`)
      return
    }
    alert('No lessons available yet for this course.')
  }

  return (
    <AppShell>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-container to-slate-800 text-white">
        <div className="max-w-[1280px] mx-auto px-8 py-12">
          <Link to="/courses" className="flex items-center gap-1 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Courses
          </Link>
          <div className="flex gap-3 mb-4">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold font-space-grotesk uppercase tracking-wide">
              {course.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-space-grotesk uppercase tracking-wide ${
              course.level === 'Beginner' ? 'bg-green-500/20 text-green-300' :
              course.level === 'Advanced' ? 'bg-red-500/20 text-red-300' :
              'bg-amber-500/20 text-amber-300'
            }`}>
              {course.level}
            </span>
          </div>
          <h1 className="font-space-grotesk text-4xl font-black mb-4 leading-tight max-w-2xl">{course.title}</h1>
          <p className="text-white/70 text-base mb-6 max-w-xl">{course.description}</p>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              {course.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">view_module</span>
              {course.moduleCount} modules
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {course.rating} ({course.students.toLocaleString()} students)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-8 py-8 flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-200 mb-6">
            {['overview', 'curriculum', 'reviews'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 font-space-grotesk text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-slate-500 hover:text-on-surface'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
                <h3 className="font-space-grotesk font-bold text-primary mb-3">About this course</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{course.description}</p>
                <p className="text-on-surface-variant text-sm leading-relaxed mt-3">
                  This course covers practical, hands-on techniques used by professional security engineers.
                  Each module includes interactive labs, real-world scenarios, and knowledge checks.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
                <h3 className="font-space-grotesk font-bold text-primary mb-4">Instructor</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                    {course.instructor.name[0]}
                  </div>
                  <div>
                    <p className="font-space-grotesk font-bold text-on-surface">{course.instructor.name}</p>
                    <p className="text-sm text-on-surface-variant">{course.instructor.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                      <span className="text-xs text-slate-500 ml-1">{course.rating} instructor rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'curriculum' && (
            <div className="space-y-3">
              {course.modules.map(mod => (
                <div key={mod.id} className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
                  <button
                    onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {mod.completed ? (
                        <span className="material-symbols-outlined text-green-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-slate-300 text-[20px]">radio_button_unchecked</span>
                      )}
                      <div className="text-left">
                        <p className="font-space-grotesk font-semibold text-sm text-on-surface">
                          Module {mod.order}: {mod.title}
                        </p>
                        <p className="text-xs text-on-surface-variant">{mod.lessons.length} lessons</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">
                      {openModule === mod.id ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {openModule === mod.id && (
                    <div className="border-t border-slate-100">
                      {mod.lessons.map((lesson, i) => (
                        <Link
                          key={lesson.id}
                          to={`/lessons/${course.id}/${lesson.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          {lesson.completed ? (
                            <span className="material-symbols-outlined text-green-500 text-[18px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-slate-400">{i + 1}</span>
                            </span>
                          )}
                          <span className={`flex-1 text-sm ${lesson.completed ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                            {lesson.title}
                          </span>
                          <span className="text-xs text-slate-400 flex-shrink-0">{lesson.duration}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">rate_review</span>
              <p className="font-space-grotesk font-semibold">Reviews coming soon</p>
            </div>
          )}
        </div>

        {/* Sticky sidebar */}
        <div className="w-72 flex-shrink-0">
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

            <button
              onClick={handleEnroll}
              disabled={!hasLessons}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-space-grotesk font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {course.enrolled ? 'Continue Learning' : 'Enroll Now — Free'}
            </button>

            <div className="space-y-2 pt-2 text-sm text-on-surface-variant">
              {[
                [`${course.moduleCount} modules`, 'view_module'],
                [course.duration, 'schedule'],
                ['Completion certificate', 'workspace_premium'],
                ['Hands-on labs', 'science'],
              ].map(([text, icon]) => (
                <div key={text} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {course.quizId && (
              <Link
                to={`/quiz/${course.quizId}`}
                className="w-full block text-center border border-secondary text-secondary py-2.5 rounded-xl font-space-grotesk font-bold text-sm hover:bg-secondary/5 transition-colors"
              >
                Take Knowledge Quiz
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
