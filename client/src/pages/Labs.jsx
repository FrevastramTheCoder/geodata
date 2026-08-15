import { ArrowRight, FlaskConical, Lightbulb, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import AcademyIcon from "../components/academy/AcademyIcon.jsx";

const LAB_PHASES = [
  { title: "Research", body: "Study spatial problems, emerging methods and the needs of the people who use geospatial systems.", icon: "research" },
  { title: "Development", body: "Turn promising ideas into prototypes, workflows, applications and system foundations.", icon: "code" },
  { title: "Innovation", body: "Test new ways to connect geospatial science, software engineering and artificial intelligence.", icon: "sparkles" },
  { title: "Products", body: "Prepare useful geospatial products and solutions for real-world contexts when they are ready to share.", icon: "rocket" },
];

const LAB_PROCESS = ["Question", "Prototype", "Validate", "Develop", "Product"];

export default function Labs() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 82% 18%, #49b682, transparent 32%), radial-gradient(circle at 12% 84%, #0f7e4e, transparent 36%), linear-gradient(125deg, transparent 0 58%, rgba(255,255,255,.08) 58% 59%, transparent 59% 100%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="max-w-4xl">
            <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20"><FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> Research and development space</span>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">🧪 GeoBrains Labs</h1>
            <p className="mt-5 max-w-3xl text-xl font-bold leading-relaxed text-brand-300">Where geospatial ideas move toward technology.</p>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-300">GeoBrains Labs is our innovation and technology development space where ideas are transformed into prototypes, systems, applications and geospatial products.</p>
            <p className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-brand-300">Research • Development • Innovation • Products</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/what-we-do" className="btn-primary bg-brand-500 hover:bg-brand-400">Explore What We Do <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Bring a challenge</Link>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">A distinct part of the ecosystem</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">Ideas need a place to become useful.</h2>
                <p className="mt-4 text-base leading-relaxed text-gray-700">The Academy focuses on what we teach. What We Do describes the solution areas we develop. GeoBrains Labs gives research, experimentation and product thinking their own space.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {LAB_PHASES.map((phase) => (
                  <article key={phase.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:bg-white hover:shadow-md">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><AcademyIcon name={phase.icon} className="h-5 w-5" /></span>
                    <h3 className="mt-4 text-base font-bold text-gray-900">{phase.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{phase.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="max-w-3xl">
              <span className="badge bg-brand-50 text-brand-700"><Lightbulb className="h-3.5 w-3.5" aria-hidden="true" /> Product thinking</span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">From an idea to a geospatial product</h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">Labs creates room to ask better questions, test assumptions and develop technology responsibly before something is presented as a finished project or product.</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {LAB_PROCESS.map((step, index) => (
                <div key={step} className="relative rounded-2xl border border-brand-100 bg-white p-5 text-center shadow-sm">
                  <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">{index + 1}</span>
                  <p className="mt-3 text-sm font-bold text-gray-900">{step}</p>
                  {index < LAB_PROCESS.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-white text-brand-500 lg:block" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center sm:p-12">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Rocket className="h-7 w-7" aria-hidden="true" /></span>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Lab portfolio</p>
              <h2 className="mt-2 text-2xl font-black text-gray-900">Prototypes and products will be published when verified.</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">This space is intentionally ready for actual research, prototypes, systems and geospatial products. No unverified work is presented as completed.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/projects" className="btn-secondary">Projects &amp; Innovation <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link to="/contact" className="btn-primary">Talk to GeoBrains <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
