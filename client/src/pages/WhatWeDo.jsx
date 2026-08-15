import { useState } from "react";
import { ArrowRight, CheckCircle2, FlaskConical, MessageCircle, Rocket, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import AcademyIcon from "../components/academy/AcademyIcon.jsx";
import { SOLUTION_CATEGORIES, TECHNOLOGY_GROUPS, WHAT_WE_DO } from "../data/whatWeDo.js";

const LAB_PILLARS = [
  { title: "Research", body: "Investigating new ideas in geospatial science, AI and spatial intelligence.", icon: "research" },
  { title: "Development", body: "Turning validated ideas into useful systems, applications and workflows.", icon: "code" },
  { title: "Innovation", body: "Exploring new ways to make location-based information more actionable.", icon: "sparkles" },
  { title: "Products", body: "Shaping practical geospatial products that can grow with real-world needs.", icon: "rocket" },
];

function CapabilityCard({ capability }) {
  return (
    <article className="group flex min-h-[270px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-400 hover:shadow-xl">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
        <AcademyIcon name={capability.icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-black tracking-tight text-gray-900">{capability.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{capability.description}</p>
      <Link to="#solution-enquiry" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition group-hover:gap-3 hover:text-brand-800">
        {capability.cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

function TechnologyGroup({ group }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-brand-400/70 hover:bg-white/10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
          <AcademyIcon name={group.icon} className="h-5 w-5" />
        </span>
        <h3 className="text-base font-bold text-white">{group.title}</h3>
      </div>
      <ul className="mt-5 space-y-2.5">
        {group.items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function WhatWeDo() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const capabilities = selectedCategory === "All"
    ? WHAT_WE_DO
    : WHAT_WE_DO.filter((capability) => capability.categories.includes(selectedCategory));

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{ backgroundImage: "radial-gradient(circle at 78% 12%, #49b682, transparent 30%), radial-gradient(circle at 12% 88%, #0f7e4e, transparent 34%), linear-gradient(125deg, transparent 0 58%, rgba(255,255,255,.08) 58% 59%, transparent 59% 100%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="max-w-4xl">
            <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20">
              <Rocket className="h-3.5 w-3.5" aria-hidden="true" /> GeoBrains solution areas
            </span>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Building Intelligent Geospatial Solutions for Real-World Problems
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-300">
              GeoBrains combines geospatial science, software development, artificial intelligence and spatial intelligence to design and develop modern solutions for real-world challenges.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="#capabilities" className="btn-primary bg-brand-500 px-5 py-3 hover:bg-brand-400">
                Explore What We Do <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Discuss a solution
              </Link>
              <Link to="/labs" className="inline-flex items-center gap-2 rounded-lg border border-brand-300/40 px-5 py-3 text-sm font-semibold text-brand-100 transition hover:bg-white/10">
                Explore GeoBrains Labs
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-brand-300">
              <span>Learn. Build. Innovate.</span>
              <span className="hidden h-1 w-1 rounded-full bg-brand-400 sm:block" aria-hidden="true" />
              <span>From Geospatial Data to Intelligent Technology.</span>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section id="capabilities" className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Design · Develop · Deliver</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">🚀 What We Do</h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                We don&apos;t only teach geospatial technology. We design, develop and build geospatial systems, applications, AI solutions and intelligent spatial products.
              </p>
            </div>

            <div className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Solution categories">
              {SOLUTION_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${selectedCategory === category ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-700"}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <p className="mt-5 text-sm text-gray-500" aria-live="polite">
              Showing <strong className="text-gray-900">{capabilities.length}</strong> solution areas
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {capabilities.map((capability) => <CapabilityCard key={capability.id} capability={capability} />)}
            </div>
          </div>
        </section>

        <section id="solution-enquiry" className="border-y border-gray-200 bg-brand-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Start with the challenge</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">Have a Geospatial Problem?</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Tell us what you are trying to solve. We can help transform your spatial data, planning challenge or business problem into a practical geospatial technology solution.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:justify-end">
                <Link to="/contact" className="btn-primary">Start a Project <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link to="/contact" className="btn-secondary">Contact GeoBrains</Link>
                <Link to="/contact" className="btn-secondary"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Talk to Us</Link>
              </div>
            </div>
          </div>
        </section>

        <section id="technology" className="bg-brand-950 text-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="max-w-3xl">
              <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Supporting capability</span>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Technology &amp; Innovation</h2>
              <p className="mt-4 text-base leading-relaxed text-gray-300">
                We use modern geospatial, software engineering and artificial intelligence technologies to design and develop our solutions.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {TECHNOLOGY_GROUPS.map((group) => <TechnologyGroup key={group.title} group={group} />)}
            </div>
          </div>
        </section>

        <section id="labs" className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div>
                <span className="badge bg-brand-50 text-brand-700"><FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> GeoBrains Labs</span>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">🧪 GeoBrains Labs</h2>
                <p className="mt-4 text-base leading-relaxed text-gray-700">
                  GeoBrains Labs is our innovation and technology development space where ideas are transformed into prototypes, systems, applications and geospatial products.
                </p>
                <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-brand-700">Research • Development • Innovation • Products</p>
                <Link to="/labs" className="btn-secondary mt-6">Explore GeoBrains Labs <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {LAB_PILLARS.map((pillar) => (
                  <article key={pillar.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:bg-white hover:shadow-md">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><AcademyIcon name={pillar.icon} className="h-5 w-5" /></span>
                    <h3 className="mt-4 text-base font-bold text-gray-900">{pillar.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{pillar.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="projects-innovation" className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Verified work only</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">Projects &amp; Innovation</h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                Explore selected geospatial systems, prototypes, research and products developed by GeoBrains as they become available.
              </p>
            </div>
            <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center sm:p-12">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Rocket className="h-7 w-7" aria-hidden="true" /></span>
              <h3 className="mt-5 text-xl font-black text-gray-900">The project library will grow with verified work.</h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">When a project has real evidence to share, this space can include its title, problem, solution, status, screenshots, live demo or repository.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/labs" className="btn-secondary">Explore GeoBrains Labs <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link to="/contact" className="btn-primary">Talk to GeoBrains <MessageCircle className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
