import { useEffect, useState } from "react";
import { Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { api } from "../api.js";
import { Loading } from "../components/ui.jsx";

const LEVELS = ["GLOBAL", "COUNTRY", "REGION", "DISTRICT", "COUNCIL", "WARD", "SHEHIA", "VILLAGE", "MTAA", "SUB_WARD", "HAMLET", "ENUMERATION_AREA"];
const STATUSES = ["VERIFIED", "REQUEST_REQUIRED", "UNKNOWN"];
const EMPTY = { name: "", officialName: "", code: "", level: "REGION", parentId: null, country: "Tanzania", region: "", district: "", ward: "", sourceUrl: "", accessUrl: "", year: 2022, version: "", status: "VERIFIED" };

export default function AdminBoundaries() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (level) params.set("level", level);
      const res = await api.get(`/admin/boundaries?${params}`);
      setItems(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(id, name) {
    if (!window.confirm(`Delete "${name}"? Areas with children cannot be deleted.`)) return;
    try {
      await api.delete(`/admin/boundaries/${id}`);
      setNotice(`Deleted "${name}".`);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const body = { ...editing, year: editing.year ? Number(editing.year) : null };
      delete body.sourceSlug;
      if (!body.id && !body.sourceId) {
        const sources = await api.get("/admin/sources");
        const nbs = sources.find((s) => s.slug === "nbs");
        if (nbs) body.sourceId = nbs.id;
      }
      if (editing.id) {
        await api.patch(`/admin/boundaries/${editing.id}`, body);
        setNotice("Area updated.");
      } else {
        await api.post("/admin/boundaries", body);
        setNotice("Area created.");
      }
      setEditing(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrative Areas</h1>
          <p className="mt-1 text-sm text-gray-600">{items.length} matching areas (max 200 shown).</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> New area
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search name or code..."
            className="input pl-9"
          />
        </div>
        <select value={level} onChange={(e) => { setLevel(e.target.value); }} className="input">
          <option value="">All levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <button onClick={load} className="btn-secondary">
          <RefreshCw className="h-4 w-4" /> Apply
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

      {loading ? (
        <Loading label="Loading areas..." />
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Children</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {a.name}
                    <div className="text-xs text-gray-400">{a.country}{a.region ? ` · ${a.region}` : ""}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.code || "—"}</td>
                  <td className="px-4 py-3"><span className="badge bg-gray-100 text-gray-700">{a.level}</span></td>
                  <td className="px-4 py-3">
                    <span className={`badge ${a.status === "VERIFIED" ? "bg-green-100 text-green-800" : a.status === "REQUEST_REQUIRED" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.year || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{a._count?.children || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditing({ ...a })}
                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-brand-400 hover:text-brand-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(a.id, a.name)}
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        title="Delete (blocked if it has children)"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-500">No areas found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !saving && setEditing(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900">
              {editing.id ? `Edit: ${editing.name}` : "New administrative area"}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-gray-600">
                Name *
                <input className="input mt-1" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-gray-600">
                Official name
                <input className="input mt-1" value={editing.officialName || ""} onChange={(e) => setEditing({ ...editing, officialName: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-gray-600">
                Code
                <input className="input mt-1" value={editing.code || ""} onChange={(e) => setEditing({ ...editing, code: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-gray-600">
                Level *
                <select className="input mt-1" value={editing.level || ""} onChange={(e) => setEditing({ ...editing, level: e.target.value })}>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-gray-600">
                Country
                <input className="input mt-1" value={editing.country || ""} onChange={(e) => setEditing({ ...editing, country: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-gray-600">
                Status
                <select className="input mt-1" value={editing.status || "VERIFIED"} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-gray-600">
                Year
                <input type="number" className="input mt-1" value={editing.year ?? ""} onChange={(e) => setEditing({ ...editing, year: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-gray-600">
                Version
                <input className="input mt-1" value={editing.version || ""} onChange={(e) => setEditing({ ...editing, version: e.target.value })} />
              </label>
              <label className="col-span-full text-xs font-semibold text-gray-600">
                Official access URL
                <input className="input mt-1" value={editing.accessUrl || ""} onChange={(e) => setEditing({ ...editing, accessUrl: e.target.value })} />
              </label>
              <label className="col-span-full text-xs font-semibold text-gray-600">
                Origin page URL
                <input className="input mt-1" value={editing.sourceUrl || ""} onChange={(e) => setEditing({ ...editing, sourceUrl: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-gray-600">
                Parent ID (null = root)
                <input className="input mt-1" value={editing.parentId || ""} onChange={(e) => setEditing({ ...editing, parentId: e.target.value || null })} />
              </label>
              <p className="flex items-end text-xs text-gray-500">
                Source is fixed to NBS for boundary areas.
              </p>
            </div>
            {error && <p className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-700">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-secondary" disabled={saving} onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" disabled={saving} onClick={save}>
                {saving ? "Saving..." : editing.id ? "Save changes" : "Create area"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}