import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../api.js";
import { Loading } from "../components/ui.jsx";

export default function AdminSoftwareCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "", sortOrder: 0 });

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await api.adminSoftware.categories());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(c) {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description || "", icon: c.icon || "", sortOrder: c.sortOrder || 0 });
  }

  function startNew() {
    setEditing({ id: null });
    setForm({ name: "", slug: "", description: "", icon: "", sortOrder: 0 });
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      if (editing?.id) {
        await api.adminSoftware.updateCategory(editing.id, form);
        setNotice("Category updated.");
      } else {
        await api.adminSoftware.createCategory(form);
        setNotice("Category created.");
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(c) {
    if (!window.confirm(`Delete category "${c.name}"? Its ${c._count?.software || 0} titles become uncategorised.`)) return;
    try {
      await api.adminSoftware.removeCategory(c.id);
      setNotice(`"${c.name}" deleted.`);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <Loading label="Loading categories..." />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Software Categories</h1>
          <p className="mt-1 text-sm text-gray-600">14 categories drive the /software/categories pages.</p>
        </div>
        <button onClick={startNew} className="btn-primary"><Plus className="h-4 w-4" /> New category</button>
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
            <label className="label">Slug *</label>
            <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" placeholder="gis-software" />
          </div>
          <div>
            <label className="label">Icon (emoji)</label>
            <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input" placeholder="🗺️" />
          </div>
          <div>
            <label className="label">Sort order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input resize-y" />
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
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Titles</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        <Link to={`/software/categories/${c.slug}`} className="hover:text-brand-700">{c.name}</Link>
                      </div>
                      <div className="text-xs text-gray-400">{c.description || ""}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{c.slug}</td>
                <td className="px-4 py-3 text-gray-600">{c._count?.software || 0}</td>
                <td className="px-4 py-3 text-gray-600">{c.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => startEdit(c)} className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:border-brand-400 hover:text-brand-700"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => remove(c)} className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:border-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
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