import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { api } from "../api.js";
import { Loading, VerificationBadge } from "../components/ui.jsx";

const STATUSES = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "BROKEN"];

export default function AdminSoftware() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [verifying, setVerifying] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", officialWebsite: "", downloadUrl: "", description: "" });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ perPage: "200" });
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      setItems(await api.adminSoftware.list(params));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function verify(item) {
    setVerifying((v) => ({ ...v, [item.id]: true }));
    setError("");
    try {
      const r = await api.adminSoftware.verify(item.id);
      setNotice(`${item.name}: ${r.verificationStatus} (${(r.results.official?.code || "?")} official)`);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setVerifying((v) => ({ ...v, [item.id]: false }));
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete "${item.name}" permanently?`)) return;
    try {
      await api.adminSoftware.remove(item.id);
      setNotice(`${item.name} deleted.`);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      await api.adminSoftware.create(form);
      setNotice(`Created "${form.name}" — set status to PUBLISHED and verify links when ready.`);
      setShowForm(false);
      setForm({ name: "", officialWebsite: "", downloadUrl: "", description: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleStatus(item) {
    const next = item.status === "PUBLISHED" ? "PENDING_REVIEW" : "PUBLISHED";
    try {
      await api.adminSoftware.update(item.id, { status: next });
      setNotice(`${item.name} is now ${next}.`);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Software Catalogue</h1>
          <p className="mt-1 text-sm text-gray-600">
            {items.length} of 80 seeded titles. Links verified live per item.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add software
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

      {showForm && (
        <form onSubmit={create} className="card mt-5 grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label className="label">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. SAGA GIS" />
          </div>
          <div>
            <label className="label">Official website *</label>
            <input required type="url" value={form.officialWebsite} onChange={(e) => setForm({ ...form, officialWebsite: e.target.value })} className="input" placeholder="https://..." />
          </div>
          <div>
            <label className="label">Download URL</label>
            <input type="url" value={form.downloadUrl} onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })} className="input" placeholder="https://.../downloads" />
          </div>
          <div>
            <label className="label">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" placeholder="Short description" />
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search name / developer..."
            className="input w-72 pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <button onClick={load} className="btn-secondary"><RotateCcw className="h-4 w-4" /> Refresh</button>
      </div>

      {loading ? (
        <Loading label="Loading software..." />
      ) : (
        <div className="card mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3">Software</th>
                <th className="px-4 py-3">License</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      <Link to={`/software/${s.slug}`} className="hover:text-brand-700">{s.name}</Link>
                    </div>
                    <div className="text-xs text-gray-400">{s.developer?.name || "—"} · {s.category?.name || "uncategorised"}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-600">{s.licenseType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(s)} className="badge bg-brand-50 text-brand-700 transition hover:bg-brand-100" title="Click to toggle published">
                      {s.status.replace(/_/g, " ")}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <VerificationBadge status={s.verificationStatus} />
                    {s.lastVerifiedAt && <div className="mt-0.5 text-[10px] text-gray-400">{new Date(s.lastVerifiedAt).toLocaleDateString()}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.views}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => verify(s)}
                        disabled={verifying[s.id]}
                        className="btn-secondary px-3 py-1.5 text-xs"
                      >
                        {verifying[s.id] ? "Checking…" : "Verify links"}
                      </button>
                      <a href={s.officialWebsite} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:border-brand-400 hover:text-brand-700" title="Open official site">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button onClick={() => remove(s)} className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:border-red-400 hover:text-red-600" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}