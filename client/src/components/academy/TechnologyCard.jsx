import AcademyIcon from "./AcademyIcon.jsx";

export default function TechnologyCard({ item, dark = false }) {
  return (
    <article className={`rounded-xl border p-5 transition hover:-translate-y-0.5 ${dark ? "border-white/10 bg-white/5 hover:border-brand-400" : "card hover:border-brand-400 hover:shadow-md"}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${dark ? "bg-white/10 text-brand-300" : "bg-brand-50 text-brand-700"}`}><AcademyIcon name={item.icon} className="h-5 w-5" /></span>
      <h3 className={`mt-4 text-base font-bold ${dark ? "text-white" : "text-gray-900"}`}>{item.title}</h3>
      <p className={`mt-1.5 text-sm leading-relaxed ${dark ? "text-gray-300" : "text-gray-600"}`}>{item.body}</p>
    </article>
  );
}
