import { useRef, useState } from 'react'
import SiteIcon from '../../components/ui/SiteIcon'
import { useModalFocus } from '../../lib/useModalFocus'

const LOGIN_URL = 'https://cyberlabin.com/login'

export default function InstructorCredentialModal({ credentials, onClose }) {
  const closeRef = useRef(null)
  const dialogRef = useRef(null)
  const [copied, setCopied] = useState('')
  useModalFocus(dialogRef, onClose, closeRef)

  const copy = async (label, value) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 1600)
  }

  const all = `Cyber Lab IN instructor login\nName: ${credentials.name}\nUsername: ${credentials.username}\nEmail: ${credentials.email}\nTemporary password: ${credentials.temporaryPassword}\nLogin: ${LOGIN_URL}\n\nYou must change this password after signing in.`

  const download = () => {
    const url = URL.createObjectURL(new Blob([all], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `cyberlabin-${credentials.username}-credentials.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/70 p-4" role="presentation">
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="credential-title" className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-wider text-violet-700">One-time display</p><h2 id="credential-title" className="mt-1 font-space-grotesk text-2xl font-bold text-slate-950">Save instructor credentials</h2></div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close credentials" className="grid min-h-11 min-w-11 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><SiteIcon name="close" /></button>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">The temporary password cannot be retrieved after this window closes. Use Reset password to issue another one.</p>
        <dl className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50">
          <CredentialRow label="Name" value={credentials.name} />
          <CredentialRow label="Username" value={credentials.username} action={() => copy('username', credentials.username)} />
          <CredentialRow label="Email" value={credentials.email} />
          <CredentialRow label="Temporary password" value={credentials.temporaryPassword} action={() => copy('password', credentials.temporaryPassword)} secret />
          <CredentialRow label="Login URL" value={LOGIN_URL} />
        </dl>
        {copied && <p className="mt-3 text-sm font-semibold text-emerald-700" role="status">{copied === 'all' ? 'Credentials copied.' : `${copied[0].toUpperCase()}${copied.slice(1)} copied.`}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => copy('all', all)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white"><SiteIcon name="content_copy" />Copy all credentials</button>
          <button type="button" onClick={download} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-800"><SiteIcon name="download" />Download text file</button>
        </div>
        <button type="button" onClick={onClose} className="mt-3 min-h-11 w-full rounded-lg bg-violet-700 px-4 text-sm font-bold text-white">I have saved these credentials</button>
      </section>
    </div>
  )
}

function CredentialRow({ label, value, action, secret = false }) {
  return <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</dt><dd className={`mt-1 break-all text-sm font-semibold text-slate-950 ${secret ? 'font-mono' : ''}`}>{value}</dd></div>{action && <button type="button" onClick={action} className="inline-flex min-h-10 items-center gap-2 self-start rounded-md border border-slate-300 px-3 text-xs font-bold sm:self-auto"><SiteIcon name="content_copy" size={15} />Copy</button>}</div>
}
