import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Globe2,
  Landmark,
  MapPin,
} from "lucide-react";
import { getBoundaryTree, getDataSources, listDatasets } from "../services/datasetsApi.js";
import { DatasetCard, ErrorState, Loading } from "../components/ui.jsx";

export default function SourceDetail() {
  const { slug } = useParams();
  const [source, setSource] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    Promise.all([getDataSources(), listDatasets({ source: slug, perPage: 9 })])
      .then(([sources, d]) => {
        if (!alive) return;
        const s = sources.find((x) => x.slug === slug);
        if (!s) return setError("Source not found.");
        setSource(s);
        setDatasets(d.items || []);
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (source?.slug !== "nbs") return;
    let alive = true;
    const root = getBoundaryTree()[0];
    if (alive) setRegions(root?.children || []);
    return () => {
      alive = false;
    };
  }, [source]);

  if (loading) return <Loading label="Loading source..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!source) return null;

  const isNbs = source.slug === "nbs";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/sources" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> All sources
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Globe2 className="h-7 w-7" />
                </span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{source.name}</h1>
                  <p className="text-sm text-gray-600">
                    {source.type} · {source.country || "International"}
                  </p>
                </div>
              </div>
              {source.websiteUrl && (
                <a
                  href={source.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Official website
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-700">{source.description}</p>
          </div>

          {isNbs && (
            <div className="card mt-5 border-brand-200 bg-brand-50/50 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Landmark className="h-5 w-5 text-brand-700" /> Administrative boundaries
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                The NBS census geography for Tanzania — {regions.length} regions
                (2022 census administrative structure) are catalogued in the hub,
                each linking back to the official NBS shapefile source. Districts,
                wards, villages and enumeration areas are downloaded directly from
                the NBS shapefile pages.
              </p>
              {regions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {regions.slice(0, 18).map((r) => (
                    <Link
                      key={r.id}
                      to="/boundaries"
                      className="badge bg-white text-brand-800 ring-1 ring-brand-200 transition hover:bg-brand-100"
                    >
                      <MapPin className="mr-1 inline h-3 w-3" /> {r.name}
                    </Link>
                  ))}
                  <Link to="/boundaries" className="badge bg-brand-700 text-white transition hover:bg-brand-800">
                    Explore all →
                  </Link>
                </div>
              )}
              <div className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                <a
                  href="https://www.nbs.go.tz/statistics/geographic-information-system-gis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 transition hover:border-brand-400"
                >
                  <ExternalLink className="h-4 w-4 text-brand-600" /> NBS GIS overview page
                </a>
                <a
                  href="https://www.nbs.go.tz/statistics/topic/gis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 transition hover:border-brand-400"
                >
                  <ExternalLink className="h-4 w-4 text-brand-600" /> NBS shapefiles page
                </a>
              </div>
            </div>
          )}

          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Datasets from this source</h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  {datasets.length > 0 ? `${source._count?.datasets || 0} in the catalogue.` : "No catalogue records yet."}
                </p>
              </div>
              <Link to={`/explore?source=${slug}`} className="btn-secondary">
                Browse all
              </Link>
            </div>
            {datasets.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {datasets.map((d) => (
                  <DatasetCard key={d.id} d={d} />
                ))}
              </div>
            ) : (
              <p className="card p-8 text-center text-sm text-gray-500">
                No datasets from this source yet.
              </p>
            )}
          </section>
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-20">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">Source details</h3>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-gray-400">Type</dt>
              <dd className="font-medium text-gray-900">{source.type}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-gray-400">Country</dt>
              <dd className="font-medium text-gray-900">{source.country || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-gray-400">Datasets</dt>
              <dd className="font-medium text-gray-900">{source._count?.datasets || 0}</dd>
            </div>
            {isNbs && (
              <div className="flex justify-between gap-2">
                <dt className="text-gray-400">Boundary areas</dt>
                <dd className="font-medium text-gray-900">{regions.length + 1} (country + regions)</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
            <Link to="/boundaries" className="btn-primary justify-center">
              <MapPin className="h-4 w-4" />
              Boundary catalogue
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
