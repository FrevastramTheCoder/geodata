import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Minus, Scale, X } from "lucide-react";
import { listSoftware } from "../services/softwareApi.js";
import { Loading, ErrorState } from "../components/ui.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

const MAX_COMPARE = 3;

export default function SoftwareCompare() {
  usePageMeta("Compare Software", "Compare GIS, remote sensing, CAD and BIM software side by side.");
  const [params, setParams] = useSearchParams();
  const [all, setAll] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    listSoftware({ sort: "popular", perPage: 100 })
      .then((d) => alive && setAll(d.items || []))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const selected = useMemo(() => {
    const slugs = (params.get("slugs") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return (all || []).filter((s) => slugs.includes(s.slug)).slice(0, MAX_COMPARE);
  }, [params, all]);

  function setSlugs(list) {
    const next = new URLSearchParams(params);
    if (list.length) next.set("slugs", list.join(","));
    else next.delete("slugs");
    setParams(next);
  }

  function toggle(s) {
    const current = selected.map((x) => x.slug);
    const exists = current.includes(s.slug);
    if (exists) setSlugs(current.filter((x) => x !== s.slug));
    else if (current.length < MAX_COMPARE) setSlugs([...current, s.slug]);
  }

  if (!all && !error) return <Loading label="Loading catalogue..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const rows = [
    { label: "Developer", get: (s) => s.developer?.name || "—" },
    { label: "Category", get: (s) => s.category?.name || "—" },
    { label: "License", get: (s) => s.licenseType?.replace(/_/g, " ") || "—" },
    { label: "Pricing", get: (s) => s.pricing || "See official site" },
    { label: "Platforms", get: (s) => (s.operatingSystems || []).join(", ") || "—" },
    { label: "GIS", get: (s) => (s.hasGIS ? "Yes" : "—") },
    { label: "Remote sensing", get: (s) => (s.hasRemoteSensing ? "Yes" : "—") },
    { label: "3D modelling", get: (s) => (s.has3D ? "Yes" : "—") },
    { label: "CAD", get: (s) => (s.hasCAD ? "Yes" : "—") },
    { label: "BIM", get: (s) => (s.hasBIM ? "Yes" : "—") },
    { label: "Web mapping", get: (s) => (s.hasWeb ? "Yes" : "—") },
    { label: "Spatial database", get: (s) => (s.hasDatabase ? "Yes" : "—") },
    { label: "Python", get: (s) => (s.hasPython ? "Yes" : "—") },
    { label: "Free student license", get: (s) => (s.studentAccess ? "Yes" : "—") },
    { label: "Verification", get: (s) => s.verificationStatus || "UNKNOWN" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <span className="badge bg-brand-50 text-brand-700"><Scale className="h-3.5 w-3.5" /> Side by side</span>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900">Compare Software</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Pick up to {MAX_COMPARE} titles to compare capabilities, licences and platforms at a glance.
      </p>

      {/* Picker */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(all || []).map((s) => {
          const active = selected.some((x) => x.id === s.id);
          const disabled = !active && selected.length >= MAX_COMPARE;
          return (
            <button
              key={s.id}
              onClick={() => toggle(s)}
              disabled={disabled}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : disabled
                    ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                    : "border-gray-300 bg-white text-gray-700 hover:border-brand-400"
              }`}
            >
              {active ? <Check className="mr-1 inline h-3 w-3" /> : null}
              {s.name}
            </button>
          );
        })}
      </div>

      {selected.length === 0 ? (
        <div className="card mx-auto mt-10 max-w-md p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl">⇄</div>
          <h3 className="text-base font-bold text-gray-900">Nothing to compare yet</h3>
          <p className="mt-1 text-sm text-gray-600">Select at least two titles above to start comparing.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-40 border-b-2 border-gray-200 pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Feature
                </th>
                {selected.map((s) => (
                  <th key={s.id} className="border-b-2 border-gray-200 pb-3 text-left align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/software/${s.slug}`} className="font-bold text-gray-900 hover:text-brand-700">
                          {s.name}
                        </Link>
                        <p className="mt-0.5 text-xs font-normal text-gray-500">{s.developer?.name || ""}</p>
                      </div>
                      <button
                        onClick={() => toggle(s)}
                        className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Remove from comparison"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <a
                      href={s.downloadUrl || s.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                    >
                      Official page <ArrowRight className="h-3 w-3" />
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-gray-100">
                  <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-500">{r.label}</td>
                  {selected.map((s) => {
                    const value = r.get(s);
                    const yes = value === "Yes";
                    const no = value === "—";
                    return (
                      <td key={s.id} className="py-3 pr-6 text-gray-800">
                        {no ? (
                          <span className="text-gray-300"><Minus className="h-4 w-4" /></span>
                        ) : yes ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-green-700">
                            <Check className="h-4 w-4" /> Yes
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-gray-400">
        Comparison data is metadata maintained by the hub — always confirm the latest version and
        terms on the official site.
      </p>
    </div>
  );
}
