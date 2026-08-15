import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Download,
  GraduationCap,
  Layers,
  Monitor,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { getSoftwareCategories, getSoftwareStats, listSoftware } from "../services/softwareApi.js";
import { SoftwareCard, Loading, ErrorState, EmptyState, Pagination } from "../components/ui.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

const SORTS = [
  { value: "popular", label: "Most Popular" },
  { value: "verified", label: "Recently Verified" },
  { value: "name", label: "Name A–Z" },
  { value: "free", label: "Free First" },
  { value: "open", label: "Open Source" },
  { value: "newest", label: "Newest" },
];

const OS_OPTIONS = ["Windows", "Linux", "macOS", "Web", "Android", "iOS"];

export default function SoftwareHome() {
  usePageMeta("Software Hub", "Discover GIS, remote sensing, CAD, BIM and geospatial software from official sources.");
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const license = params.get("license") || "";
  const os = params.get("os") || "";
  const sort = params.get("sort") || "popular";
  const page = Number(params.get("page")) || 1;
  const free = params.get("free") === "true";
  const student = params.get("student") === "true";

  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const query = { perPage: 24, page, sort };
    if (q) query.q = q;
    if (category) query.category = category;
    if (license) query.license = license;
    if (os) query.os = os;
    if (free) query.free = "true";
    if (student) query.student = "true";
    Promise.all([listSoftware(query), Promise.resolve(getSoftwareCategories()), Promise.resolve(getSoftwareStats())])
      .then(([d, c, s]) => {
        if (!alive) return;
        setData(d);
        setCategories(c);
        setStats(s);
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [q, category, license, os, sort, page, free, student]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  function clearAll() {
    setParams({});
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20">
                <Sparkles className="h-3.5 w-3.5" /> Official links only
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                GEO SOFTWARE HUB
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">
                Find and download the software used by geospatial professionals —
                GIS, remote sensing, CAD &amp; BIM, surveying, spatial data science,
                GeoAI and more. Every link points to the official developer source.
              </p>
            </div>
            {stats && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Titles", value: stats.total },
                  { label: "Free", value: stats.free },
                  { label: "Verified", value: stats.verified },
                  { label: "Categories", value: stats.categories },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                    <div className="text-xl font-black text-white">{s.value}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              update("q", q);
            }}
            className="mt-6 flex max-w-2xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => update("q", e.target.value)}
                placeholder="Search software (e.g. QGIS, drone mapping, LiDAR...)"
                className="w-full rounded-xl border-0 bg-white py-3 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-400/40"
              />
            </div>
            <button type="submit" className="btn-primary rounded-xl px-6 py-3">Search</button>
          </form>
        </div>
      </section>

      {/* Quick links */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-4 sm:px-6">
          <Link to="/software" className="btn-secondary py-2 text-xs">All Software</Link>
          <Link to="/software/free" className="btn-secondary py-2 text-xs">Free &amp; Open Source</Link>
          <Link to="/software/students" className="btn-secondary py-2 text-xs"><GraduationCap className="h-3.5 w-3.5" /> Student Licenses</Link>
          <Link to="/software/compare" className="btn-secondary py-2 text-xs">Compare Tools</Link>
          <Link to="/software/submit" className="btn-secondary py-2 text-xs">Suggest Software</Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: "Free & open source", value: "free", active: free },
              { label: "Student access", value: "student", active: student },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => update(f.value, f.active ? "" : "true")}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  f.active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-brand-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="mx-1 hidden h-4 w-px bg-gray-200 sm:block" />
          <select
            value={license}
            onChange={(e) => update("license", e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700"
          >
            <option value="">All licenses</option>
            <option value="FREE">FREE</option>
            <option value="OPEN_SOURCE">OPEN SOURCE</option>
            <option value="FREEMIUM">FREEMIUM</option>
            <option value="EDUCATIONAL">EDUCATIONAL</option>
            <option value="TRIAL">TRIAL</option>
            <option value="COMMERCIAL">COMMERCIAL</option>
          </select>
          <select
            value={os}
            onChange={(e) => update("os", e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700"
          >
            <option value="">All platforms</option>
            {OS_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {(q || category || license || os || free || student) && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5" /> Clear all
            </button>
          )}
        </div>

        {loading ? (
          <Loading label="Loading software..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              {data.total} {data.total === 1 ? "title" : "titles"}
              {category && categories.find((c) => c.slug === category) ? ` in ${categories.find((c) => c.slug === category).name}` : ""}
              {q ? ` matching “${q}”` : ""}
            </p>
            {data.items.length === 0 ? (
              <EmptyState title="No software found" body="Try adjusting your search or filters." />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.items.map((s) => (
                  <SoftwareCard key={s.id} s={s} />
                ))}
              </div>
            )}
            <Pagination page={page} totalPages={totalPages} onPage={(p) => update("page", String(p))} />
          </>
        )}
      </div>

      {/* Categories */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
              <p className="mt-1 text-sm text-gray-600">From desktop GIS to drone photogrammetry and GeoAI.</p>
            </div>
            <Link to="/software/categories" className="btn-secondary">
              All categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {categories.slice(0, 14).map((c) => (
              <Link
                key={c.slug}
                to={`/software?category=${c.slug}`}
                className="card group p-4 text-center transition hover:border-brand-400 hover:shadow-md"
              >
                <div className="text-2xl">{c.icon}</div>
                <h3 className="mt-2 text-xs font-semibold text-gray-900 group-hover:text-brand-700">{c.name}</h3>
                <p className="mt-0.5 text-[11px] text-gray-500">{c._count?.software || 0} titles</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why trust */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Official links only", body: "Every title links to the developer's own site or official repository. We host metadata, never installers." },
            { icon: BadgeCheck, title: "Live verification", body: "Download and documentation links are checked with real HTTP requests, and each record shows its verification status." },
            { icon: Download, title: "Access first", body: "Open the official source in one click. Free, open source, student and trial options are clearly labelled." },
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
