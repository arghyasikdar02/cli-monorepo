import { useParams, useLocation, Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { getQuizById } from '../../data/quizzes'

const LABELS = ['A', 'B', 'C', 'D']

export default function QuizResultsPage() {
  const { quizId } = useParams()
  const { state } = useLocation()
  const quiz = state?.quiz ?? getQuizById(quizId)
  const answers = state?.answers ?? []
  const score = state?.score ?? 0

  const passed = score >= 70
  const correct = answers.filter(a => a.correct).length

  return (
    <AppShell focusMode>
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Score hero */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-8 text-center mb-6">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-5 ${passed ? 'bg-green-50 border-4 border-green-400' : 'bg-red-50 border-4 border-red-400'}`}>
            <span className={`font-space-grotesk text-3xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>{score}%</span>
          </div>
          <h1 className="font-space-grotesk text-2xl font-black text-primary mb-2">
            {passed ? 'Excellent Work!' : 'Keep Practicing!'}
          </h1>
          <p className="text-on-surface-variant mb-5">
            You answered <span className="font-bold text-on-surface">{correct} of {quiz?.questions?.length ?? answers.length}</span> questions correctly.
          </p>
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            <span className="font-space-grotesk text-sm font-bold">+{Math.round(score * 1.2)} XP Earned</span>
          </div>
        </div>

        {/* Answer review */}
        {quiz && answers.length > 0 && (
          <div className="space-y-3 mb-8">
            <h2 className="font-space-grotesk font-bold text-primary mb-4">Answer Review</h2>
            {quiz.questions.map((q, i) => {
              const ans = answers[i]
              if (!ans) return null
              return (
                <div key={q.id} className={`bg-white rounded-xl border p-5 ${ans.correct ? 'border-green-200' : 'border-red-200'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5 ${ans.correct ? 'text-green-500' : 'text-error'}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      {ans.correct ? 'check_circle' : 'cancel'}
                    </span>
                    <p className="text-sm font-semibold text-on-surface">{q.text}</p>
                  </div>
                  <div className="ml-8 space-y-1 text-xs text-on-surface-variant">
                    <p>Your answer: <span className={ans.correct ? 'text-green-600 font-bold' : 'text-error font-bold'}>{LABELS[ans.selectedIdx]}. {q.options[ans.selectedIdx]}</span></p>
                    {!ans.correct && <p>Correct: <span className="text-green-600 font-bold">{LABELS[q.correctIndex]}. {q.options[q.correctIndex]}</span></p>}
                    <p className="text-slate-400 mt-1 italic">{q.tip}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-3">
          <Link to={`/quiz/${quizId}`}
            className="flex-1 text-center py-3 border-2 border-slate-200 text-slate-700 font-space-grotesk font-bold text-sm rounded-xl hover:border-primary hover:text-primary transition-colors">
            Retake Quiz
          </Link>
          <Link to={`/courses/${quiz?.courseId}`}
            className="flex-1 text-center py-3 bg-primary text-white font-space-grotesk font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
            Back to Course
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
