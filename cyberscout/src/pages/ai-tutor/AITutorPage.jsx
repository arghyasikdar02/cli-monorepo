import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import CodeBlock from '../../components/ui/CodeBlock'

const INITIAL_MESSAGES = [
  {
    role: 'ai',
    content: 'Welcome to your AI Tutor session. I am focused on the two Cyber Lab IN foundation courses: Introduction to Cyber Security, and Cyber Security Essentials.',
    code: null,
  },
  {
    role: 'user',
    content: 'How do I inspect a suspicious email without clicking anything?',
    code: null,
  },
  {
    role: 'ai',
    content: 'Start with evidence you can inspect safely: sender address, sender domain, link destination previews, tone, urgency, attachment type, and whether the request matches the real organization workflow.',
    code: null,
    footnote: 'Never open attachments or enter credentials from a message until you verify it through an official channel.',
  },
]

const CHIPS = [
  'How do I spot phishing?',
  'Explain SQL Injection simply',
  'What are secure cookies?',
  'How do I audit my digital footprint?',
]

const MASTERY = [
  { label: 'Scam Awareness', pct: 32 },
  { label: 'Account Safety', pct: 18 },
  { label: 'Web Security Basics', pct: 8 },
]

const MOCK_RESPONSES = [
  'Great question. Start by identifying the claim, the requested action, and the verification path. If a message asks for urgency, money, OTPs, passwords, or account recovery, treat it as high risk until verified.',
  'In web security, unsafe input means the application receives data it should not blindly trust. Defensive controls include validation, output encoding, parameterized queries, and safe error handling.',
  'That topic maps directly to the Basic Course curriculum. Let me break it down into observation, risk, safe action, and a short checklist.',
]

let mockIdx = 0

export default function AITutorPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (text) => {
    const msg = text.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: msg, code: null }])
    setLoading(true)
    setTimeout(() => {
      const response = MOCK_RESPONSES[mockIdx % MOCK_RESPONSES.length]
      mockIdx++
      setMessages(m => [...m, { role: 'ai', content: response, code: null }])
      setLoading(false)
    }, 800)
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">

        {/* Chat panel â€” 65% */}
        <section className="flex flex-col border-r border-slate-200 bg-white" style={{ width: '65%' }}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="font-space-grotesk font-bold text-primary-container">AI Tutor: Cyber Lab IN Foundations</h2>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
                Active Session: Basic Course I & II
              </p>
            </div>
            <div className="flex gap-2">
              {['restart_alt', 'share'].map(icon => (
                <button key={icon} className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-primary-container' : 'bg-violet-500'}`}>
                  <span className="material-symbols-outlined text-white text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    {msg.role === 'ai' ? 'smart_toy' : 'person'}
                  </span>
                </div>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-none'
                    : 'bg-surface-container-low border border-slate-100 shadow-sm rounded-tl-none text-on-surface'
                }`}>
                  <p>{msg.content}</p>
                  {msg.code && <CodeBlock lang={msg.code.lang} code={msg.code.snippet} />}
                  {msg.footnote && <p className="text-xs text-on-surface-variant mt-2 italic">{msg.footnote}</p>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <div className="bg-surface-container-low border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
              {CHIPS.map(chip => (
                <button key={chip} onClick={() => send(chip)}
                  className="px-3 py-1.5 rounded-full border border-violet-100 bg-violet-50 text-violet-700 text-xs font-medium hover:bg-violet-100 transition-colors whitespace-nowrap flex-shrink-0">
                  {chip}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 pr-24 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-secondary transition-all"
                placeholder="Ask your AI tutor anything about cybersecurity..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                disabled={loading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">attach_file</span>
                </button>
                <button onClick={() => send(input)} disabled={!input.trim() || loading}
                  className="p-2 bg-primary-container text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition-all">
                  <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Context panel â€” 35% */}
        <section className="bg-slate-50/50 overflow-y-auto px-6 py-6 space-y-7 flex-shrink-0" style={{ width: '35%' }}>

          {/* Topic mastery */}
          <div>
            <h3 className="font-space-grotesk text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-[16px]">analytics</span>
              Topic Mastery
            </h3>
            <div className="bg-white p-5 rounded-xl shadow-card border border-slate-100 space-y-4">
              {MASTERY.map(({ label, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-600">{label}</span>
                    <span className="text-violet-600">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source citations */}
          <div>
            <h3 className="font-space-grotesk text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-[16px]">menu_book</span>
              Source Citations
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Basic Course I', sub: 'Introduction to Cyber Security' },
                { title: 'Basic Course II', sub: 'Cyber Security Essentials' },
              ].map(({ title, sub }) => (
                <div key={title} className="bg-white p-4 rounded-xl shadow-card border border-slate-100 flex gap-3 hover:border-violet-200 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-secondary transition-colors flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related context â€” next lab */}
          <div>
            <h3 className="font-space-grotesk text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-[16px]">hub</span>
              Related Context
            </h3>
            <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
              <div className="h-28 bg-gradient-to-br from-primary-container to-secondary relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="bg-violet-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">Next Lab</span>
                  <h4 className="text-white text-sm font-bold mt-1">Email Safety Investigation</h4>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Continue with guided scam detection and safe verification practice.
                </p>
                <Link to="/courses/c002"
                  className="block w-full text-center py-2 bg-primary-container text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
                  LAUNCH LAB
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
