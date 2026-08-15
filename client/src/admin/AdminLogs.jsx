import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Loading } from "../components/ui.jsx";

const LEVEL_STYLES = {
  INFO: "bg-sky-100 text-sky-800",
  WARN: "bg-amber-100 text-amber-800",
  ERROR: "bg-red-100 text-red-800",
};

const RUN_STATUS_STYLES = {
  RUNNING: "bg-sky-100 text-sky-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function AdminLogs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api
      .get("/admin/logs")
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Loading label="Loading logs..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Ingestion logs</h1>
      <p className="mt-1 text-sm text-gray-600">Recent connector runs and log entries.</p>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Runs</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(data?.runs || []).map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-bold text-gray-900">{r.source}</h3>
                <span className={`badge ${RUN_STATUS_STYLES[r.status] || "bg-gray-100 text-gray-600"}`}>{r.status}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(r.startedAt).toLocaleString()}
                {r.finishedAt ? ` → ${new Date(r.finishedAt).toLocaleTimeString()}` : ""}
              </p>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-gray-50 p-2">
                  <div className="text-sm font-bold text-gray-900">{r.discovered}</div>
                  <div className="text-[10px] uppercase text-gray-500">Found</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-2">
                  <div className="text-sm font-bold text-green-700">{r.created}</div>
                  <div className="text-[10px] uppercase text-gray-500">Created</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-2">
                  <div className="text-sm font-bold text-gray-900">{r.duplicates}</div>
                  <div className="text-[10px] uppercase text-gray-500">Duplicates</div>
                </div>
              </dl>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-gray-50 p-2">
                  <div className="text-sm font-bold text-gray-900">{r.updated}</div>
                  <div className="text-[10px] uppercase text-gray-500">Updated</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-2">
                  <div className="text-sm font-bold text-amber-700">{r.brokenLinks}</div>
                  <div className="text-[10px] uppercase text-gray-500">Broken</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-2">
                  <div className="text-sm font-bold text-red-700">{r.parseErrors}</div>
                  <div className="text-[10px] uppercase text-gray-500">Errors</div>
                </div>
              </div>
            </div>
          ))}
          {(data?.runs || []).length === 0 && (
            <p className="text-sm text-gray-500">No ingestion runs yet.</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
          Log entries (latest 200)
        </h2>
        <div className="card divide-y divide-gray-100">
          {(data?.entries || []).map((e) => (
            <div key={e.id} className="flex items-start gap-3 px-4 py-2.5 text-sm">
              <span className={`badge shrink-0 ${LEVEL_STYLES[e.level] || "bg-gray-100 text-gray-600"}`}>{e.level}</span>
              <div className="min-w-0">
                <p className="text-gray-800">{e.message}</p>
                <p className="text-xs text-gray-400">
                  {new Date(e.createdAt).toLocaleString()}
                  {e.dataset?.name ? ` · ${e.dataset.name}` : ""}
                </p>
              </div>
            </div>
          ))}
          {(data?.entries || []).length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No log entries yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}