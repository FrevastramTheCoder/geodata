import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import AcademyIcon from "./AcademyIcon.jsx";

export default function LearningPathCard({ path }) {
  return (
    <article className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><AcademyIcon name={path.icon} className="h-5 w-5" /></span>
        <span className="badge bg-gray-100 text-gray-600">{path.level}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-gray-900">{path.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{path.description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {path.steps.map((step, index) => <span key={`${step}-${index}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700"><span className="rounded-full bg-brand-50 px-2 py-1">{step}</span>{index < path.steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />}</span>)}
      </div>
      <p className="mt-5 flex-1 border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-700"><strong>Outcome:</strong> {path.outcome}</p>
      <Link to={`/training?track=${encodeURIComponent(path.title)}`} className="btn-secondary mt-5 justify-center">Explore pathway <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </article>
  );
}
