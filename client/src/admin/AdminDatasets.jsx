import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ExternalLink, Link2, Pencil, Search, Trash2 } from "lucide-react";
import { api, datasetUrl } from "../api.js";
import { Loading, Pagination, StatusBadge } from "../components/ui.jsx";

const STATUSES = [
  "ALL",
  "PUBLISHED",
  "APPROVED",
  "PENDING_REVIEW",
  "DISCOVERED",
  "REJECTED",
  "BROKEN_LINK",
  "ARCHIVED",
];

const STATUS_COLORS = {
  PUBLISHED: "bg-green-100 text-green-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  DISCOVERED: "bg-sky-100 text-sky-800",
  REJECTED: "bg-red-100 text-red-800",
  BROKEN_LINK: "bg-red-100 text-red-800",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

const EDITABLE = [
  "name",
  "description",
  "coverage",
  "country",
  "region",
  "year",
  "dataType",
  "format",
  "resolution",
  "crs",
  "license",
  "accessType",
  "officialUrl",
  "directUrl",
];

function EditModal({ dataset, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const f = {};
    for (const k of EDITABLE) f[k] = dataset[k] ?? "";
    return f;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = { ...form };
      body.year = body.year ? Number(body.year) : null;
      await api.patch(`/admin/datasets/${dataset.id}`, body);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12">
      <form onSubmit={save} className="card w-full max-w-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900">Edit dataset</h2>
        <p className="mt-0.5 text-xs text-gray-500">{dataset.id}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {EDITABLE.map((k) =>
            k === "description" ? (
              <div key={k} className="sm:col-span-2">
                <label className="label" htmlFor={k}>{k}</label>
                <textarea id={k} rows={3} value={form[k]} onChange={(e) => update(k, e.target.value)} className="input resize-y" />
              </div>
            ) : k === "accessType" ? (
              <div key={k}>
                <label className="label" htmlFor={k}>{k}</label>
                <select id={k} value={form[k]} onChange={(e) => update(k, e.target.value)} className="input">
                  <option value="Free">Free</option>
                  <option value="Restricted">Restricted</option>
                </select>
              </div>
            ) : (
              <div key={k}>
                <label className="label" htmlFor={k}>{k}</label>
                <input
                  id={k}
                  value={form[k]}
                  onChange={(e) => update(k, e.target.value)}
                  className="input"
                  placeholder={k === "year" ? "e.g. 2022" : ""}
                />
              </div>
            ),
          )}
        </div>
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminDatasets() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "ALL";
  const q = params.get("q") || "";
  const page = Number(params.get("page")) || 1;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [searchInput, setSearchInput] = useState(q);
  const [flash, setFlash] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ page: String(page), perPage: "25" });
    if (status !== "ALL") query.set("status", status);
    if (q) query.set("q", q);
    api
      .get(`/admin/datasets?${query.toString()}`)
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, q, page]);

  useEffect(() => {
    load();
  }, [load]);

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  }

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

  async function verifyLink(d) {
    try {
      const r = await api.post(`/admin/datasets/${d.id}/verify-link`);
      setFlash(`"${d.name}" → ${r.reachable ? "reachable" : "NOT reachable"} (${r.httpStatus})`);
      setTimeout(() => setFlash(""), 4000);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
          <p className="mt-1 text-sm text-gray-600">{data?.total ?? "—"} records</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", searchInput.trim());
          }}
          className="flex gap-2"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name..."
              className="input pl-9"
            />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      {flash && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{flash}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setParam("status", s === "ALL" ? "" : s)}
            className={`badge ${
              status === s ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {s === "ALL" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading label="Loading datasets..." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Dataset</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).map((d) => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="max-w-[260px] px-4 py-3">
                    <Link
                      to={datasetUrl(d)}
                      className="font-semibold text-gray-900 hover:text-brand-700"
                    >
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.source?.shortName || d.source?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{d.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{d.year || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[d.status] || "bg-gray-100 text-gray-600"}`}>
                      {d.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.lastVerified ? new Date(d.lastVerified).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <select
                        value={d.status}
                        onChange={(e) => setStatus(d, e.target.value)}
                        className="input w-auto py-1.5 text-xs"
                        aria-label="Change status"
                      >
                        {STATUSES.slice(1).map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => verifyLink(d)}
                        className="rounded-lg border border-gray-300 p-1.5 text-gray-600 hover:border-brand-500 hover:text-brand-700"
                        title="Verify link"
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditing(d)}
                        className="rounded-lg border border-gray-300 p-1.5 text-gray-600 hover:border-brand-500 hover:text-brand-700"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <a
                        href={d.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-gray-300 p-1.5 text-gray-600 hover:border-brand-500 hover:text-brand-700"
                        title="Open official source"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      {d.status !== "ARCHIVED" && (
                        <button
                          onClick={() => setStatus(d, "ARCHIVED")}
                          className="rounded-lg border border-gray-300 p-1.5 text-gray-400 hover:border-red-400 hover:text-red-600"
                          title="Archive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!data || data.items.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                    No datasets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={data.page} totalPages={data.totalPages} onPage={(p) => setParam("page", String(p))} />
        </div>
      )}

      {editing && (
        <EditModal dataset={editing} onClose={() => setEditing(null)} onSaved={() => load()} />
      )}
    </div>
  );
}
