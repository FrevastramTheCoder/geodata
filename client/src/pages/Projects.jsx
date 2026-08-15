import { ArrowRight, FlaskConical, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

export default function Projects() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #49b682, transparent 34%), radial-gradient(circle at 10% 90%, #0f7e4e, transparent 36%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-4xl">
            <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20"><Rocket className="h-3.5 w-3.5" aria-hidden="true" /> Verified work</span>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Projects &amp; Innovation</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-300">Explore selected geospatial systems, prototypes, research and products developed by GeoBrains as they become available.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/what-we-do" className="btn-primary bg-brand-500 hover:bg-brand-400">Explore What We Do <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link to="/labs" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"><FlaskConical className="h-4 w-4" aria-hidden="true" /> GeoBrains Labs</Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm sm:p-12">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Rocket className="h-7 w-7" aria-hidden="true" /></span>
          <h2 className="mt-5 text-2xl font-black text-gray-900">Selected work will appear here as it becomes available.</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">GeoBrains only publishes work when there is real evidence to share, including a clear status and supporting material.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/what-we-do" className="btn-primary">Discover solution areas <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/labs" className="btn-secondary">Explore GeoBrains Labs</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
