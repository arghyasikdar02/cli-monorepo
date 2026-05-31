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
    <div className="h-screen w-screen bg-surface flex flex-col items-center justify-center overflow-hidden relative">
      <div className="flex flex-col items-center gap-6">
        <CLILogo variant="full" size={36} />
        <p className="font-space-grotesk text-[11px] font-bold tracking-[0.2em] text-secondary uppercase mt-2">
          MASTER THE CRAFT
        </p>
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full shadow-[0_0_8px_rgba(109,40,217,0.4)]"
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

      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-secondary/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-primary/5 to-transparent blur-3xl pointer-events-none" />

      <style>{`
        @keyframes loadFill { from { width: 0 } to { width: 100% } }
      `}</style>
    </div>
  )
}
