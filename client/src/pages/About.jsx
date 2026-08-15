import { Link } from "react-router-dom";
import { Database, Globe2, Layers, Search, ShieldCheck, Workflow } from "lucide-react";

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">About GIS & Remote Sensing Hub</h1>
      <p className="mt-2 text-lg text-gray-700">Prepared by GeoBrains Academy - "From Maps to Intelligence—Shaping a Smarter World." 🌍</p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed text-gray-700">
        <p>
           GIS & Remote Sensing Hub is a public geospatial learning, community and data discovery platform.
          It brings together <strong>links and metadata</strong> for geospatial
          datasets and resources from Tanzania, East Africa, Africa and trusted
          global sources — in one searchable, verified catalogue.
        </p>
        <p>
          The hub is built for urban and regional planners, GIS professionals,
          remote sensing specialists, researchers, students, government
          institutions, NGOs, developers, surveyors and data scientists.
        </p>
        <p>
           It is a <strong>catalogue and resource directory</strong>, not a data
          warehouse: we store metadata and verified links, and every record
          directs you to the original official source. We never redistribute
          restricted or copyrighted data files.
        </p>
      </section>

      <section className="mt-10 card p-6">
        <h2 className="text-lg font-bold text-gray-900">Privacy and account data</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Google provides the name, email address and profile picture needed to manage an account. We do not store Google passwords or expose account emails publicly. Authenticated users can request account deletion from their profile; unnecessary personal data is then anonymized or removed.
        </p>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2">
        {[
          { icon: Search, title: "Search", body: "Full-text search with relevance ranking across title, description, keywords, source, category and coverage." },
          { icon: Layers, title: "Categories", body: "32+ topics from administrative boundaries and DEMs to GeoAI and humanitarian data." },
          { icon: Globe2, title: "Sources", body: "Official Tanzanian institutions (NBS, Ministry of Lands, NLUPC, TPRB) plus NASA, USGS, ESA/Copernicus, FAO, World Bank, WorldPop, OSM and HDX." },
          { icon: Database, title: "Verified links", body: "External URLs are checked automatically. Every record carries a verification status." },
          { icon: Workflow, title: "Automated discovery", body: "Source connectors discover, parse, normalize and deduplicate metadata from official APIs and catalogues." },
          { icon: ShieldCheck, title: "Review workflow", body: "Discovered records pass through review and approval before being published — nothing is auto-published." },
        ].map((f) => (
          <div key={f.title} className="card p-5">
            <div className="mb-2 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-base font-bold text-gray-900">{f.title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 card p-6">
        <h2 className="text-lg font-bold text-gray-900">Open catalogue</h2>
        <p className="mt-1 text-sm text-gray-600">
          The catalogue is built openly: anyone can submit a dataset for
          review, and administrators verify and publish it.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/explore" className="btn-primary">Browse the catalogue</Link>
          <Link to="/submit" className="btn-secondary">Submit a dataset</Link>
        </div>
      </section>
    </div>
  );
}
