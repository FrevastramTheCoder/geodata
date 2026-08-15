import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AcademyIcon from "./AcademyIcon.jsx";

export default function ProjectCard({ project }) {
  return (
    <article className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><AcademyIcon name={project.icon} className="h-5 w-5" /></span>
      <h3 className="mt-4 text-base font-bold text-gray-900">{project.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">{project.tools.map((tool) => <span key={tool} className="badge bg-gray-100 text-gray-700">{tool}</span>)}</div>
       <Link to="#course-catalog" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800">Find related courses <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </article>
  );
}
