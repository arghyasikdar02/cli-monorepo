import { useState } from 'react'

export default function CodeBlock({ lang = 'TERMINAL', code }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl overflow-hidden mt-4 bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-[10px] font-bold font-space-grotesk text-slate-400 uppercase tracking-widest">
        <span>{lang}</span>
        <button onClick={copy} className="hover:text-white transition-colors">
          {copied ? 'COPIED!' : 'COPY CODE'}
        </button>
      </div>
      <pre className="p-4 text-sm font-space-grotesk text-violet-100 leading-relaxed overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}
