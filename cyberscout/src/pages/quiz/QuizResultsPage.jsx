import { useLocation, useParams, Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'

export default function QuizResultsPage() {
  const { quizId } = useParams()
  const { state } = useLocation()
  const quiz = state?.quiz
  const attempt = state?.attempt

  if (!quiz || !attempt) return <AppShell focusMode><main className="mx-auto max-w-xl px-6 py-16 text-center"><h1 className="font-space-grotesk text-2xl font-black text-primary">Quiz result not available</h1><p className="mt-2 text-on-surface-variant">Complete the quiz to create a saved result.</p><Link to={`/quiz/${quizId}`} className="mt-5 inline-flex text-sm font-bold text-secondary hover:underline">Open quiz</Link></main></AppShell>

  const passed = attempt.score >= 70
  const correct = attempt.results.filter(result => result.correct).length

  return (
    <AppShell focusMode>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <section className="border border-slate-200 bg-white p-8 text-center shadow-card"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Saved quiz attempt</p><h1 className="mt-2 font-space-grotesk text-2xl font-black text-primary">{passed ? 'Quiz completed' : 'Review and try again'}</h1><p className="mt-3 text-on-surface-variant">You answered <strong className="text-on-surface">{correct} of {attempt.results.length}</strong> questions correctly.</p><p className="mt-5 font-space-grotesk text-4xl font-black text-secondary">{attempt.score}%</p></section>
        <section className="mt-6 space-y-3" aria-labelledby="answer-review"><h2 id="answer-review" className="font-space-grotesk font-bold text-primary">Answer review</h2>{attempt.results.map(result => <article key={result.questionId} className={`border bg-white p-5 ${result.correct ? 'border-green-200' : 'border-red-200'}`}><h3 className="text-sm font-semibold text-on-surface">{result.prompt}</h3><p className="mt-2 text-sm text-slate-600">Your answer: <strong>{result.selectedAnswer || 'No answer'}</strong></p>{!result.correct && <p className="mt-1 text-sm text-slate-600">Correct answer: <strong>{result.correctAnswer}</strong></p>}</article>)}</section>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to={`/quiz/${quizId}`} className="flex-1 rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-bold text-slate-700">Retake quiz</Link><Link to={`/learn/courses/${quiz.courseId}`} className="flex-1 rounded-lg bg-primary px-5 py-3 text-center text-sm font-bold text-white">Back to course</Link></div>
      </main>
    </AppShell>
  )
}
