import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AcademyIcon from "./AcademyIcon.jsx";

export default function ServiceCard({ service }) {
  return (
    <article className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <AcademyIcon name={service.icon} className="h-5 w-5" />
        </span>
        <span className="badge bg-gray-100 text-gray-600">GeoBrains Labs</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-gray-900">{service.title}</h3>
      <p className="mt-1 text-sm font-semibold text-brand-700">{service.subtitle}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{service.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {service.technologies.map((technology) => <span key={technology} className="badge bg-brand-50 text-brand-800">{technology}</span>)}
      </div>
      <details className="group mt-5 border-t border-gray-100 pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-brand-700 [&::-webkit-details-marker]:hidden">
          <span>What we build</span><span className="transition group-open:rotate-45" aria-hidden="true">+</span>
        </summary>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {service.capabilities.map((capability) => <li key={capability} className="text-sm text-gray-700">{capability}</li>)}
        </ul>
      </details>
      <Link to="/contact" className="btn-secondary mt-5 justify-center">Discuss a solution <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </article>
  );
}
