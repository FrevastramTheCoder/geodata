import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Search, ShieldCheck, ShieldOff, Trash2, User as UserIcon } from "lucide-react";

import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Loading } from "../components/ui.jsx";

const ROLE_STYLES = {
  USER: "bg-gray-100 text-gray-700",
  ADMIN: "bg-purple-100 text-purple-800",
  SUPER_ADMIN: "bg-red-100 text-red-800",
};
const STATUS_STYLES = {
  ACTIVE: "bg-green-100 text-green-800",
  SUSPENDED: "bg-amber-100 text-amber-800",
  DELETED: "bg-red-100 text-red-800",
};

function canManage(actor, target) {
  if (!actor || actor.id === target.id || target.role === "SUPER_ADMIN") return false;
  return actor.role === "SUPER_ADMIN" || target.role === "USER";
}

export default function AdminUsers() {
  const { user: actor } = useAuth();
  const [result, setResult] = useState({ items: [], totalPages: 1, page: 1, total: 0 });
  const [filters, setFilters] = useState({ q: "", role: "", status: "", from: "", to: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load(page = 1) {
    setLoading(true);
    setError("");
    try {
      const params = { ...filters, page, perPage: 20 };
      Object.keys(params).forEach((key) => { if (!params[key]) delete params[key]; });
      setResult(await api.get(`/admin/users?${new URLSearchParams(params)}`));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(target, status) {
    const label = status === "SUSPENDED" ? "suspend" : status === "ACTIVE" ? "activate" : "delete";
    if (!window.confirm(`Are you sure you want to ${label} ${target.name}?`)) return;
    try {
      await api.patch(`/admin/users/${target.id}/status`, { status });
      setNotice(`${target.name} was ${label}d.`);
      load(result.page);
    } catch (e) {
      setError(e.message);
    }
  }

  async function changeRole(target) {
    const role = target.role === "USER" ? "ADMIN" : "USER";
    if (!window.confirm(`Change ${target.name}'s role to ${role}?`)) return;
    try {
      await api.patch(`/admin/users/${target.id}/role`, { role });
      setNotice(`${target.name}'s role is now ${role}.`);
      load(result.page);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage Google-authenticated portal accounts without exposing OAuth identifiers.</p>
        </div>
        <span className="badge bg-brand-50 text-brand-800">{result.total.toLocaleString()} accounts</span>
      </div>

      <div className="card mt-6 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_150px_140px_140px_auto]">
          <label className="relative">
            <span className="sr-only">Search users</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search name or email" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
          </label>
          <select className="input" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All roles</option><option value="USER">User</option><option value="ADMIN">Admin</option><option value="SUPER_ADMIN">Super admin</option>
          </select>
          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="DELETED">Deleted</option>
          </select>
          <input className="input" type="date" aria-label="Registered from" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          <input className="input" type="date" aria-label="Registered to" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          <button className="btn-primary justify-center" onClick={() => load(1)}>Filter</button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

      {loading ? <Loading label="Loading users..." /> : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead><tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Last login</th><th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {result.items.map((target) => {
                const manageable = canManage(actor, target);
                return <tr key={target.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3">
                    {target.avatarUrl ? <img src={target.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700"><UserIcon className="h-4 w-4" /></span>}
                    <div><div className="font-medium text-gray-900">{target.name}</div><div className="text-xs text-gray-400">{target.email}</div></div>
                  </div></td>
                  <td className="px-4 py-3"><span className={`badge ${ROLE_STYLES[target.role] || ROLE_STYLES.USER}`}>{target.role.replace(/_/g, " ")}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${STATUS_STYLES[target.status] || STATUS_STYLES.ACTIVE}`}>{target.status}</span></td>
                  <td className="px-4 py-3 text-gray-600">{new Date(target.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600">{target.lastLoginAt ? new Date(target.lastLoginAt).toLocaleString() : "-"}</td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1.5">
                    <Link to={`/admin/users/${target.id}`} className="btn-secondary px-2.5 py-1.5 text-xs" title="View user"><Eye className="h-3.5 w-3.5" /> View</Link>
                    {manageable && target.status === "ACTIVE" && <button onClick={() => updateStatus(target, "SUSPENDED")} className="rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"><ShieldOff className="inline h-3.5 w-3.5" /> Suspend</button>}
                    {manageable && target.status === "SUSPENDED" && <button onClick={() => updateStatus(target, "ACTIVE")} className="rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"><ShieldCheck className="inline h-3.5 w-3.5" /> Activate</button>}
                    {actor?.role === "SUPER_ADMIN" && manageable && target.status !== "DELETED" && <button onClick={() => changeRole(target)} className="rounded-lg border border-purple-200 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">Role</button>}
                    {manageable && target.status !== "DELETED" && <button onClick={() => updateStatus(target, "DELETED")} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50" title="Delete user"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </div></td>
                </tr>;
              })}
              {!result.items.length && <tr><td colSpan="6" className="px-4 py-12 text-center text-gray-500">No users match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && result.totalPages > 1 && <div className="mt-5 flex items-center justify-between text-sm text-gray-600"><span>Page {result.page} of {result.totalPages}</span><div className="flex gap-2"><button className="btn-secondary py-2 text-xs" disabled={result.page <= 1} onClick={() => load(result.page - 1)}>Previous</button><button className="btn-secondary py-2 text-xs" disabled={result.page >= result.totalPages} onClick={() => load(result.page + 1)}>Next</button></div></div>}
    </div>
  );
}
