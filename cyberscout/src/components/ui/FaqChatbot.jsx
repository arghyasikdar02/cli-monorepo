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
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'How can I help you or guide you today?' }])
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
        className="faq-chatbot-toggle"
        aria-label="Open course FAQ assistant"
        aria-expanded={open}
        aria-controls="faq-chatbot-panel"
      >
        <span className="material-symbols-outlined">{open ? 'close' : 'forum'}</span>
      </button>
      {open && (
        <section className="faq-chatbot-panel" id="faq-chatbot-panel" aria-label="Cyber Lab IN FAQ assistant">
          <header>
            <p>Cyber Lab IN FAQ assistant</p>
          </header>
          <div className="faq-chatbot-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`faq-chatbot-message is-${message.role}`}>
                <p>{message.text}</p>
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
          <div className="faq-chatbot-controls">
            <div className="faq-chatbot-options">
              {visibleOptions.map(([, label, answer]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => ask(label, answer)}
                >
                  {label}
                </button>
              ))}
            </div>
            <form onSubmit={submitText} className="faq-chatbot-input">
              <label className="sr-only" htmlFor="faq-chatbot-question">Type a course question</label>
              <input
                id="faq-chatbot-question"
                value={text}
                onChange={event => setText(event.target.value)}
                placeholder="Type a course question"
              />
              <button type="submit" aria-label="Send question"><span className="material-symbols-outlined" aria-hidden="true">send</span></button>
            </form>
          </div>
        </section>
      )}
    </>
  )
}
