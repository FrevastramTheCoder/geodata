import { useEffect, useState } from "react";
import { listDatasets } from "../services/datasetsApi.js";
import { DatasetCard, Loading, ErrorState, EmptyState, Pagination } from "../components/ui.jsx";

function useList(perPage = 18, sort = "newest") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listDatasets({ sort, perPage, page })
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [page, perPage, sort]);

  return { data, loading, error, page, setPage };
}

export default function Latest() {
  const { data, loading, error, page, setPage } = useList();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Latest Datasets</h1>
      <p className="mt-1 text-sm text-gray-600">Newest additions to the catalogue.</p>
      <div className="mt-8">
        {loading ? (
          <Loading label="Loading latest datasets..." />
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
