import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import CodeBlock from '../../components/ui/CodeBlock'
import { getCourseById, getLessonById, getAdjacentLesson } from '../../data/courses'

// Mock lesson content keyed by lessonId
const LESSON_CONTENT = {
  l001_04_02: {
    sections: [
      {
        heading: 'What is an ACL?',
        body: 'An Access Control List (ACL) is an ordered set of rules that a router or firewall evaluates against each packet. Each rule specifies a match condition and an action — either permit or deny.',
      },
      {
        heading: 'Standard vs Extended ACLs',
        body: 'Standard ACLs (1–99) filter only on source IP. Extended ACLs (100–199) can filter on source, destination, protocol, and port — giving much finer-grained control.',
        tip: 'Always place extended ACLs close to the source and standard ACLs close to the destination to minimize unnecessary traffic traversal.',
      },
      {
        heading: 'Basic Configuration',
        body: 'On a Cisco IOS device, create and apply an extended ACL to deny inbound Telnet (port 23) while permitting all other traffic:',
        code: { lang: 'IOS', snippet: 'ip access-list extended BLOCK_TELNET\n deny tcp any any eq 23\n permit ip any any\n!\ninterface GigabitEthernet0/0\n ip access-group BLOCK_TELNET in' },
      },
      {
        heading: 'Verification',
        body: 'After applying the ACL, verify it is working correctly with these commands:',
        code: { lang: 'IOS', snippet: 'show ip access-lists BLOCK_TELNET\nshow run | include access-group' },
      },
    ],
  },
}

const DEFAULT_CONTENT = {
  sections: [
    { heading: 'Introduction', body: 'This lesson covers foundational concepts that form the basis of modern network security practices.' },
    { heading: 'Core Concepts', body: 'Understanding the underlying principles is essential before moving to hands-on implementation. Take time to review the material thoroughly.', tip: 'Try to relate each concept to real-world scenarios you may have encountered.' },
    { heading: 'Practical Application', body: 'The techniques covered in this lesson are used daily by security professionals. Practice in the lab environment to reinforce your understanding.' },
  ],
}

export default function LessonReaderPage() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [completed, setCompleted] = useState(false)

  const course = getCourseById(courseId)
  const lesson = getLessonById(lessonId)
  const nextLesson = getAdjacentLesson(courseId, lessonId, 'next')
  const prevLesson = getAdjacentLesson(courseId, lessonId, 'prev')
  const content = LESSON_CONTENT[lessonId] ?? DEFAULT_CONTENT

  if (!course || !lesson) return (
    <AppShell focusMode>
      <div className="flex items-center justify-center h-96 text-on-surface-variant">Lesson not found</div>
    </AppShell>
  )

  return (
    <AppShell focusMode>
      {/* Top bar */}
      <div className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/courses/${courseId}`)} className="text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <p className="font-space-grotesk text-sm font-semibold text-on-surface">{lesson.title}</p>
            <p className="text-[10px] text-on-surface-variant">{course.title} · {lesson.moduleTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-space-grotesk text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
            {lesson.duration} read
          </span>
          {course.quizId && (
            <Link to={`/quiz/${course.quizId}`}
              className="px-3 py-1.5 bg-secondary text-white text-xs font-bold font-space-grotesk rounded-lg hover:opacity-90 transition-opacity">
              Take Quiz
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-8 py-10 flex gap-10">
        {/* Main reading area */}
        <article className="flex-1 min-w-0">
          <h1 className="font-space-grotesk text-3xl font-black text-primary mb-8">{lesson.title}</h1>

          {content.sections.map((sec, i) => (
            <div key={i} className="mb-8">
              {sec.heading && (
                <h2 className="font-space-grotesk text-lg font-bold text-on-surface mb-3">{sec.heading}</h2>
              )}
              <p className="text-on-surface-variant leading-relaxed text-[15px]">{sec.body}</p>
              {sec.tip && (
                <div className="mt-4 border-l-4 border-secondary bg-secondary/5 px-5 py-4 rounded-r-xl">
                  <p className="font-space-grotesk text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Pro Tip</p>
                  <p className="text-sm text-on-surface-variant">{sec.tip}</p>
                </div>
              )}
              {sec.code && <CodeBlock lang={sec.code.lang} code={sec.code.snippet} />}
            </div>
          ))}

          {/* Navigation */}
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
              <Link to={`/quiz/${course.quizId}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold font-space-grotesk rounded-xl hover:opacity-90 transition-opacity">
                Complete & Take Quiz
                <span className="material-symbols-outlined text-[18px]">quiz</span>
              </Link>
            )}
          </div>
        </article>

        {/* TOC sidebar */}
        <aside className="w-52 flex-shrink-0 hidden lg:block">
          <div className="sticky top-20">
            <p className="font-space-grotesk text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">In This Lesson</p>
            <nav className="space-y-1">
              {content.sections.map((sec, i) => sec.heading && (
                <p key={i} className="text-xs text-on-surface-variant hover:text-secondary cursor-pointer transition-colors py-1 leading-snug">
                  {sec.heading}
                </p>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="font-space-grotesk text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">This Module</p>
              {course.modules.find(m => m.lessons.some(l => l.id === lessonId))?.lessons.map(l => (
                <Link key={l.id} to={`/lessons/${courseId}/${l.id}`}
                  className={`flex items-center gap-2 py-1.5 text-xs transition-colors ${l.id === lessonId ? 'text-secondary font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  {l.completed
                    ? <span className="material-symbols-outlined text-green-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    : <span className="w-3 h-3 rounded-full border border-slate-300 flex-shrink-0" />}
                  <span className="line-clamp-1">{l.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  )
}
