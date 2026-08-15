import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSoftwareCategories, listSoftware } from "../services/softwareApi.js";
import { SoftwareCard, Loading, ErrorState, EmptyState } from "../components/ui.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

export default function SoftwareCategoryDetail() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    Promise.all([Promise.resolve(getSoftwareCategories()), listSoftware({ category: slug, perPage: 100, sort: "popular" })])
      .then(([cats, data]) => {
        if (!alive) return;
        const found = cats.find((c) => c.slug === slug);
        if (!found) {
          setError("Category not found");
          return;
        }
        setCategory(found);
        setItems(data.items || []);
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  usePageMeta(
    category ? `${category.name} Software` : "Software Category",
    category ? `${category.description || `${category.name} software`} — GEO SOFTWARE HUB.` : undefined
  );

  if (loading) return <Loading label="Loading category..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-4 text-xs text-gray-500">
        <Link to="/software" className="hover:text-brand-700">Software</Link>
        <span className="mx-1.5">/</span>
        <Link to="/software/categories" className="hover:text-brand-700">Categories</Link>
        <span className="mx-1.5">/</span>
        <span className="font-semibold text-gray-900">{category.name}</span>
      </nav>

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-3xl">
          {category.icon}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">{category.name}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-gray-600">
            {category.description || "Curated geospatial software in this category."}
          </p>
          <p className="mt-2 text-xs font-medium text-gray-500">{items.length} titles · official links only</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No software in this category yet" body="Check back soon — new titles are added continuously." />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((s) => (
            <SoftwareCard key={s.id} s={s} />
          ))}
        </div>
      )}
    </div>
  );
}
