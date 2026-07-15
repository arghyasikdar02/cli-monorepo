import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import QuizOption from '../../components/quiz/QuizOption'
import QuizProgress from '../../components/quiz/QuizProgress'
import { api } from '../../lib/api'

export default function QuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get(`/api/quizzes/${quizId}`)
      .then(({ quiz: next }) => active && setQuiz(next))
      .catch(err => active && setError(err.message || 'Quiz unavailable'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [quizId])

  if (loading) return <AppShell focusMode><div className="flex h-96 items-center justify-center text-on-surface-variant" role="status">Loading quiz...</div></AppShell>
  if (!quiz || error) return <AppShell focusMode><div className="mx-auto max-w-xl px-6 py-16 text-center"><h1 className="font-space-grotesk text-2xl font-black text-primary">Quiz unavailable</h1><p className="mt-2 text-on-surface-variant">{error || 'This quiz has not been published.'}</p><Link to="/learn/courses" className="mt-5 inline-flex text-sm font-bold text-secondary hover:underline">Return to courses</Link></div></AppShell>

  const question = quiz.questions[questionIndex]
  if (!question) return <AppShell focusMode><div className="mx-auto max-w-xl px-6 py-16 text-center"><h1 className="font-space-grotesk text-2xl font-black text-primary">No questions published</h1><p className="mt-2 text-on-surface-variant">The instructor has not added questions to this quiz.</p></div></AppShell>

  const continueQuiz = async () => {
    if (!selected || submitting) return
    const nextAnswers = { ...answers, [question.id]: selected }
    setAnswers(nextAnswers)
    if (questionIndex + 1 < quiz.questions.length) {
      setQuestionIndex(index => index + 1)
      setSelected('')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const { attempt } = await api.post(`/api/quizzes/${quiz.id}/attempts`, { answers: nextAnswers })
      navigate(`/quiz/${quiz.id}/results`, { state: { quiz, attempt } })
    } catch (err) {
      setError(err.message || 'Quiz submission failed')
      setSubmitting(false)
    }
  }

  return (
    <AppShell focusMode>
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-7 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Course quiz</p><h1 className="mt-1 font-space-grotesk text-xl font-bold text-primary">{quiz.title}</h1></div><Link to={`/learn/courses/${quiz.courseId}`} className="text-sm font-bold text-secondary hover:underline">Exit quiz</Link></div>
        <QuizProgress current={questionIndex + 1} total={quiz.questions.length} />
        <section className="mt-6 border border-slate-200 bg-white p-7 shadow-card" aria-labelledby="quiz-question">
          <h2 id="quiz-question" className="mb-6 font-space-grotesk text-lg font-semibold leading-snug text-primary">{question.prompt}</h2>
          <div className="space-y-3">{question.choices.map((choice, index) => <QuizOption key={choice} label={String.fromCharCode(65 + index)} text={choice} state={choice === selected ? 'selected' : 'default'} onClick={() => setSelected(choice)} />)}</div>
        </section>
        {error && <div className="mt-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
        <div className="mt-6 flex justify-end"><button type="button" onClick={continueQuiz} disabled={!selected || submitting} className="min-h-11 rounded-lg bg-primary px-6 font-space-grotesk text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{submitting ? 'Saving attempt...' : questionIndex + 1 === quiz.questions.length ? 'Submit quiz' : 'Next question'}</button></div>
      </main>
    </AppShell>
  )
}
