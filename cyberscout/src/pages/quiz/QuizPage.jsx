import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import QuizOption from '../../components/quiz/QuizOption'
import QuizProgress from '../../components/quiz/QuizProgress'
import { getQuizById } from '../../data/quizzes'

export default function QuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const quiz = getQuizById(quizId)

  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(quiz?.timeLimit ?? 900)

  useEffect(() => {
    if (timeLeft <= 0 || !quiz) return
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft, quiz])

  const submit = useCallback(() => {
    if (selected === null || !quiz) return
    setRevealed(true)
    const isCorrect = selected === quiz.questions[qIdx].correctIndex
    const newAnswers = [...answers, { questionIdx: qIdx, selectedIdx: selected, correct: isCorrect }]
    setAnswers(newAnswers)

    setTimeout(() => {
      if (qIdx + 1 < quiz.questions.length) {
        setQIdx(i => i + 1)
        setSelected(null)
        setRevealed(false)
      } else {
        const score = Math.round((newAnswers.filter(a => a.correct).length / quiz.questions.length) * 100)
        navigate(`/quiz/${quizId}/results`, { state: { answers: newAnswers, score, quiz } })
      }
    }, 1200)
  }, [selected, quiz, qIdx, answers, navigate, quizId])

  if (!quiz) return (
    <AppShell focusMode>
      <div className="flex items-center justify-center h-96 text-on-surface-variant">Quiz not found</div>
    </AppShell>
  )

  const question = quiz.questions[qIdx]
  const LABELS = ['A', 'B', 'C', 'D']

  const getOptionState = (i) => {
    if (!revealed) return i === selected ? 'selected' : 'default'
    if (i === question.correctIndex) return 'correct'
    if (i === selected && selected !== question.correctIndex) return 'wrong'
    return 'default'
  }

  return (
    <AppShell focusMode>
      {/* Quiz top bar */}
      <div className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link to={`/courses/${quiz.courseId}`} className="text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <h1 className="font-space-grotesk text-sm font-semibold text-on-surface">Quiz: {quiz.title}</h1>
        </div>
        <span className="font-space-grotesk text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
          {quiz.level}
        </span>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <QuizProgress current={qIdx + 1} total={quiz.questions.length} timeLeft={timeLeft} />

        <div className="space-y-5">
          {/* Question card */}
          <div className="bg-white rounded-xl p-7 border border-slate-200 shadow-card">
            <h2 className="font-space-grotesk text-lg font-semibold text-primary mb-6 leading-snug">
              {question.text}
            </h2>
            <div className="space-y-3">
              {question.options.map((opt, i) => (
                <QuizOption
                  key={i}
                  label={LABELS[i]}
                  text={opt}
                  state={getOptionState(i)}
                  onClick={() => !revealed && setSelected(i)}
                />
              ))}
            </div>
          </div>

          {/* Pro tip */}
          {revealed && (
            <div className="bg-primary-container rounded-xl p-5 flex gap-4 border border-white/10">
              <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-secondary text-[20px]">lightbulb</span>
              </div>
              <div>
                <p className="font-space-grotesk text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">PRO TIP</p>
                <p className="text-sm text-on-primary-container leading-relaxed">{question.tip}</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <button
              onClick={submit}
              disabled={selected === null || revealed}
              className="px-10 py-3.5 bg-primary text-white font-space-grotesk font-bold rounded-full shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center gap-2"
            >
              Submit Answer
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <div className="flex gap-6">
              {[['flag', 'Report Issue'], ['bookmark', 'Save Question']].map(([icon, label]) => (
                <button key={label} className="text-slate-400 hover:text-primary font-space-grotesk text-[11px] font-bold flex items-center gap-1.5 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
