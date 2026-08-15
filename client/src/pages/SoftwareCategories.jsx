import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import { getSoftwareCategories } from "../services/softwareApi.js";
import { Loading, ErrorState } from "../components/ui.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

export default function SoftwareCategories() {
  usePageMeta("Software Categories", "Browse the GEO SOFTWARE HUB catalogue by category — GIS, remote sensing, CAD & BIM, surveying, GeoAI and more.");
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.resolve(getSoftwareCategories())
      .then((c) => alive && setCategories(c))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  if (!categories && !error) return <Loading label="Loading categories..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <span className="badge bg-brand-50 text-brand-700"><Layers className="h-3.5 w-3.5" /> GEO SOFTWARE HUB</span>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900">Software Categories</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Every category is curated from official developer sources. Titles marked
        <span className="mx-1 font-semibold text-green-700">VERIFIED</span>have had their links checked live.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/software/categories/${c.slug}`}
            className="card group p-6 transition hover:border-brand-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="text-3xl">{c.icon}</div>
              <span className="badge bg-brand-50 text-brand-700">{c._count?.software || 0} titles</span>
            </div>
            <h2 className="mt-3 text-base font-bold text-gray-900 group-hover:text-brand-700">{c.name}</h2>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600">
              {c.description || "Curated geospatial software."}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
              Browse category <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
