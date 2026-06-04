import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { api } from '../../lib/api'

const SUGGESTIONS = [
  'Summarize this course',
  'What should I practice first?',
  'Explain the safest defensive workflow',
  'Which resources should I review?',
]

export default function AITutorPage() {
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [usage, setUsage] = useState(null)
  const [limit, setLimit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  useEffect(() => {
    let active = true
    setLoading(true)
    api.myCourses()
      .then(({ courses }) => {
        if (!active) return
        setCourses(courses)
        setCourseId(courses[0]?.id || '')
        setError('')
      })
      .catch(err => {
        if (active) setError(err.message || 'Unable to load enrolled courses')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!courseId) return
    let active = true
    setMessages([])
    setSessionId(null)
    api.get(`/api/ai/courses/${courseId}/sessions`)
      .then(({ usage, limit }) => {
        if (!active) return
        setUsage(usage)
        setLimit(limit)
      })
      .catch(err => {
        if (active) setError(err.message || 'Unable to load AI usage')
      })
    return () => {
      active = false
    }
  }, [courseId])

  const send = async (text) => {
    const content = text.trim()
    if (!content || sending || !courseId) return
    setInput('')
    setError('')
    setMessages(current => [...current, { role: 'user', content }])
    setSending(true)
    try {
      const result = await api.post(`/api/ai/courses/${courseId}/chat`, { message: content, sessionId })
      setSessionId(result.sessionId)
      setUsage(result.usage)
      setLimit(result.limit)
      const assistant = result.messages.find(message => message.role === 'assistant')
      setMessages(current => [...current, { role: 'assistant', content: assistant?.content || 'No answer returned.', citations: result.citations || [], refused: result.refused }])
    } catch (err) {
      setError(err.message || 'AI request failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <section className="flex flex-col border-r border-slate-200 bg-white w-full lg:w-[68%]">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
            <div>
              <h2 className="font-space-grotesk font-bold text-primary-container">Course AI Tutor</h2>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
                Answers are limited to enrolled course materials
              </p>
            </div>
            {courses.length > 0 && (
              <select
                value={courseId}
                onChange={event => setCourseId(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-secondary"
              >
                {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            )}
          </div>

          {loading ? (
            <div className="flex-1 p-8 text-slate-500">Loading enrolled courses...</div>
          ) : !courses.length ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <span className="material-symbols-outlined text-6xl text-slate-300 block mb-3">school</span>
                <h1 className="font-space-grotesk text-2xl font-black text-primary">Enroll to use course AI</h1>
                <p className="mt-2 text-sm text-on-surface-variant">The tutor only answers from courses you are enrolled in.</p>
                <Link to="/learn/courses" className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-space-grotesk text-sm font-bold text-white">
                  Browse courses
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {!messages.length && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                    Ask a question about the selected course. If the answer is not grounded in that course’s materials, the tutor will say so.
                  </div>
                )}
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex gap-3 max-w-[88%] ${message.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${message.role === 'assistant' ? 'bg-primary-container' : 'bg-violet-500'}`}>
                      <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {message.role === 'assistant' ? 'smart_toy' : 'person'}
                      </span>
                    </div>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                      message.role === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-none'
                        : 'bg-surface-container-low border border-slate-100 shadow-sm rounded-tl-none text-on-surface'
                    }`}>
                      <p>{message.content}</p>
                      {message.citations?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.citations.map(citation => (
                            <span key={citation.id} className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              {citation.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                    </div>
                    <div className="bg-surface-container-low border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-500">Reading course materials...</div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
                {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                  {SUGGESTIONS.map(suggestion => (
                    <button key={suggestion} onClick={() => send(suggestion)}
                      className="px-3 py-1.5 rounded-full border border-violet-100 bg-violet-50 text-violet-700 text-xs font-medium hover:bg-violet-100 transition-colors whitespace-nowrap flex-shrink-0">
                      {suggestion}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 pr-16 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-secondary transition-all"
                    placeholder="Ask about the selected course..."
                    value={input}
                    onChange={event => setInput(event.target.value)}
                    onKeyDown={event => event.key === 'Enter' && send(input)}
                    disabled={sending}
                  />
                  <button onClick={() => send(input)} disabled={!input.trim() || sending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-container text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition-all">
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="hidden lg:block bg-slate-50/50 overflow-y-auto px-6 py-6 space-y-7 flex-shrink-0 w-[32%]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h3 className="font-space-grotesk text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-[16px]">shield_lock</span>
              Course Boundary
            </h3>
            <p className="text-sm leading-6 text-slate-600">
              The tutor checks enrollment, reads only the selected course materials, saves chat history to the database, and records usage against the daily limit.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h3 className="font-space-grotesk text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-[16px]">analytics</span>
              Usage
            </h3>
            <p className="text-3xl font-black text-primary">{usage ?? 0}<span className="text-base text-slate-400">/{limit ?? '-'}</span></p>
            <p className="mt-1 text-sm text-slate-500">Course AI requests used today</p>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
