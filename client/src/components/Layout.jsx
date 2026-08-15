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
  const [q, setQ] = useState("");

  const swRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  /*
   * Close software dropdown when clicking outside.
   * This does NOT control the mobile menu.
   */
  useEffect(() => {
    function handleOutsideClick(event) {
      if (swRef.current && !swRef.current.contains(event.target)) {
        setSwOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /*
   * Close software dropdown when route changes.
   *
   * We intentionally DO NOT call setOpen(false) here.
   * The mobile menu is controlled by the hamburger button
   * and individual navigation links.
   */
  useEffect(() => {
    setSwOpen(false);
  }, [location.pathname]);

  /*
   * Close mobile menu when viewport becomes desktop.
   * This prevents the mobile menu state from remaining open
   * when switching from mobile to desktop width.
   */
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
   * Lock body scrolling while mobile menu is open.
   * This makes the mobile navigation behave more naturally.
   */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function closeMobileMenu() {
    setOpen(false);
  }

  function toggleMobileMenu() {
    setOpen((previous) => !previous);
  }

  function submitSearch(event) {
    event.preventDefault();

    const searchTerm = q.trim();

    if (!searchTerm) return;

    navigate(`/explore?q=${encodeURIComponent(searchTerm)}`);

    setQ("");
    closeMobileMenu();
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* =========================
          HEADER
      ========================== */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        {/* =========================
            TOP BAR
        ========================== */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* LOGO */}
          <Link
            to="/"
            className="flex min-w-0 shrink-0 items-center gap-2.5"
            onClick={closeMobileMenu}
          >
            <BrandLogo
              className="h-10 w-10 shrink-0"
              priority
            />

            <span className="min-w-0 leading-tight">
              <span className="block truncate text-xs font-bold text-gray-900 sm:text-base">
                GIS & REMOTE SENSING HUB
              </span>

              <span className="hidden truncate text-[11px] font-medium text-brand-600 sm:block">
                Academy · What We Do · Labs
              </span>
            </span>
          </Link>

          {/* DESKTOP SEARCH + WORKSPACE */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <form
              onSubmit={submitSearch}
              className="relative"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Search geospatial data..."
                className="w-40 rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-sm transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 2xl:w-48"
              />
            </form>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800 transition hover:bg-brand-100"
            >
              <UserIcon className="h-4 w-4" />
              My workspace
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 md:hidden"
            onClick={toggleMobileMenu}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* =========================
            DESKTOP NAVIGATION
        ========================== */}
        <nav
          className="hidden border-t border-gray-100 md:block"
          aria-label="Primary navigation"
        >
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-center gap-1 py-2">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold transition lg:text-sm ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* =========================
            MOBILE NAVIGATION
        ========================== */}
        {open && (
          <div
            id="mobile-navigation"
            className="border-t border-gray-200 bg-white md:hidden"
          >
            <div className="max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-3">
              {/* MOBILE SEARCH */}
              <form
                onSubmit={submitSearch}
                className="relative mb-3"
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Search geospatial data..."
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </form>

              {/* MOBILE LINKS */}
              <nav
                className="flex flex-col gap-1"
                aria-label="Mobile navigation"
              >
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                {/* SUBMIT DATASET */}
                <Link
                  to="/submit"
                  onClick={closeMobileMenu}
                  className="btn-primary mt-2 justify-center"
                >
                  Submit Dataset
                </Link>

                {/* WORKSPACE */}
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
                >
                  <UserIcon className="h-4 w-4" />
                  My workspace
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="border-t border-gray-200 bg-brand-950 text-gray-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-2">
              <BrandLogo className="h-14 w-14 shrink-0" />

              <span className="font-bold text-white">
                GIS & REMOTE SENSING HUB
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Prepared by GeoBrains Academy. "From Maps to
              Intelligence—Shaping a Smarter World." 🌍
            </p>
          </div>

          {/* EXPLORE */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Explore
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="hover:text-white"
                  to="/explore"
                >
                  Browse Catalogue
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/categories"
                >
                  Categories
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/sources"
                >
                  Data Sources
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/latest"
                >
                  Latest Datasets
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/popular"
                >
                  Popular Datasets
                </Link>
              </li>
            </ul>
          </div>

          {/* COMMUNITY */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Community
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="hover:text-white"
                  to="/community"
                >
                  About the community
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/contact"
                >
                  Contact us
                </Link>
              </li>

              <li>
                <a
                  className="hover:text-white"
                  href="https://chat.whatsapp.com/CkShg01Jp2a1Anz9UPpwax"
                  target="_blank"
                  rel="noreferrer"
                >
                  Join WhatsApp community
                </a>
              </li>
            </ul>
          </div>

          {/* COVERAGE */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Coverage
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="hover:text-white"
                  to="/tanzania"
                >
                  Tanzania
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/global"
                >
                  Global & Africa
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/explore?coverage=Zanzibar"
                >
                  Zanzibar
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/explore?country=Tanzania"
                >
                  Tanzania Mainland
                </Link>
              </li>
            </ul>
          </div>

          {/* ECOSYSTEM */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Ecosystem
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="hover:text-white"
                  to="/training"
                >
                  GeoBrains Academy
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/what-we-do"
                >
                  What We Do
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/labs"
                >
                  GeoBrains Labs
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/projects"
                >
                  Projects &amp; Innovation
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/resources"
                >
                  GeoBrains Resources
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/opportunities"
                >
                  GeoBrains Opportunities
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/about"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/submit"
                >
                  Submit a Dataset
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-white"
                  to="/sources"
                >
                  Official data sources
                </Link>
              </li>
            </ul>s
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-white/10 py-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} GIS & Remote Sensing Hub -
          Prepared by GeoBrains Academy - "From Maps to Intelligence—Shaping
          a Smarter World." 🌍
        </div>
      </footer>
    </div>
  );
}