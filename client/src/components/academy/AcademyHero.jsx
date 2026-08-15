import { ArrowRight, GraduationCap, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import AcademySocialLinks from "../AcademySocialLinks.jsx";
import BrandLogo from "../BrandLogo.jsx";

const WHATSAPP = "https://chat.whatsapp.com/CkShg01Jp2a1Anz9UPpwax";

export default function AcademyHero({ courseCount, categoryCount, pathCount }) {
  return (
    <section className="relative overflow-hidden bg-brand-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 20%, #49b682, transparent 32%), radial-gradient(circle at 15% 90%, #0f7e4e, transparent 38%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-5xl">
          <BrandLogo className="mb-5 h-20 w-20 sm:h-24 sm:w-24" priority />
          <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> GeoBrains Academy
          </span>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Learn Geospatial Technology. Build Real Solutions. Create Your Future.
          </h1>
          <p className="mt-5 max-w-4xl text-lg leading-relaxed text-gray-300 sm:text-xl">
            Master GIS, Remote Sensing, GeoAI, Python, Web GIS, Cloud GIS, Digital Twins, Drone Mapping and modern geospatial technologies through practical, project-based learning.
          </p>
          <p className="mt-4 text-sm font-semibold text-brand-300">
            From Maps to Intelligence — Shaping a Smarter World.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
             <Link to="#course-catalog" className="btn-primary bg-brand-500 hover:bg-brand-400">
               Explore Courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
             </Link>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Join GeoBrains Academy
            </a>
             <Link to="#learning-paths" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
               View Learning Paths
             </Link>
            <Link to="/community" className="inline-flex items-center gap-2 rounded-lg border border-brand-300/40 px-5 py-2.5 text-sm font-semibold text-brand-100 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
              Visit the Hub
            </Link>
          </div>
          <AcademySocialLinks dark follow className="mt-4" />
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-black text-white">{courseCount}+</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">Course pathways</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-black text-white">{categoryCount}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">Academy categories</div>
            </div>
            <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-4 sm:col-span-1">
              <div className="text-2xl font-black text-white">{pathCount}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">Career paths</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
