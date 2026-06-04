import { useMemo, useState } from 'react'
import LeadCaptureForm from './LeadCaptureForm'

const options = [
  ['fees', 'Course fees', 'Cyber Security Essentials is currently listed from the course database. The fee can change by cohort, and the course page always shows the current configured amount.'],
  ['duration', 'Course duration', 'The course is designed as a focused 7-day online program with guided labs and beginner-friendly explanations.'],
  ['beginner', 'Beginner suitability', 'Yes. It is built for students, IT beginners, career switchers, non-technical learners, and junior IT staff with basic computer and internet knowledge.'],
  ['certificate', 'Certificate', 'Learners receive a Certificate of Completion after finishing the course requirements.'],
  ['labs', 'Hands-on labs', 'The course includes guided labs for phishing indicators, account hardening, web request-response practice, unsafe input, SQL Injection awareness, XSS awareness, and defensive reporting.'],
  ['career', 'Placement and career guidance', 'Cyber Lab IN avoids unsupported placement claims. The course builds foundation skills for SOC, ethical hacking, network security, digital forensics, cloud security, and AI-powered security paths.'],
  ['enroll', 'How to enroll', 'Use Start Learning or Enroll Now on the course page. If you want help choosing a starting point, request a callback here.'],
]

function matchAnswer(text) {
  const query = text.toLowerCase()
  const entry = options.find(([key, label]) => query.includes(key) || label.toLowerCase().split(' ').some(word => word.length > 4 && query.includes(word)))
  return entry?.[2] || 'I can help with fees, duration, beginner suitability, certificate, hands-on labs, career guidance, enrollment, or a counsellor callback.'
}

export default function FaqChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Choose a question and I will guide you with clear course information.' }])
  const [showLead, setShowLead] = useState(false)
  const [text, setText] = useState('')

  const visibleOptions = useMemo(() => [...options, ['callback', 'Talk to counsellor', 'Share your details and the Cyber Lab IN team will follow up.']], [])

  const ask = (label, answer) => {
    setMessages(value => [...value, { role: 'user', text: label }, { role: 'assistant', text: answer }])
    if (/counsellor|callback/i.test(label)) setShowLead(true)
  }

  const submitText = (event) => {
    event.preventDefault()
    const clean = text.trim()
    if (!clean) return
    setMessages(value => [...value, { role: 'user', text: clean }, { role: 'assistant', text: matchAnswer(clean) }])
    if (/call|callback|counsellor|talk/i.test(clean)) setShowLead(true)
    setText('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="fixed bottom-4 right-4 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_60px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-white dark:text-slate-950"
        aria-label="Open course FAQ assistant"
      >
        <span className="material-symbols-outlined">{open ? 'close' : 'forum'}</span>
      </button>
      {open && (
        <section className="fixed bottom-24 right-3 z-[70] w-[calc(100vw-1.5rem)] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-[0_24px_90px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-slate-900 dark:text-white sm:right-4">
          <header className="border-b border-slate-200 p-4 dark:border-white/10">
            <p className="font-space-grotesk text-sm font-bold">Cyber Lab IN FAQ Assistant</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Option-based guidance, not an AI model.</p>
          </header>
          <div className="max-h-[58vh] space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200'
                }`}>
                  {message.text}
                </p>
              </div>
            ))}
            {showLead && (
              <LeadCaptureForm
                source="chatbot"
                compact
                title="Request a callback"
                defaultMessage="I would like to talk to a counsellor about Cyber Security Essentials."
                onSuccess={() => setShowLead(false)}
              />
            )}
          </div>
          <div className="border-t border-slate-200 p-4 dark:border-white/10">
            <div className="mb-3 flex flex-wrap gap-2">
              {visibleOptions.map(([, label, answer]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => ask(label, answer)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  {label}
                </button>
              ))}
            </div>
            <form onSubmit={submitText} className="flex gap-2">
              <input
                value={text}
                onChange={event => setText(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300 dark:border-white/10 dark:bg-white/5"
                placeholder="Type a course question"
              />
              <button type="submit" className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                Send
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  )
}
