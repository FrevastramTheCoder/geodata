import { GraduationCap, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import AcademySocialLinks from "../AcademySocialLinks.jsx";

const WHATSAPP = "https://chat.whatsapp.com/CkShg01Jp2a1Anz9UPpwax";

export default function AcademyCTA() {
  return (
    <section className="bg-brand-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-7 sm:p-10">
          <div className="max-w-4xl">
            <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20"><GraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> Build your future</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">🌍 From Maps to Intelligence</h2>
            <p className="mt-2 text-xl font-bold text-brand-300">Learn. Build. Innovate.</p>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-300">Join GeoBrains Academy and develop practical skills in modern geospatial technology through hands-on training, real-world projects, community collaboration and career development.</p>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
             <Link to="#course-catalog" className="btn-primary bg-brand-500 hover:bg-brand-400">Explore Courses</Link>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-secondary border-white/20 bg-transparent text-white hover:bg-white/10"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Join the Community</a>
             <Link to="#course-catalog" className="inline-flex items-center rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Start Learning</Link>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-brand-200">Follow GeoBrains Academy</span>
              <AcademySocialLinks dark follow />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
