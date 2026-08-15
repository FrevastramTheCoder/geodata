import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Loading } from "../components/ui.jsx";

const TYPE_STYLES = {
  Government: "bg-blue-100 text-blue-800",
  International: "bg-purple-100 text-purple-800",
  NGO: "bg-orange-100 text-orange-800",
  Research: "bg-teal-100 text-teal-800",
  Community: "bg-pink-100 text-pink-800",
  Commercial: "bg-gray-100 text-gray-700",
};

export default function AdminSources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api
      .get("/admin/sources")
      .then((s) => alive && setSources(s))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Loading label="Loading sources..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Sources</h1>
      <p className="mt-1 text-sm text-gray-600">{sources.length} registered source organizations.</p>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sources.map((s) => (
          <div key={s.slug} className="card p-5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h2 className="text-sm font-bold text-gray-900">{s.name}</h2>
              <span className={`badge ${TYPE_STYLES[s.type] || "bg-gray-100 text-gray-700"}`}>{s.type}</span>
            </div>
            <p className="text-xs text-gray-500">{s.country} · {s.slug}</p>
            <p className="mt-2 line-clamp-3 text-sm text-gray-600">{s.description}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
              <div><span className="text-gray-400">Datasets:</span> <strong>{s._count?.datasets || 0}</strong></div>
              <div>
                <span className="text-gray-400">Website:</span>{" "}
                {s.websiteUrl ? (
                  <a href={s.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                    open
                  </a>
                ) : "—"}
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}