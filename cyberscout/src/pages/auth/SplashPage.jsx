import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CLILogo from '../../components/CLILogo'

export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/welcome'), 2500)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(56,189,248,0.10),transparent_28%),radial-gradient(circle_at_75%_70%,rgba(124,58,237,0.10),transparent_30%)]" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="rounded-2xl bg-white/80 px-8 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 backdrop-blur-xl">
          <CLILogo variant="full" tone="light" size={260} />
        </div>
        <p className="font-space-grotesk text-[11px] font-bold tracking-[0.26em] text-slate-500 uppercase mt-2">
          MASTER THE CRAFT
        </p>
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="w-56 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-violet-600 rounded-full shadow-[0_0_12px_rgba(124,58,237,0.4)]"
              style={{ animation: 'loadFill 2.4s ease-in-out forwards' }}
            />
          </div>
          <p className="text-sm text-on-surface-variant">Initializing secure terminal session...</p>
        </div>
      </div>

      <footer className="absolute bottom-8 flex items-center gap-2 text-on-surface-variant/50">
        <span className="material-symbols-outlined text-[16px]"
          style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
        <span className="font-space-grotesk text-[10px] tracking-widest uppercase">SSL ENCRYPTED ENVIRONMENT</span>
      </footer>
      <style>{`
        @keyframes loadFill { from { width: 0 } to { width: 100% } }
      `}</style>
    </div>
  )
}
