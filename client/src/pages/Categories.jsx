import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDatasetCategories } from "../services/datasetsApi.js";
import { CategoryIcon, Loading, ErrorState } from "../components/ui.jsx";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    getDatasetCategories()
      .then((c) => alive && setCategories(c))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Loading label="Loading categories..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
      <p className="mt-1 text-sm text-gray-600">
        {categories.length} geospatial topics — browse resources by subject.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/explore?category=${c.slug}`}
            className="card group p-5 transition hover:border-brand-400 hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold"
                style={{ backgroundColor: `${c.color}1a`, color: c.color }}
              >
                <CategoryIcon icon={c.icon} className="text-xl" />
              </div>
              <span className="badge bg-gray-100 text-gray-700">
                {c._count?.datasets || 0} datasets
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-900 group-hover:text-brand-700">{c.name}</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
