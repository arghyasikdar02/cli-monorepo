import { notFound } from 'next/navigation';
import { courses, getCourse } from '../../data/courses';
import { LeadForm } from '../../ui/LeadForm';
import { CLILogo } from '../../ui/CLILogo';

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <nav className="border-b border-slate-200/70 bg-white/85 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="inline-flex items-center gap-3">
            <CLILogo className="w-28 dark:hidden" priority />
            <img src="/brand/cyber-lab-in-full-dark.png" alt="Cyber Lab IN" className="hidden w-28 dark:block" />
          </a>
          <a href="/#lead" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-950">
            Start Learning
          </a>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="text-sm font-semibold text-sky-600">{course.level}</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">{course.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{course.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {course.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {tag}
              </span>
            ))}
          </div>
          <section className="mt-10 rounded-lg border border-slate-200 p-6 dark:border-slate-800">
            <h2 className="text-2xl font-semibold">What you will practice</h2>
            <ul className="mt-5 grid gap-3 text-slate-600 dark:text-slate-300">
              {course.outcomes.map((outcome) => (
                <li key={outcome}>Check: {outcome}</li>
              ))}
            </ul>
          </section>
        </div>
        <aside id="lead" className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-semibold">Join this course</h2>
          <LeadForm />
        </aside>
      </section>
    </main>
  );
}

