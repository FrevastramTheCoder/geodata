import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Globe2 } from "lucide-react";
import { getDataSources } from "../services/datasetsApi.js";
import { Loading, ErrorState } from "../components/ui.jsx";

const TYPE_STYLES = {
  Government: "bg-blue-100 text-blue-800",
  International: "bg-purple-100 text-purple-800",
  NGO: "bg-orange-100 text-orange-800",
  Research: "bg-teal-100 text-teal-800",
  Community: "bg-pink-100 text-pink-800",
  Commercial: "bg-gray-100 text-gray-700",
};

export default function Sources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    getDataSources()
      .then((s) => alive && setSources(s))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Loading label="Loading sources..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Data Sources</h1>
      <p className="mt-1 text-sm text-gray-600">
        Official organizations and trusted providers behind every catalogue record.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((s) => (
          <div key={s.slug} className="card flex flex-col p-5 transition hover:border-brand-400 hover:shadow-md">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Globe2 className="h-5 w-5" />
              </div>
              <span className={`badge ${TYPE_STYLES[s.type] || "bg-gray-100 text-gray-700"}`}>
                {s.type}
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-900">{s.name}</h2>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">{s.description}</p>
            <dl className="mt-3 space-y-1 text-xs text-gray-600">
              <div><span className="text-gray-400">Country:</span> {s.country || "—"}</div>
              <div>
                <span className="text-gray-400">Datasets:</span>{" "}
                <Link to={`/explore?source=${s.slug}`} className="font-semibold text-brand-700 hover:underline">
                  {s._count?.datasets || 0}
                </Link>
              </div>
            </dl>
            <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
              <Link to={`/sources/${s.slug}`} className="btn-secondary flex-1 justify-center py-2 text-xs">
                Source profile
              </Link>
              {s.websiteUrl && (
                <a
                  href={s.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 justify-center py-2 text-xs"
                >
                  Official website
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <Link to={`/explore?source=${s.slug}`} className="btn-primary flex-1 justify-center py-2 text-xs">
                Browse datasets
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
