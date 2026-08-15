import { useEffect, useState } from "react";
import { listDatasets } from "../services/datasetsApi.js";
import { DatasetCard, Loading, ErrorState, EmptyState, Pagination } from "../components/ui.jsx";

export default function Popular() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listDatasets({ sort: "popular", perPage: 18, page })
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Popular Datasets</h1>
      <p className="mt-1 text-sm text-gray-600">Most requested geospatial resources.</p>
      <div className="mt-8">
        {loading ? (
          <Loading label="Loading popular datasets..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((d) => (
                <DatasetCard key={d.id} d={d} />
              ))}
            </div>
            <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
