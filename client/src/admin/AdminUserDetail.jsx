import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, ShieldCheck, Trash2, User as UserIcon } from "lucide-react";

import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Loading } from "../components/ui.jsx";

function canManage(actor, target) {
  return actor && actor.id !== target.id && target.role !== "SUPER_ADMIN" && (actor.role === "SUPER_ADMIN" || target.role === "USER");
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: actor } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try { setData(await api.get(`/admin/users/${id}`)); } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [id]);

  async function setStatus(status) {
    const label = status === "DELETED" ? "delete" : status === "SUSPENDED" ? "suspend" : "activate";
    if (!window.confirm(`${label[0].toUpperCase()}${label.slice(1)} ${data.user.name}?`)) return;
    try { await api.patch(`/admin/users/${id}/status`, { status }); await load(); } catch (e) { setError(e.message); }
  }

  if (error && !data) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  if (!data) return <Loading label="Loading user profile..." />;
  const manageable = canManage(actor, data.user);

  return (
    <div>
      <Link to="/admin/users" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Back to users</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {data.user.avatarUrl ? <img src={data.user.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700"><UserIcon className="h-7 w-7" /></span>}
          <div><h1 className="text-2xl font-bold text-gray-900">{data.user.name}</h1><p className="text-sm text-gray-600">{data.user.email}</p><div className="mt-2 flex gap-2"><span className="badge bg-purple-100 text-purple-800">{data.user.role}</span><span className="badge bg-gray-100 text-gray-700">{data.user.status}</span></div></div>
        </div>
        {manageable && <div className="flex flex-wrap gap-2">
          {data.user.status === "ACTIVE" && <button onClick={() => setStatus("SUSPENDED")} className="btn-secondary text-amber-700">Suspend</button>}
          {data.user.status === "SUSPENDED" && <button onClick={() => setStatus("ACTIVE")} className="btn-secondary text-green-700"><ShieldCheck className="h-4 w-4" /> Activate</button>}
          {data.user.status !== "DELETED" && <button onClick={() => setStatus("DELETED")} className="btn-secondary text-red-700"><Trash2 className="h-4 w-4" /> Delete</button>}
        </div>}
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <Info label="Created" value={new Date(data.user.createdAt).toLocaleString()} />
        <Info label="Last login" value={data.user.lastLoginAt ? new Date(data.user.lastLoginAt).toLocaleString() : "Never"} />
        <Info label="Updated" value={new Date(data.user.updatedAt).toLocaleString()} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="card p-5"><h2 className="font-bold text-gray-900">Submitted datasets</h2><div className="mt-3 space-y-2">{data.submissions.map((item) => <div key={item.id} className="rounded-lg bg-gray-50 p-3"><div className="font-medium text-gray-900">{item.name}</div><div className="mt-1 text-xs text-gray-500">{item.status} · {new Date(item.createdAt).toLocaleDateString()}</div></div>)}{!data.submissions.length && <p className="text-sm text-gray-500">No submissions.</p>}</div></section>
        <section className="card p-5"><h2 className="font-bold text-gray-900">Favorites</h2><div className="mt-3 space-y-2">{data.favorites.map((item) => <div key={item.id} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">{item.dataset?.name || item.software?.name || item.opportunity?.title || item.resourceId}</div>)}{!data.favorites.length && <p className="text-sm text-gray-500">No saved resources.</p>}</div></section>
        <section className="card p-5"><h2 className="font-bold text-gray-900">Recently viewed</h2><div className="mt-3 space-y-2">{data.recentlyViewed.slice(0, 10).map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm"><span>{item.dataset?.name || item.software?.name || item.resourceId}</span><span className="text-xs text-gray-400">{new Date(item.viewedAt).toLocaleDateString()}</span></div>)}{!data.recentlyViewed.length && <p className="text-sm text-gray-500">No recent views.</p>}</div></section>
        <section className="card p-5"><h2 className="font-bold text-gray-900">Recent activity</h2><div className="mt-3 max-h-80 space-y-2 overflow-y-auto">{data.activity.slice(0, 20).map((item) => <div key={item.id} className="flex items-start gap-2 border-b border-gray-100 pb-2 text-sm"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><div><div className="font-medium text-gray-800">{item.action.replace(/_/g, " ")}</div><div className="text-xs text-gray-500">{item.resourceId || item.resourceType || "Account"} · {new Date(item.createdAt).toLocaleString()}</div></div></div>)}{!data.activity.length && <p className="text-sm text-gray-500">No activity recorded.</p>}</div></section>
      </div>
      <button className="mt-6 text-sm font-medium text-gray-500 hover:text-brand-700" onClick={() => navigate("/admin/users")}>Return to user list</button>
    </div>
  );
}

function Info({ label, value }) {
  return <div className="card p-4"><div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</div><div className="mt-1 text-sm text-gray-800">{value}</div></div>;
}
