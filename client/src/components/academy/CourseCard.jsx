import { ArrowRight, CheckCircle2, ChevronDown, Clock3, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import AcademyIcon from "./AcademyIcon.jsx";

const LEVEL_STYLES = {
  Beginner: "bg-emerald-50 text-emerald-700",
  Intermediate: "bg-amber-50 text-amber-700",
  Advanced: "bg-violet-50 text-violet-700",
  Professional: "bg-sky-50 text-sky-700",
  Expert: "bg-rose-50 text-rose-700",
};

export function CourseHighlight({ course }) {
  return (
    <article className="card flex flex-col p-4 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className="badge min-w-0 max-w-[78%] bg-brand-50 text-brand-700">
          <AcademyIcon name={course.categoryIcon} className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{course.category}</span>
        </span>
        <span className={`badge shrink-0 ${LEVEL_STYLES[course.level] || "bg-gray-100 text-gray-700"}`}>
          {course.level}
        </span>
      </div>
      <h3 className="mt-3 text-base font-bold leading-snug text-gray-900">{course.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600">{course.description}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500">
          <Clock3 className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> {course.duration}
        </span>
        <Link to={`/training/${course.slug}`} className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800" aria-label={`View course: ${course.title}`}>
          View Course <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function CourseCard({ course }) {
  return (
    <article className="card flex min-w-0 flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md">
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand-50 to-white p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="badge min-w-0 max-w-[72%] bg-white text-brand-700 ring-1 ring-brand-100">
            <AcademyIcon name={course.categoryIcon} className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{course.category}</span>
          </span>
          <span className={`badge shrink-0 ${LEVEL_STYLES[course.level] || "bg-gray-100 text-gray-700"}`}>
            {course.level}
          </span>
        </div>
        <h3 className="mt-4 text-lg font-bold leading-snug text-gray-900">{course.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{course.description}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
          <span><Clock3 className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />{course.duration}</span>
          <span><Wrench className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />{course.tools.length} tools</span>
          <span className={course.accessType === "Paid" ? "font-semibold text-sky-700" : "font-semibold text-emerald-700"}>{course.accessType}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden">
            <span>Course details</span>
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Practical project</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">{course.practicalProject}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Software &amp; tools</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {course.tools.map((tool) => <span key={tool} className="badge bg-gray-100 text-gray-700">{tool}</span>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Skills gained</p>
              <ul className="mt-2 space-y-1.5">
                {course.skills.map((skill) => (
                  <li key={skill} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" /> {skill}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Certificate</p><p className="mt-1 text-gray-700">{course.certificate}</p></div>
              <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Career track</p><p className="mt-1 text-gray-700">{course.careerTracks[0] || "Flexible pathway"}</p></div>
            </div>
          </div>
        </details>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
          <Link to={`/training/${course.slug}`} className="btn-primary flex-1 justify-center" aria-label={`View course: ${course.title}`}>
            View Course <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to={`/training/${course.slug}#course-project`} className="btn-secondary justify-center" aria-label={`View project for ${course.title}`}>
            View Project
          </Link>
        </div>
        <Link to={`/training/${course.slug}`} className="mt-2 text-center text-xs font-semibold text-brand-700 hover:text-brand-800">
          Start Learning
        </Link>
      </div>
    </article>
  );
}
