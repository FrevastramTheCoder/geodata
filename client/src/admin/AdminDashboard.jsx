import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Globe2,
  Layers,
  SearchX,
  Users,
  GraduationCap,
  MessageSquare,
  Award,
} from "lucide-react";
import { api } from "../api.js";
import BrandLogo from "../components/BrandLogo.jsx";
import { Loading } from "../components/ui.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api
      .get("/admin/stats")
      .then((s) => alive && setStats(s))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Loading label="Loading dashboard..." />;

  const cards = stats
    ? [
        { label: "Total datasets", value: stats.total, icon: Database, to: "/admin/datasets", color: "bg-brand-50 text-brand-700" },
        { label: "Published", value: stats.PUBLISHED || 0, icon: CheckCircle2, to: "/admin/datasets?status=PUBLISHED", color: "bg-green-50 text-green-700" },
        { label: "Pending review", value: (stats.PENDING_REVIEW || 0) + (stats.DISCOVERED || 0), icon: Clock, to: "/admin/review", color: "bg-amber-50 text-amber-700" },
        { label: "Broken links", value: stats.BROKEN_LINK || 0, icon: AlertTriangle, to: "/admin/datasets?status=BROKEN_LINK", color: "bg-red-50 text-red-700" },
        { label: "Approved", value: stats.APPROVED || 0, icon: CheckCircle2, to: "/admin/datasets?status=APPROVED", color: "bg-emerald-50 text-emerald-700" },
        { label: "Rejected", value: stats.REJECTED || 0, icon: SearchX, to: "/admin/datasets?status=REJECTED", color: "bg-red-50 text-red-700" },
        { label: "Total users", value: stats.totalUsers || 0, icon: Users, to: "/admin/users", color: "bg-sky-50 text-sky-700" },
        { label: "Active users", value: stats.activeUsers || 0, icon: Users, to: "/admin/users?status=ACTIVE", color: "bg-emerald-50 text-emerald-700" },
        { label: "New users this month", value: stats.newUsersThisMonth || 0, icon: Users, to: "/admin/users", color: "bg-indigo-50 text-indigo-700" },
        { label: "Courses", value: stats.totalCourses || 0, icon: GraduationCap, to: "/training", color: "bg-violet-50 text-violet-700" },
        { label: "Certificates issued", value: stats.certificatesIssued || 0, icon: Award, to: "/certificates", color: "bg-amber-50 text-amber-700" },
        { label: "Unread messages", value: stats.contactMessages || 0, icon: MessageSquare, to: "/admin/messages", color: "bg-pink-50 text-pink-700" },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center gap-4">
        <BrandLogo className="h-16 w-16" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GIS & REMOTE SENSING HUB</h1>
          <p className="mt-1 text-sm text-gray-600">Admin dashboard - GeoBrains Academy.</p>
        </div>
      </div>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card flex items-center gap-4 p-5 transition hover:border-brand-400">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color}`}>
              <c.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{c.value.toLocaleString()}</div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">Status breakdown</h2>
          </div>
          <div className="space-y-2">
            {stats &&
              Object.entries(stats)
                .filter(([k]) => k !== "total")
                .map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{k.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${stats.total ? Math.round((v / stats.total) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-semibold text-gray-900">{v}</span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">Quick actions</h2>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/admin/review" className="btn-primary justify-center">Review pending datasets</Link>
            <Link to="/admin/datasets?status=DISCOVERED" className="btn-secondary justify-center">Review discovered records</Link>
            <Link to="/admin/logs" className="btn-secondary justify-center">View ingestion runs</Link>
            <Link to="/" target="_blank" className="btn-secondary justify-center">Open public site</Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Ranked title="Most viewed datasets" items={stats.mostViewedDatasets} valueKey="views" />
        <Ranked title="Most viewed software" items={stats.mostViewedSoftware} valueKey="views" />
        <Ranked title="Most searched keywords" items={stats.mostSearchedKeywords} valueKey="searches" labelKey="keyword" />
      </div>
    </div>
  );
}

function Ranked({ title, items = [], valueKey, labelKey = "name" }) {
  return <div className="card p-5"><h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">{title}</h2><div className="mt-4 space-y-3">{items.map((item, index) => <div key={`${item[labelKey]}-${index}`} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-gray-700">{index + 1}. {item[labelKey]}</span><span className="shrink-0 font-bold text-brand-700">{item[valueKey]}</span></div>)}{!items.length && <p className="text-sm text-gray-500">No activity yet.</p>}</div></div>;
}
