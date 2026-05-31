import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLiveClassById } from '../../data/liveClasses'

const MOCK_CHAT = [
  { user: 'Marcus V.', msg: 'Great intro! What SIEM tool are we using today?' },
  { user: 'Sarah J.', msg: 'Elastic SIEM â€” it\'s referenced in the course materials' },
  { user: 'You', msg: 'Looking forward to the hands-on part!', isMe: true },
]

export default function LiveClassSessionPage() {
  const { id } = useParams()
  const cls = getLiveClassById(id)
  const [chatMsg, setChatMsg] = useState('')
  const [chat, setChat] = useState(MOCK_CHAT)
  const [muted, setMuted] = useState(false)
  const [handRaised, setHandRaised] = useState(false)

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed-dim">shield</span>
          <span className="font-space-grotesk font-bold text-white text-sm">{cls?.title ?? 'Live Session'}</span>
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-2">LIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">group</span>
            {cls?.attendees?.toLocaleString() ?? '0'} watching
          </span>
          <Link to="/live-classes"
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold font-space-grotesk rounded-lg hover:bg-red-700 transition-colors">
            Leave
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col">
          {/* Video placeholder */}
          <div className="flex-1 bg-slate-900 flex items-center justify-center relative">
            <div className="text-center">
              <span className="material-symbols-outlined text-[80px] text-slate-700 block mb-4">video_camera_front</span>
              <p className="font-space-grotesk font-bold text-slate-500">{cls?.instructor ?? 'Instructor'}</p>
              <p className="text-xs text-slate-600 mt-1">{cls?.title}</p>
            </div>
            {/* Live indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold">LIVE</span>
            </div>
          </div>

          {/* Controls */}
          <div className="h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
            <button onClick={() => setMuted(m => !m)}
              className={`p-3 rounded-full transition-colors ${muted ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <span className="material-symbols-outlined text-[20px]">{muted ? 'mic_off' : 'mic'}</span>
            </button>
            <button
              className="p-3 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
              <span className="material-symbols-outlined text-[20px]">videocam_off</span>
            </button>
            <button onClick={() => setHandRaised(h => !h)}
              className={`p-3 rounded-full transition-colors ${handRaised ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <span className="material-symbols-outlined text-[20px]">back_hand</span>
            </button>
            <button className="p-3 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
              <span className="material-symbols-outlined text-[20px]">screen_share</span>
            </button>
          </div>
        </div>

        {/* Chat */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-space-grotesk font-bold text-white text-sm">Live Chat</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chat.map((c, i) => (
              <div key={i}>
                <p className={`text-[11px] font-bold mb-0.5 ${c.isMe ? 'text-violet-400' : 'text-slate-400'}`}>{c.user}</p>
                <p className="text-sm text-slate-300">{c.msg}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-800">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-secondary placeholder:text-slate-500"
                placeholder="Send a message..."
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && chatMsg.trim()) {
                    setChat(c => [...c, { user: 'You', msg: chatMsg.trim(), isMe: true }])
                    setChatMsg('')
                  }
                }}
              />
              <button className="p-2 bg-secondary text-white rounded-lg hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
