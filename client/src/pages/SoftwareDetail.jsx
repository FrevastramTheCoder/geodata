import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  Globe2,
  Heart,
  GraduationCap,
  Monitor,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { getSoftware } from "../services/softwareApi.js";
import { isSaved, toggleSaved as toggleLocalSaved } from "../services/localState.js";
import { VerificationBadge, Loading, ErrorState, SoftwareCard } from "../components/ui.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

const FREE_LICENSES = ["FREE", "OPEN_SOURCE"];

export default function SoftwareDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    setError(null);
    setItem(null);
    Promise.resolve(getSoftware(slug))
      .then(async (d) => {
        if (!alive) return;
        if (!d) throw new Error("Software resource not found");
        setItem(d);
        setSaved(isSaved("SOFTWARE", d.id));
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [slug]);

  async function toggleSaved() {
    try {
      setSaved(toggleLocalSaved("SOFTWARE", item.id));
    } catch (e) {
      setError(e.message);
    }
  }

  usePageMeta(item ? `${item.name} — official download` : "Software details", item ? `${item.name} by ${item.developer?.name || "—"}. ${item.description || ""}`.slice(0, 200) : undefined);

  if (!item && !error) return <Loading label="Loading software..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const free = FREE_LICENSES.includes(item.licenseType);
  const links = [
    { label: "Official Website", url: item.officialWebsite, primary: true, icon: Globe2 },
    { label: "Download", url: item.downloadUrl, primary: true, icon: Download },
    { label: "Documentation", url: item.documentationUrl, icon: BookOpen },
    { label: "Tutorials", url: item.tutorialUrl, icon: PlayCircle },
  ].filter((l) => l.url);

  const capabilities = [
    { key: "hasGIS", label: "GIS" },
    { key: "hasRemoteSensing", label: "Remote Sensing" },
    { key: "has3D", label: "3D Modelling" },
    { key: "hasCAD", label: "CAD" },
    { key: "hasBIM", label: "BIM" },
    { key: "hasWeb", label: "Web Mapping" },
    { key: "hasDatabase", label: "Spatial Database" },
    { key: "hasPython", label: "Python" },
  ].filter((c) => item[c.key]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-xs text-gray-500">
        <Link to="/software" className="hover:text-brand-700">Software</Link>
        <span className="mx-1.5">/</span>
        {item.category && (
          <>
            <Link to={`/software/categories/${item.category.slug}`} className="hover:text-brand-700">
              {item.category.name}
            </Link>
            <span className="mx-1.5">/</span>
          </>
        )}
        <span className="font-semibold text-gray-900">{item.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">{item.name}</h1>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  {item.developer?.name ? `by ${item.developer.name}` : ""}
                  {item.developer?.website ? (
                    <a
                      href={item.developer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 inline-flex items-center gap-0.5 text-brand-700 hover:underline"
                    >
                      (developer site) <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {item.verificationStatus === "VERIFIED" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800 ring-1 ring-green-200">
                    <ShieldCheck className="h-4 w-4" /> Links verified live
                  </span>
                ) : (
                  <VerificationBadge status={item.verificationStatus} />
                )}
                <span className={`badge ${free ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                  {item.licenseType?.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-gray-700">{item.description}</p>

            {/* Link-first actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    l.primary
                      ? "btn-primary inline-flex items-center gap-2"
                      : "btn-secondary inline-flex items-center gap-2"
                  }
                  title="Opens the official external source in a new tab"
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                  </a>
              ))}
              <button onClick={toggleSaved} className="btn-secondary inline-flex items-center gap-2">
                <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save software"}
              </button>
            </div>
          </div>

          {/* Capabilities */}
          {capabilities.length > 0 && (
            <div className="card mt-6 p-6">
              <h2 className="text-base font-bold text-gray-900">Capabilities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {capabilities.map((c) => (
                  <span key={c.key} className="badge bg-brand-50 text-brand-800">{c.label}</span>
                ))}
                {item.studentAccess && (
                  <span className="inline-flex items-center gap-1 badge bg-amber-50 text-amber-800">
                    <GraduationCap className="h-3.5 w-3.5" /> Free student license
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Specs */}
          <div className="card mt-6 p-6">
            <h2 className="text-base font-bold text-gray-900">Details</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Developer</dt>
                <dd className="mt-1 font-medium text-gray-800">{item.developer?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">License</dt>
                <dd className="mt-1 font-medium text-gray-800">{item.licenseType?.replace(/_/g, " ")}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pricing</dt>
                <dd className="mt-1 font-medium text-gray-800">{item.pricing || "See official site"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Latest version</dt>
                <dd className="mt-1 font-medium text-gray-800">{item.version || "Latest stable"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Platforms</dt>
                <dd className="mt-1 font-medium text-gray-800">
                  {(item.operatingSystems || []).length ? item.operatingSystems.join(", ") : "See official site"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Technologies</dt>
                <dd className="mt-1 font-medium text-gray-800">
                  {(item.technology || []).length ? item.technology.join(", ") : "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">System requirements</dt>
                <dd className="mt-1 font-medium leading-relaxed text-gray-800">
                  {item.systemRequirements || "See official site for system requirements."}
                </dd>
              </div>
              {item.lastVerifiedAt && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Links last verified</dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 font-medium text-gray-800">
                    <Calendar className="h-3.5 w-3.5 text-brand-600" />
                    {new Date(item.lastVerifiedAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Keywords */}
          {(item.keywords || []).length > 0 && (
            <div className="card mt-6 p-6">
              <h2 className="text-base font-bold text-gray-900">Tags</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.keywords.map((k) => (
                  <span key={k} className="badge bg-gray-100 text-gray-600">{k}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card bg-brand-950 p-6 text-white">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-200">
              <Sparkles className="h-4 w-4" /> Get it officially
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              This hub only links to the developer's official site, installer or repository —
              never third-party mirrors or file-sharing services.
            </p>
            <a
              href={item.downloadUrl || item.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2 bg-brand-500 py-3 hover:bg-brand-400"
            >
              <Download className="h-4 w-4" />
              {item.downloadUrl ? "Download from official source" : "Open official site"}
            </a>
            {item.studentAccess && (
              <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-amber-300">
                <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Free license available for students — check the official site for eligibility.
              </p>
            )}
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900">Platforms</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(item.operatingSystems || []).map((os) => (
                <span key={os} className="inline-flex items-center gap-1.5 badge bg-gray-100 text-gray-700">
                  <Monitor className="h-3.5 w-3.5" /> {os}
                </span>
              ))}
            </div>
            <h3 className="mt-5 text-sm font-bold text-gray-900">Verification</h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              {item.verificationStatus === "VERIFIED" || item.verificationStatus === "REDIRECTED"
                ? "Official links respond with a working page (some redirect to the developer's current site)."
                : item.verificationStatus === "BROKEN"
                  ? "One or more official links are currently unreachable — please verify on the official site."
                  : "Links have not yet been confirmed live from this network."}
            </p>
          </div>
        </aside>
      </div>

      {/* Related */}
      {item.related?.length > 0 && (
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Similar software</h2>
              <p className="mt-1 text-sm text-gray-600">More titles in {item.category?.name || "this catalogue"}.</p>
            </div>
            <Link to={`/software?category=${item.category?.slug || ""}`} className="btn-secondary">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {item.related.map((s) => (
              <SoftwareCard key={s.id} s={s} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 text-center text-xs text-gray-400">
        <Wrench className="mr-1 inline h-3.5 w-3.5" />
        Missing a title?{" "}
        <Link to="/software/submit" className="font-semibold text-brand-700 hover:underline">
          Suggest software
        </Link>{" "}
        and we will review and verify it.
      </p>
    </div>
  );
}
