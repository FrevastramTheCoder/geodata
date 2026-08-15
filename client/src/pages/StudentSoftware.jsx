import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Info, ShieldCheck } from "lucide-react";
import { listSoftware } from "../services/softwareApi.js";
import { SoftwareCard, Loading, ErrorState, EmptyState } from "../components/ui.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

export default function StudentSoftware() {
  usePageMeta("Software for Students", "Free student licences for GIS, remote sensing, CAD and BIM software.");
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    listSoftware({ student: "true", sort: "popular", perPage: 60 })
      .then((d) => alive && setItems(d.items || []))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  if (!items && !error) return <Loading label="Loading student software..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div>
      <section className="bg-brand-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20">
            <GraduationCap className="h-3.5 w-3.5" /> Verified student programmes
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Software for Students</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">
            {items.length} titles offer free student licences or education editions.
            Eligibility is decided by each developer — the hub links to the official
            education pages only.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 ring-1 ring-amber-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Student access varies: some developers require a school email address, proof of
            enrolment, or registration through their education portal. Always read the terms
            on the official page before installing. We only link to those official pages.
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState title="No student-access titles yet" body="Check back soon." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((s) => (
              <SoftwareCard key={s.id} s={s} />
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Link to="/software/free" className="card group p-6 transition hover:border-brand-400">
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 group-hover:text-brand-700">
              Free &amp; open source <ArrowRight className="h-4 w-4" />
            </h3>
            <p className="mt-1.5 text-sm text-gray-600">No student registration needed — free for everyone.</p>
          </Link>
          <Link to="/software" className="card group p-6 transition hover:border-brand-400">
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 group-hover:text-brand-700">
              <ShieldCheck className="h-4 w-4" /> Full catalogue <ArrowRight className="h-4 w-4" />
            </h3>
            <p className="mt-1.5 text-sm text-gray-600">Browse all titles with live verification badges.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
