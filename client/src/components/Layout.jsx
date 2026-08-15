import { useState, useRef, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, User as UserIcon, X, Search } from "lucide-react";
import BrandLogo from "./BrandLogo.jsx";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/training", label: "Academy" },
  { to: "/what-we-do", label: "What We Do" },
  { to: "/labs", label: "GeoBrains Labs" },
  { to: "/projects", label: "Projects" },
  { to: "/data", label: "Data" },
  { to: "/software", label: "Software" },
  { to: "/research", label: "Research" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/community", label: "Community" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact" },
];

const SOFTWARE_LINKS = [
  { to: "/software", label: "All Software" },
  { to: "/software/categories", label: "Categories" },
  { to: "/software/free", label: "Free & Open Source" },
  { to: "/software/students", label: "Student Licenses" },
  { to: "/software/compare", label: "Compare Tools" },
  { to: "/software/submit", label: "Suggest Software" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [swOpen, setSwOpen] = useState(false);
  const swRef = useRef(null);
  const [q, setQ] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e) {
      if (swRef.current && !swRef.current.contains(e.target)) setSwOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setSwOpen(false);
    setOpen(false);
  }, [location.pathname]);

  function submitSearch(e) {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/explore?q=${encodeURIComponent(q.trim())}`);
    setQ("");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
             <BrandLogo className="h-10 w-10 shrink-0" priority />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-xs font-bold text-gray-900 sm:text-base">
                 GIS & REMOTE SENSING HUB
              </span>
               <span className="hidden truncate text-[11px] font-medium text-brand-600 sm:block">
                   Academy · What We Do · Labs
              </span>
           </span>
          </Link>

            <div className="hidden shrink-0 items-center gap-2 lg:flex">
             <form onSubmit={submitSearch} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search geospatial data..."
                className="w-40 rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 2xl:w-48"
              />
            </form>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800 transition hover:bg-brand-100"
            >
              <UserIcon className="h-4 w-4" /> My workspace
             </Link>
           </div>

           <button
             className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
             onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
         </div>

         <nav className="hidden border-t border-gray-100 md:block" aria-label="Primary navigation">
           <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
             <div className="flex min-w-max items-center gap-1 py-2">
               {NAV.map((n) => (
                 <NavLink
                   key={n.to}
                   to={n.to}
                   className={({ isActive }) =>
                     `whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold transition lg:text-sm ${
                       isActive
                         ? "bg-brand-50 text-brand-700"
                         : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                     }`
                   }
                 >
                   {n.label}
                 </NavLink>
               ))}
             </div>
           </div>
         </nav>

         {open && (
            <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
            <form onSubmit={submitSearch} className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search geospatial data..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
              />
            </form>
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <Link
                to="/submit"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2 justify-center"
              >
                Submit Dataset
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                <UserIcon className="h-4 w-4" /> My workspace
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1" key={location.pathname + location.search}>
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-brand-950 text-gray-300">
         <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
          <div>
            <div className="flex items-center gap-2">
               <BrandLogo className="h-14 w-14 shrink-0" />
                <span className="font-bold text-white">GIS & REMOTE SENSING HUB</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
               Prepared by GeoBrains Academy. "From Maps to Intelligence—Shaping a Smarter World." 🌍
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-white" to="/explore">Browse Catalogue</Link></li>
              <li><Link className="hover:text-white" to="/categories">Categories</Link></li>
              <li><Link className="hover:text-white" to="/sources">Data Sources</Link></li>
              <li><Link className="hover:text-white" to="/latest">Latest Datasets</Link></li>
              <li><Link className="hover:text-white" to="/popular">Popular Datasets</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Community
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-white" to="/community">About the community</Link></li>
              <li><Link className="hover:text-white" to="/contact">Contact us</Link></li>
              <li><a className="hover:text-white" href="https://chat.whatsapp.com/CkShg01Jp2a1Anz9UPpwax" target="_blank" rel="noreferrer">Join WhatsApp community</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Coverage
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-white" to="/tanzania">Tanzania</Link></li>
              <li><Link className="hover:text-white" to="/global">Global & Africa</Link></li>
              <li><Link className="hover:text-white" to="/explore?coverage=Zanzibar">Zanzibar</Link></li>
              <li><Link className="hover:text-white" to="/explore?country=Tanzania">Tanzania Mainland</Link></li>
            </ul>
          </div>
           <div>
             <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
               Ecosystem
             </h3>
             <ul className="space-y-2 text-sm">
                <li><Link className="hover:text-white" to="/training">GeoBrains Academy</Link></li>
                <li><Link className="hover:text-white" to="/what-we-do">What We Do</Link></li>
                <li><Link className="hover:text-white" to="/labs">GeoBrains Labs</Link></li>
                <li><Link className="hover:text-white" to="/projects">Projects &amp; Innovation</Link></li>
               <li><Link className="hover:text-white" to="/resources">GeoBrains Resources</Link></li>
               <li><Link className="hover:text-white" to="/opportunities">GeoBrains Opportunities</Link></li>
               <li><Link className="hover:text-white" to="/about">About</Link></li>
               <li><Link className="hover:text-white" to="/submit">Submit a Dataset</Link></li>
               <li><Link className="hover:text-white" to="/sources">Official data sources</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-gray-500">
           © {new Date().getFullYear()} GIS & Remote Sensing Hub - Prepared by GeoBrains Academy - "From Maps to Intelligence—Shaping a Smarter World." 🌍
        </div>
      </footer>
    </div>
  );
}
