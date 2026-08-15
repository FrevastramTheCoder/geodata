import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Play, RefreshCw, X } from "lucide-react";
import { api } from "../api.js";
import { Loading, Pagination, StatusBadge } from "../components/ui.jsx";

const QUEUE_STATUSES = ["PENDING_REVIEW", "DISCOVERED", "BROKEN_LINK"];

export default function AdminReview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [page, setPage] = useState(1);
  const [runs, setRuns] = useState([]);
  const [running, setRunning] = useState(null);

  const load = (p = page) => {
    setLoading(true);
    setError("");
    api
      .get(`/admin/datasets?perPage=20&page=${p}`)
      .then((d) => {
        const q = { items: d.items.filter((i) => QUEUE_STATUSES.includes(i.status)), total: d.items.filter((i) => QUEUE_STATUSES.includes(i.status)).length };
        setData({ ...d, ...q });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api
      .get("/ingest/sources")
      .then((s) => setRuns(s))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(d, next) {
    try {
      await api.patch(`/admin/datasets/${d.id}/status`, { status: next });
      setFlash(`"${d.name}" → ${next}`);
      setTimeout(() => setFlash(""), 3000);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function runIngest(slug) {
    setRunning(slug);
    setFlash(`Running ${slug} connector...`);
    try {
      const r = await api.post(`/ingest/${slug}`);
      setFlash(`${slug}: discovered=${r.discovered} created=${r.created} duplicates=${r.duplicates} broken=${r.brokenLinks}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(null);
      load();
      api
        .get("/ingest/sources")
        .then((s) => setRuns(s))
        .catch(() => {});
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Review queue</h1>
      <p className="mt-1 text-sm text-gray-600">
        Records discovered by connectors and user submissions awaiting approval.
      </p>

      {flash && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{flash}</p>}
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          {loading ? (
            <Loading label="Loading review queue..." />
          ) : data && data.items.length === 0 ? (
            <div className="card p-10 text-center text-sm text-gray-500">
              <p className="text-lg">All clear</p>
              <p className="mt-1">No records awaiting review.</p>
            </div>
          ) : (
            <>
              <div className="card divide-y divide-gray-100">
                {(data?.items || []).map((d) => (
                  <div key={d.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/datasets/${d.slug || d.id}`}
                          target="_blank"
                          className="font-semibold text-gray-900 hover:text-brand-700"
                        >
                          {d.name}
                        </Link>
                        <StatusBadge status={d.status} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600">{d.description || "No description"}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {d.source?.name || "—"} · {d.category?.name || "—"} · {d.coverage || "—"} ·{" "}
                        <a href={d.officialUrl} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                          official source
                        </a>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button onClick={() => setStatus(d, "APPROVED")} className="btn-primary py-1.5 text-xs">
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button onClick={() => setStatus(d, "REJECTED")} className="btn-secondary py-1.5 text-xs text-red-600">
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {data && data.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination page={page} totalPages={data.totalPages} onPage={(p) => { setPage(p); load(p); }} />
                </div>
              )}
            </>
          )}
        </div>

        <aside>
          <div className="card sticky top-6 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-700">
              <RefreshCw className="h-4 w-4" /> Source connectors
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Run a connector to discover new geospatial records (stored as DISCOVERED).
            </p>
            <div className="mt-3 space-y-2">
              {(runs || []).map((s) => (
                <div key={s.slug} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-gray-800">{s.name}</div>
                    <div className="text-[11px] text-gray-500">
                      {s.lastRun
                        ? `${s.lastRun.status} · +${s.lastRun.created} · ${new Date(s.lastRun.startedAt).toLocaleString()}`
                        : "never run"}
                    </div>
                  </div>
                  <button
                    onClick={() => runIngest(s.slug)}
                    disabled={running === s.slug}
                    className="ml-2 shrink-0 rounded-lg border border-brand-200 bg-brand-50 p-1.5 text-brand-700 hover:bg-brand-100 disabled:opacity-50"
                    title={`Run ${s.slug} connector`}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}