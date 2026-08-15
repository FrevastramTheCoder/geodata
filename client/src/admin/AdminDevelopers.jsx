import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../api.js";
import { Loading } from "../components/ui.jsx";

export default function AdminDevelopers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", website: "", description: "" });

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await api.adminSoftware.developers());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(d) {
    setEditing(d);
    setForm({ name: d.name, slug: d.slug, website: d.website || "", description: d.description || "" });
  }

  function startNew() {
    setEditing({ id: null });
    setForm({ name: "", slug: "", website: "", description: "" });
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      if (editing?.id) {
        await api.adminSoftware.updateDeveloper(editing.id, form);
        setNotice("Developer updated.");
      } else {
        await api.adminSoftware.createDeveloper(form);
        setNotice("Developer added.");
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(d) {
    if (!window.confirm(`Delete developer "${d.name}"? Their ${d._count?.software || 0} titles become orphaned.`)) return;
    try {
      await api.adminSoftware.removeDeveloper(d.id);
      setNotice(`"${d.name}" deleted.`);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <Loading label="Loading developers..." />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Software Developers</h1>
          <p className="mt-1 text-sm text-gray-600">69 organisations behind the catalogue titles.</p>
        </div>
        <button onClick={startNew} className="btn-primary"><Plus className="h-4 w-4" /> New developer</button>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

      {editing && (
        <form onSubmit={save} className="card mt-5 grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label className="label">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Slug</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" placeholder="auto from name" />
          </div>
          <div>
            <label className="label">Website</label>
            <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className="btn-primary">{editing.id ? "Save" : "Create"}</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3">Developer</th>
              <th className="px-4 py-3">Titles</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{d.name}</div>
                  <div className="text-xs text-gray-400">{d.description || ""}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{d._count?.software || 0}</td>
                <td className="px-4 py-3 text-xs text-brand-700">{d.website || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => startEdit(d)} className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:border-brand-400 hover:text-brand-700"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => remove(d)} className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:border-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}