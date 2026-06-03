import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { downloads } from '../../data/downloads'

const TYPE_ICONS = { pdf: 'picture_as_pdf', zip: 'folder_zip', png: 'image' }
const TYPE_COLORS = { pdf: 'text-red-500', zip: 'text-amber-500', png: 'text-blue-500' }

export default function DownloadsPage() {
  const [items, setItems] = useState(downloads)

  const remove = (id) => setItems(d => d.filter(x => x.id !== id))

  return (
    <AppShell>
      <div className="max-w-[960px] mx-auto px-8 py-8">
        <div className="mb-7">
          <h1 className="font-space-grotesk text-2xl font-black text-primary">Downloads</h1>
          <p className="text-on-surface-variant mt-1 text-sm">{items.length} files downloaded</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['File', 'Course', 'Size', 'Date', ''].map(h => (
                  <th key={h} className="px-6 py-3.5 font-space-grotesk text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(file => (
                <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[20px] ${TYPE_COLORS[file.type] ?? 'text-slate-400'}`}>
                        {TYPE_ICONS[file.type] ?? 'draft'}
                      </span>
                      <span className="text-sm font-medium text-on-surface">{file.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{file.course}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{file.size}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{file.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/lessons/${file.courseId}/${file.lessonId}`}
                        className="px-3 py-1.5 text-xs font-bold font-space-grotesk text-secondary border border-secondary rounded-lg hover:bg-secondary/5 transition-colors">
                        Open
                      </Link>
                      <button onClick={() => remove(file.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-error transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">download_done</span>
              <p className="font-space-grotesk font-semibold">No downloads yet</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
