import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Code2,
  Globe2,
  ImageIcon,
  Lightbulb,
  Megaphone,
  MessageCircle,
  Plane,
  Satellite,
  Target,
  Users,
} from "lucide-react";
import AcademySocialLinks from "../components/AcademySocialLinks.jsx";

const WHATSAPP = "https://chat.whatsapp.com/CkShg01Jp2a1Anz9UPpwax";

const FIND = [
  { title: "GIS & Remote Sensing tutorials", icon: Satellite },
  { title: "Spatial data analysis and visualization", icon: BarChart3 },
  { title: "Python & Automation for GIS", icon: Code2 },
  { title: "Google Earth Engine projects", icon: Globe2 },
  { title: "GeoAI & Machine Learning applications", icon: Bot },
  { title: "Satellite image processing", icon: ImageIcon },
  { title: "Drone mapping and photogrammetry", icon: Plane },
  { title: "GIS jobs, internships, scholarships, and events", icon: Megaphone },
  { title: "Research discussions and project collaboration", icon: Lightbulb },
  { title: "Problem-solving and technical support", icon: Target },
];

const VALUES = [
  "Learn Together",
  "Share Knowledge",
  "Build Skills",
  "Innovate with Geospatial Technology",
  "Support One Another",
];

export default function Community() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 15%, #49b682, transparent 34%), linear-gradient(115deg, transparent 0 45%, rgba(255,255,255,.1) 45% 46%, transparent 46% 100%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-3xl">
            <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20">
              <Users className="h-3.5 w-3.5" aria-hidden="true" /> GeoBrains Academy community
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              GIS &amp; Remote Sensing Hub
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-300">
              A community where people learn, share, research, collaborate and build solutions
              using geospatial technologies.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary bg-brand-500 hover:bg-brand-400"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Join WhatsApp community
              </a>
              <Link
                to="/training"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Explore training <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section id="about-community" className="border-b border-gray-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
                About the community
              </p>
              <h2 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">
                🌍 GIS &amp; Remote Sensing Hub
              </h2>
              <p className="mt-5 text-base leading-relaxed text-gray-700">
                Welcome to <strong>GIS &amp; Remote Sensing Hub</strong>, a community for learners,
                professionals, researchers, and innovators passionate about geospatial technologies.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-700">
                This community is dedicated to exploring the power of{" "}
                <strong>
                  Geographic Information Systems (GIS), Remote Sensing, GeoAI, Spatial Data Science,
                  Drone Mapping, GPS, Google Earth Engine, Python for GIS, Web GIS, Cartography, and
                  Spatial Databases
                </strong>{" "}
                to solve real-world challenges.
              </p>
            </div>
            <div className="card relative overflow-hidden bg-brand-950 p-6 text-white sm:p-8">
              <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-brand-500/20 blur-2xl" />
              <Satellite className="relative h-9 w-9 text-brand-300" aria-hidden="true" />
              <p className="relative mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-brand-300">
                Learn. Explore. Build.
              </p>
              <h3 className="relative mt-2 text-xl font-bold">A place for practical geospatial growth</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-gray-300">
                Connect ideas, tools and people across the full geospatial workflow, from field
                data collection to spatial intelligence.
              </p>
            </div>
          </div>
        </section>

        <section id="community-offerings" className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
                Community pathways
              </p>
              <h2 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">
                What You&apos;ll Find Here
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Explore practical learning, collaboration and career-focused conversations for every
                stage of a geospatial journey.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FIND.map(({ title, icon: Icon }) => (
                <article
                  key={title}
                  className="card flex items-start gap-3 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="pt-1 text-sm font-bold leading-relaxed text-gray-900">{title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="community-vision" className="border-y border-brand-900 bg-brand-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[.7fr_1.3fr] lg:items-center lg:py-16">
            <div>
              <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20">
                <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" /> Direction
              </span>
              <h2 className="mt-4 text-2xl font-black sm:text-3xl">Our Vision</h2>
            </div>
            <blockquote className="border-l-2 border-brand-400 pl-5 text-xl font-semibold leading-relaxed text-gray-100 sm:text-2xl">
              &quot;To build one of the leading geospatial communities where knowledge is shared,
              skills are developed, innovation is encouraged, and professionals collaborate to create
              impactful spatial solutions.&quot;
            </blockquote>
          </div>
        </section>

        <section id="community-values" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
              How we work together
            </p>
            <h2 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">Community Values</h2>
            <div className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {VALUES.map((value) => (
                <div key={value} className="card flex items-center gap-2.5 p-4 text-left lg:flex-col lg:items-start">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <span aria-hidden="true">✔</span>
                  </span>
                  <span className="text-sm font-bold leading-snug text-gray-800">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-10 text-2xl font-black tracking-tight text-brand-800 sm:text-3xl">
              &quot;From Maps to Intelligence—Shaping a Smarter World.&quot; 🌍🚀
            </p>
          </div>
        </section>

        <section className="border-t border-gray-200 bg-brand-50">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] md:items-center md:py-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
                Stay connected
              </p>
              <h2 className="mt-2 text-2xl font-black text-gray-900">Follow GeoBrains Academy</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                Connect with GeoBrains Academy for geospatial training, tutorials, projects,
                opportunities, and professional development.
              </p>
            </div>
            <AcademySocialLinks className="md:justify-end" />
          </div>
        </section>
      </main>
    </div>
  );
}
