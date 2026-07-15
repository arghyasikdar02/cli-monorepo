import { useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { api } from '../../lib/api'

export default function LeaderboardPage() {
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.myCourses()
      .then(({ courses }) => {
        setCourses(courses)
        setCourseId(courses[0]?.id || '')
      })
      .catch(err => setError(err.message || 'Unable to load courses'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!courseId) {
      setLeaderboard([])
      return
    }
    setLoading(true)
    api.get(`/api/leaderboards/course/${courseId}`)
      .then(({ leaderboard }) => {
        setLeaderboard(leaderboard)
        setError('')
      })
      .catch(err => setError(err.message || 'Unable to load leaderboard'))
      .finally(() => setLoading(false))
  }, [courseId])

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] space-y-6 px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-space-grotesk text-3xl font-black text-on-surface">Course Leaderboard</h1>
            <p className="mt-1 text-on-surface-variant">Only real enrolled learner progress appears here.</p>
          </div>
          {courses.length > 0 && (
            <select
              value={courseId}
              onChange={event => setCourseId(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
            >
              {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          )}
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>}
        {loading && <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500 shadow-card">Loading leaderboard...</div>}

        {!loading && !courses.length && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-card">
            <span className="material-symbols-outlined text-5xl text-slate-300">school</span>
            <h2 className="mt-3 font-space-grotesk text-xl font-black text-primary">No enrolled courses yet</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Enroll in a course and make progress before leaderboards can be calculated.</p>
          </div>
        )}

        {!loading && courses.length > 0 && leaderboard.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-card">
            <span className="material-symbols-outlined text-5xl text-slate-300">leaderboard</span>
            <h2 className="mt-3 font-space-grotesk text-xl font-black text-primary">Leaderboard will appear after real progress</h2>
            <p className="mt-2 text-sm text-on-surface-variant">No fabricated rankings are shown. Complete lessons or labs to generate course-specific ranking data.</p>
          </div>
        )}

        {!loading && leaderboard.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  {['Rank', 'Learner', 'Progress', 'Completed lessons', 'Score'].map(header => (
                    <th key={header} className="px-5 py-4 font-bold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map(entry => (
                  <tr key={entry.userId}>
                    <td className="px-5 py-4 font-space-grotesk font-black text-violet-600">{entry.rank}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{entry.name}</p>
                      <p className="text-xs text-slate-500">{entry.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{entry.progress}%</td>
                    <td className="px-5 py-4 text-slate-700">{entry.completedLessons}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{entry.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </AppShell>
  )
}
