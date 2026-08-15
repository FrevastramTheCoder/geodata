import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Database,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Globe2,
  Landmark,
  Package,
  Inbox,
  Tags,
  Building2,
  Users,
  MessageSquare,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../auth.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import { Loading } from "../components/ui.jsx";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/datasets", label: "Datasets", icon: Database },
  { to: "/admin/courses", label: "Courses", icon: GraduationCap },
  { to: "/admin/review", label: "Review queue", icon: ClipboardCheck },
  { to: "/admin/sources", label: "Sources", icon: Globe2 },
  { to: "/admin/boundaries", label: "Boundaries", icon: Landmark },
  { to: "/admin/software", label: "Software", icon: Package },
  { to: "/admin/software/submissions", label: "Software submissions", icon: Inbox },
  { to: "/admin/software/categories", label: "Software categories", icon: Tags },
  { to: "/admin/developers", label: "Developers", icon: Building2 },
  { to: "/admin/users", label: "Portal users", icon: Users },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/logs", label: "Ingestion logs", icon: ScrollText },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  if (loading) return <Loading label="Checking administrator session..." />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  async function signOut() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
      <div className="min-h-screen bg-gray-100 lg:flex">
       <aside className="flex w-full flex-col bg-brand-950 text-gray-300 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-60">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
           <BrandLogo className="h-11 w-11 shrink-0" priority />
           <div className="leading-tight">
             <div className="text-sm font-bold text-white">Admin Console</div>
            <div className="text-[11px] text-gray-400">GIS & REMOTE SENSING HUB</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:space-y-1 lg:overflow-y-auto lg:py-4">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                 `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-brand-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
           <button
             onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
       <main className="min-w-0 flex-1 px-4 py-6 lg:ml-60 lg:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
