import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import SiteIcon from './SiteIcon'

const LEVEL_COLORS = {
  Beginner: 'text-green-600 bg-green-50',
  Intermediate: 'text-amber-600 bg-amber-50',
  Advanced: 'text-red-600 bg-red-50',
}

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/learn/courses/${course.id}`}
      className="bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:border-violet-200 transition-all block group"
    >
      <div className="aspect-video rounded-t-xl overflow-hidden bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center">
        <SiteIcon name="security" size={56} className="text-white/40" />
      </div>
      <div className="p-4">
        <h5 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors text-sm leading-snug mb-2">
          {course.title}
        </h5>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-3">
          <span className="flex items-center gap-1">
            <SiteIcon name="schedule" size={14} />
            {course.duration}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${LEVEL_COLORS[course.level] ?? 'text-slate-500 bg-slate-100'}`}>
            {course.level}
          </span>
        </div>
        {course.enrolled && course.progress > 0 && (
          <>
            <ProgressBar value={course.progress} glow />
            <p className="text-xs text-violet-600 font-bold mt-1">{course.progress}% complete</p>
          </>
        )}
      </div>
    </Link>
  )
}
