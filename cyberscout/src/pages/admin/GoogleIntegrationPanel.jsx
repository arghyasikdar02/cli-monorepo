import { useCallback, useEffect, useState } from 'react'
import SiteIcon from '../../components/ui/SiteIcon'
import { api, API_BASE } from '../../lib/api'

export default function GoogleIntegrationPanel({ compact = false, redirect = '/admin/google', onStatus }) {
  const [google, setGoogle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.googleStatus()
      setGoogle(result.google)
      onStatus?.(result.google)
    } catch (err) {
      setError(err.message || 'Google connection status could not be loaded')
    } finally {
      setLoading(false)
    }
  }, [onStatus])

  useEffect(() => { load() }, [load])

  const connect = () => {
    window.location.assign(`${API_BASE}/api/integrations/google/connect?redirect=${encodeURIComponent(redirect)}`)
  }

  const disconnect = async () => {
    setDisconnecting(true)
    setError('')
    try {
      const result = await api.disconnectGoogle()
      setGoogle(result.google)
      onStatus?.(result.google)
      setConfirmDisconnect(false)
    } catch (err) {
      setError(err.message || 'Google account could not be disconnected')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <section className="border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="google-integration-heading">
      <div className={`flex gap-5 ${compact ? 'flex-col' : 'flex-col lg:flex-row lg:items-start lg:justify-between'}`}>
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Google integration</p>
          <h2 id="google-integration-heading" className="mt-1 font-space-grotesk text-lg font-bold">Google Meet authorization</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Connect an authorized Google account so Cyber Lab IN can create Meet spaces for scheduled classes. Access and refresh tokens remain encrypted on the backend and are never sent to this page.</p>
          {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error} <button type="button" onClick={load} className="underline">Retry</button></p>}
        </div>
        <div className="min-w-72 rounded-lg bg-slate-50 p-4">
          {loading ? <p className="text-sm text-slate-500" role="status">Checking connection...</p> : <>
            <div className="flex items-center gap-2"><SiteIcon name={google?.connected ? 'check_circle' : 'cloud'} className={google?.connected ? 'text-emerald-600' : 'text-slate-500'} /><p className="font-bold text-slate-950">{google?.connected ? 'Connected' : 'Not connected'}</p></div>
            <p className="mt-2 break-all text-sm text-slate-600">{google?.googleEmail || 'No Google account connected'}</p>
            <p className={`mt-1 text-sm font-semibold ${google?.meetScopeGranted ? 'text-emerald-700' : 'text-amber-700'}`}>{google?.meetScopeGranted ? 'Meet creation permission granted' : 'Meet creation permission not granted'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={connect} className="min-h-11 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">{google?.connected ? 'Reconnect Google' : 'Connect Google'}</button>
              {google?.connected && (confirmDisconnect ? <><button type="button" disabled={disconnecting} onClick={disconnect} className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-bold text-white disabled:opacity-60">{disconnecting ? 'Disconnecting...' : 'Confirm disconnect'}</button><button type="button" onClick={() => setConfirmDisconnect(false)} className="min-h-11 px-3 text-sm font-bold text-slate-600">Cancel</button></> : <button type="button" onClick={() => setConfirmDisconnect(true)} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700">Disconnect</button>)}
            </div>
          </>}
        </div>
      </div>
    </section>
  )
}
