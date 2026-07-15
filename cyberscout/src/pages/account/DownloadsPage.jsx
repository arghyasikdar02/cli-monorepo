import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { api } from '../../lib/api'

export default function DownloadsPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.myCourses()
      .then(async ({ courses }) => {
        const groups = await Promise.all(courses.map(async course => {
          const { materials } = await api.courseMaterials(course.id)
          return materials.map(material => ({ ...material, courseTitle: course.title }))
        }))
        if (active) setResources(groups.flat())
      })
      .catch(err => active && setError(err.message || 'Course resources are unavailable'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  return (
    <AppShell>
      <main className="max-w-[960px] mx-auto px-8 py-8">
        <div className="mb-7"><h1 className="font-space-grotesk text-2xl font-black text-primary">Course resources</h1><p className="mt-1 text-sm text-on-surface-variant">Materials from courses with an active enrolment.</p></div>
        {loading && <div className="border border-slate-200 bg-white p-6 text-sm text-slate-500" role="status">Loading enrolled course resources...</div>}
        {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
        {!loading && !error && !resources.length && <div className="border border-slate-200 bg-white p-8 text-center"><h2 className="font-space-grotesk text-lg font-bold text-primary">No course resources available</h2><p className="mt-2 text-sm text-slate-500">Resources appear here after they are published to an enrolled course.</p><Link to="/learn/courses" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-bold text-white">Open my courses</Link></div>}
        {!loading && !error && resources.length > 0 && <div className="overflow-x-auto border border-slate-200 bg-white"><table className="min-w-[640px] w-full text-left"><thead><tr className="border-b border-slate-200 bg-slate-50">{['Resource', 'Course', 'Type', 'Open'].map(label => <th key={label} className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{resources.map(resource => <tr key={resource.id}><td className="px-5 py-4"><p className="text-sm font-semibold text-slate-900">{resource.title}</p><p className="mt-1 max-w-md text-xs text-slate-500">{resource.description}</p></td><td className="px-5 py-4 text-sm text-slate-600">{resource.courseTitle}</td><td className="px-5 py-4 text-sm capitalize text-slate-600">{resource.type}</td><td className="px-5 py-4"><Link to={`/learn/courses/${resource.courseId}`} className="text-sm font-bold text-secondary hover:underline">View in course</Link></td></tr>)}</tbody></table></div>}
      </main>
    </AppShell>
  )
}
