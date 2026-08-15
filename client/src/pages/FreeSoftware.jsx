import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeDollarSign, BookOpen, Heart } from "lucide-react";
import { getSoftwareStats, listSoftware } from "../services/softwareApi.js";
import { SoftwareCard, Loading, ErrorState, EmptyState } from "../components/ui.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

export default function FreeSoftware() {
  usePageMeta("Free & Open Source Software", "GIS, remote sensing and geospatial software that is free — no licence fees.");
  const [items, setItems] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      listSoftware({ free: "true", sort: "popular", perPage: 60 }),
      Promise.resolve(getSoftwareStats()),
    ])
      .then(([d, s]) => {
        if (!alive) return;
        setItems(d.items || []);
        setStats(s);
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  if (!items && !error) return <Loading label="Loading free software..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const openSource = (items || []).filter((i) => i.licenseType === "OPEN_SOURCE");
  const free = (items || []).filter((i) => i.licenseType === "FREE");

  return (
    <div>
      <section className="bg-brand-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20">
            <Heart className="h-3.5 w-3.5" /> No licence fees
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Free &amp; Open Source Software</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">
            {stats?.free || 0} titles you can download and use without paying a licence fee —
            open source projects and genuinely free offerings from established developers.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <BadgeDollarSign className="h-6 w-6" />
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-gray-600">
            Some titles marked free offer free community editions while charging for pro
            features — check the official site for the exact terms. The hub always links to
            the developer's own download page.
          </p>
        </div>

        <div className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Open source ({openSource.length})</h2>
              <p className="mt-1 text-sm text-gray-600">Source-available projects you can also inspect and extend.</p>
            </div>
          </div>
          {openSource.length === 0 ? (
            <EmptyState title="No open source titles" body="Check back soon." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {openSource.map((s) => (
                <SoftwareCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Free to use ({free.length})</h2>
              <p className="mt-1 text-sm text-gray-600">Genuinely free offerings from commercial developers.</p>
            </div>
          </div>
          {free.length === 0 ? (
            <EmptyState title="No free titles" body="Check back soon." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {free.map((s) => (
                <SoftwareCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Link to="/software/students" className="card group p-6 transition hover:border-brand-400">
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 group-hover:text-brand-700">
              Student licences <ArrowRight className="h-4 w-4" />
            </h3>
            <p className="mt-1.5 text-sm text-gray-600">Popular commercial tools with free student access.</p>
          </Link>
          <Link to="/software" className="card group p-6 transition hover:border-brand-400">
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 group-hover:text-brand-700">
              <BookOpen className="h-4 w-4" /> Browse the full catalogue <ArrowRight className="h-4 w-4" />
            </h3>
            <p className="mt-1.5 text-sm text-gray-600">All 80+ titles, including commercial and trial options.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
