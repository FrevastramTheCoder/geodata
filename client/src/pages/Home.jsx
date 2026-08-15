import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FolderOpen,
  Globe2,
  Layers,
  MessageCircle,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { getBoundaryTree, getDatasetCategories, getDatasetStats, listDatasets } from "../services/datasetsApi.js";
import BrandLogo from "../components/BrandLogo.jsx";
import { DatasetCard, Loading, ErrorState, CategoryIcon } from "../components/ui.jsx";

const SUGGESTIONS = [
  "Tanzania DEM",
  "Dar es Salaam buildings",
  "Tanzania roads",
  "Land cover Tanzania",
  "Population data",
  "Flood data",
  "Administrative boundaries",
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [latest, setLatest] = useState([]);
  const [verified, setVerified] = useState([]);
  const [boundaries, setBoundaries] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    Promise.all([
      getDatasetStats(),
      getDatasetCategories(),
      listDatasets({ sort: "newest", perPage: 6 }),
      listDatasets({ sort: "verified", perPage: 6 }),
    ])
      .then(([s, c, d, v]) => {
        if (!alive) return;
        setStats(s);
        setCategories(c);
        setLatest(d.items || []);
        setVerified(v.items || []);
        const tree = getBoundaryTree()[0];
        setBoundaries({ total: tree?.children?.length || 0, regions: tree?.children || [] });
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  function submit(e) {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/explore?q=${encodeURIComponent(q.trim())}`);
  }

  if (loading) return <Loading label="Loading the hub..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #1c9e62 0, transparent 40%), radial-gradient(circle at 80% 60%, #0f7e4e 0, transparent 45%), linear-gradient(160deg, transparent 65%, #042217 100%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-20">
           <div className="mx-auto max-w-3xl text-center">
             <BrandLogo className="mx-auto h-28 w-28 sm:h-36 sm:w-36" priority />
             <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20">
               Learn. Explore. Build. Innovate.
             </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
               GIS & REMOTE SENSING HUB
            </h1>
             <p className="mt-4 text-lg leading-relaxed text-gray-300">
               An open geospatial community connecting learners, professionals,
               researchers and innovators through GIS, Remote Sensing, GeoAI
               and spatial technologies.
             </p>
             <p className="mt-3 text-sm font-semibold text-brand-300">
               Prepared by GeoBrains Academy - "From Maps to Intelligence—Shaping a Smarter World." 🌍
             </p>

            <form onSubmit={submit} className="mx-auto mt-8 flex max-w-xl items-center gap-2">
               <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search geospatial data..."
                  className="w-full rounded-xl border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 shadow-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-400/40"
                />
              </div>
              <button type="submit" className="btn-primary rounded-xl px-6 py-3.5">
                Search
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
              <span>Try:</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => navigate(`/explore?q=${encodeURIComponent(s)}`)}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-gray-300 transition hover:border-brand-400 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/explore" className="btn-primary bg-brand-500 px-6 py-3 hover:bg-brand-400">
                <Database className="h-4 w-4" />
                Explore Data
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <FolderOpen className="h-4 w-4" />
                Browse Categories
              </Link>
              <Link to="/training" className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Explore Training
              </Link>
              <Link to="/community" className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                <MessageCircle className="h-4 w-4" /> Join Community
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-brand-300/50 px-6 py-3 text-sm font-semibold text-brand-100 transition hover:bg-white/10">
                Continue with Google
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Datasets", value: stats.datasets, icon: Database },
              { label: "Sources", value: stats.sources, icon: Globe2 },
              { label: "Categories", value: stats.categories, icon: Layers },
              { label: "Primary Coverage", value: "Tanzania", icon: MapPinStar },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur"
              >
                <s.icon className="mx-auto mb-2 h-5 w-5 text-brand-300" />
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community introduction */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">A professional learning community</p>
              <h2 className="mt-2 text-2xl font-black text-gray-900">Learn, share and build with geospatial technology.</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">GIS & Remote Sensing Hub is a community for learners, professionals, researchers and innovators exploring the power of GIS, satellite imagery, GeoAI, spatial data science, drone mapping, GPS, Google Earth Engine, Python, Web GIS and spatial databases.</p>
              <div className="mt-5 flex flex-wrap gap-3"><Link to="/community" className="btn-primary">Discover the community <ArrowRight className="h-4 w-4" /></Link><Link to="/contact" className="btn-secondary">Contact us</Link></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["GIS & Remote Sensing tutorials", "Spatial data analysis and visualization", "Python & Automation for GIS", "GeoAI & Machine Learning applications", "Satellite image processing", "Drone mapping and photogrammetry"].map((item) => <div key={item} className="card flex items-start gap-3 p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><span className="text-sm font-semibold text-gray-800">{item}</span></div>)}
            </div>
          </div>
        </div>
      </section>

      {/* GeoBrains ecosystem */}
      <section className="border-b border-gray-200 bg-brand-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-300">The GeoBrains ecosystem</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">🌍 From Maps to Intelligence</h2>
            <p className="mt-2 text-lg font-bold text-brand-300">Learn. Build. Innovate.</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">GeoBrains combines geospatial education, software development, GeoAI research, smart city technology and real-world innovation to prepare the next generation of geospatial professionals and technology creators.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "GeoBrains Academy", body: "Learn modern geospatial technology through courses, paths and project-based training.", to: "/training", label: "Explore Academy" },
              { title: "What We Do", body: "Design and develop geospatial systems, applications, AI solutions and intelligent spatial products.", to: "/what-we-do", label: "Explore Solutions" },
              { title: "GeoBrains Labs", body: "Research, prototype and develop new geospatial technology ideas and products.", to: "/labs", label: "Explore Labs" },
              { title: "Projects & Innovation", body: "Explore selected geospatial systems, prototypes, research and products as they become available.", to: "/projects", label: "View Projects" },
              { title: "GeoBrains Resources", body: "Find software, datasets, APIs, tutorials, tools and official geospatial sources.", to: "/resources", label: "Open Resources" },
              { title: "GeoBrains Opportunities", body: "Find jobs, internships, scholarships, research opportunities and professional growth.", to: "/opportunities", label: "Find Opportunities" },
              { title: "GIS & Remote Sensing Hub", body: "Connect with learners, professionals, researchers and innovators across the community.", to: "/community", label: "Join the Hub" },
            ].map((item) => (
              <Link key={item.title} to={item.to} className="group rounded-xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:bg-white/10">
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{item.body}</p>
                <span className="mt-4 inline-flex items-center text-xs font-bold text-brand-300 group-hover:text-brand-200">{item.label} <ArrowRight className="ml-1 h-3.5 w-3.5" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Learning and community CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <Link to="/training" className="card group bg-brand-950 p-6 text-white transition hover:border-brand-400"><h2 className="text-lg font-bold">Learn Geospatial Technologies</h2><p className="mt-2 text-sm leading-relaxed text-gray-300">Build practical skills through GIS, Remote Sensing, GeoAI, Python, Google Earth Engine and spatial data projects.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">Explore training <ArrowRight className="h-4 w-4" /></span></Link>
          <Link to="/projects" className="card p-6 transition hover:border-brand-400"><h2 className="text-lg font-bold text-gray-900">Projects &amp; Innovation</h2><p className="mt-2 text-sm leading-relaxed text-gray-600">Explore selected geospatial systems, prototypes, research and products as they become available.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">View projects <ArrowRight className="h-4 w-4" /></span></Link>
          <Link to="/opportunities" className="card p-6 transition hover:border-brand-400"><h2 className="text-lg font-bold text-gray-900">Jobs & Opportunities</h2><p className="mt-2 text-sm leading-relaxed text-gray-600">Find GIS jobs, internships, scholarships, fellowships, competitions and conferences.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">Find opportunities <ArrowRight className="h-4 w-4" /></span></Link>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-brand-50">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6"><h2 className="text-2xl font-black text-gray-900">Join Our GIS & Remote Sensing Community</h2><p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">Connect with fellow GIS learners, professionals, researchers and innovators.</p><a href="https://chat.whatsapp.com/CkShg01Jp2a1Anz9UPpwax" target="_blank" rel="noreferrer" className="btn-primary mt-5">JOIN WHATSAPP COMMUNITY <MessageCircle className="h-4 w-4" /></a></div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            <p className="mt-1 text-sm text-gray-600">
              Every geospatial topic, from administrative boundaries to GeoAI.
            </p>
          </div>
          <Link to="/categories" className="btn-secondary">
            All categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.slice(0, 15).map((c) => (
            <Link
              key={c.slug}
              to={`/explore?category=${c.slug}`}
              className="card group p-4 transition hover:border-brand-400 hover:shadow-md"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
                style={{ backgroundColor: `${c.color}1a`, color: c.color }}
              >
                <CategoryIcon icon={c.icon} className="text-lg" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700">
                {c.name}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">{c._count?.datasets || 0} datasets</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Administrative boundaries */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Administrative Boundaries</h2>
              <p className="mt-1 text-sm text-gray-600">
                NBS census geography — regions, districts, wards, villages and enumeration areas.
              </p>
            </div>
            <Link to="/boundaries" className="btn-secondary">
              Open boundary catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="card flex flex-col justify-between bg-brand-950 p-6 text-white">
              <div>
                <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20">
                  Tanzania · NBS 2022
                </span>
                <h3 className="mt-3 text-lg font-bold">
                  {boundaries ? `${boundaries.total} catalogued areas` : "National & regional levels"}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-300">
                  Country + {boundaries?.regions.length || 26} regions (ISO 3166-2:TZ), each
                  linking to the official NBS shapefile metadata. Districts and wards download
                  directly from NBS shapefile pages.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/boundaries" className="btn-primary bg-brand-500 px-4 py-2 text-xs hover:bg-brand-400">
                  Explore boundaries
                </Link>
                <a
                  href="https://microdata.nbs.go.tz/index.php/catalog/49"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  NBS Region 2022
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div className="card p-5 lg:col-span-2">
              <div className="mb-3 flex flex-wrap gap-2">
                {(boundaries?.regions || []).slice(0, 24).map((r) => (
                  <Link
                    key={r.id}
                    to="/boundaries"
                    className="badge bg-brand-50 text-brand-800 transition hover:bg-brand-100"
                  >
                    {r.name}
                  </Link>
                ))}
              </div>
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Villages, sub-wards and enumeration areas are not openly published —
                they are requested from NBS via the catalogue.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Latest Datasets</h2>
              <p className="mt-1 text-sm text-gray-600">
                Recently added and verified resources.
              </p>
            </div>
            <Link to="/latest" className="btn-secondary">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((d) => (
              <DatasetCard key={d.id} d={d} />
            ))}
          </div>
        </div>
      </section>

      {/* Recently verified */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <ShieldCheck className="h-6 w-6 text-brand-600" /> Recently Verified
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Resources whose official links were most recently checked and confirmed live.
              </p>
            </div>
            <Link to="/explore?sort=verified" className="btn-secondary">
              All verified
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {verified.map((d) => (
              <DatasetCard key={d.id} d={d} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: "Search",
              body: "Full-text search across title, description, keywords, source, category and coverage — with relevance ranking.",
            },
            {
              icon: Globe2,
              title: "Access",
               body: "Every record links to its original official source. GIS & Remote Sensing Hub hosts metadata only, never third-party data files.",
            },
            {
              icon: Layers,
              title: "Verify",
              body: "External links are checked periodically and every dataset carries a verification status you can trust.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MapPinStar(props) {
  return <MapPinGlyph {...props} />;
}
function MapPinGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
