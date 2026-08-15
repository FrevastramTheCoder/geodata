import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Download,
  ExternalLink,
  Eye,
  FileType,
  Globe2,
  Heart,
  Layers,
  Lock,
  MapPin,
  Shield,
} from "lucide-react";
import { getDataset, listDatasets } from "../services/datasetsApi.js";
import { isSaved, toggleSaved } from "../services/localState.js";
import {
  Loading,
  ErrorState,
  StatusBadge,
  VerificationBadge,
  CategoryPill,
  DatasetCard,
} from "../components/ui.jsx";

const ACCESS_BUTTONS = {
  PUBLIC_DOWNLOAD: {
    label: "Access Official Source",
    hint: "Open the official page where this dataset is published",
    icon: ExternalLink,
    primary: true,
  },
  DIRECT_DOWNLOAD: {
    label: "Download",
    hint: "Direct download from the official source",
    icon: Download,
    primary: true,
  },
  REQUEST: {
    label: "Request Data",
    hint: "This dataset is not openly published — request it from the owner",
    icon: Lock,
    primary: false,
  },
  VIEW: {
    label: "View Source",
    hint: "Open the official page to view this dataset",
    icon: Eye,
    primary: false,
  },
};

function AccessButton({ d }) {
  const cfg = ACCESS_BUTTONS[d.accessType] || ACCESS_BUTTONS.VIEW;
  const href = d.accessType === "DIRECT_DOWNLOAD" && d.directUrl ? d.directUrl : d.officialUrl;
  const Icon = cfg.icon;
  if (d.protected) {
    return (
      <Link to="/login" className="btn-primary justify-center">
        <Lock className="h-4 w-4" />
        Sign in to access
      </Link>
    );
  }
  if (d.accessType === "REQUEST") {
    return (
      <Link to="/submit" className={`${cfg.primary ? "btn-primary" : "btn-secondary"} justify-center`}>
        <Icon className="h-4 w-4" />
        {cfg.label}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${cfg.primary ? "btn-primary" : "btn-secondary"} justify-center`}>
      {cfg.label}
      {cfg.primary ? <ExternalLink className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
    </a>
  );
}

function Field({ label, value }) {
  return (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || "—"}</dd>
    </div>
  );
}

export default function DatasetDetail() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getDataset(id)
      .then(async (d) => {
        if (!alive) return;
        if (!d) throw new Error("Dataset not found");
        setD(d);
        setSaved(isSaved("DATASET", d.id));
        if (d.category?.slug) {
          const rel = await listDatasets({ category: d.category.slug, perPage: 4 }).catch(() => null);
          if (alive) setRelated((rel?.items || []).filter((r) => r.id !== d.id).slice(0, 3));
        }
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  function toggleSavedResource() {
    try {
      setSaved(toggleSaved("DATASET", d.id));
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <Loading label="Loading dataset..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!d) return <ErrorState message="Dataset not found." />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/explore" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to catalogue
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <article>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <CategoryPill category={d.category} />
            <StatusBadge status={d.status} />
            <VerificationBadge status={d.verificationStatus} />
          </div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900">{d.name}</h1>
          <p className="mt-4 text-base leading-relaxed text-gray-700">
            {d.description || "No description available for this resource."}
          </p>

          <div className="mt-8">
            <h2 className="mb-2 text-lg font-bold text-gray-900">About this resource</h2>
            <div className="card grid gap-x-8 p-6 sm:grid-cols-2">
              <Field label="Category" value={d.category?.name} />
              <Field label="Source" value={d.source?.name} />
              <Field label="Coverage" value={d.coverage} />
              <Field label="Country" value={d.country} />
              <Field label="Region" value={d.region} />
              <Field label="Year" value={d.year} />
              <Field label="Data type" value={d.dataType} />
              <Field label="Format" value={d.format} />
              <Field label="Resolution" value={d.resolution} />
              <Field label="CRS" value={d.crs} />
              <Field label="Access" value={d.accessType} />
              <Field label="Last verified" value={d.lastVerified ? new Date(d.lastVerified).toLocaleDateString() : "—"} />
            </div>
          </div>

          {d.tags?.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 text-lg font-bold text-gray-900">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {d.tags.map((t) => (
                  <Link
                    key={t}
                    to={`/explore?q=${encodeURIComponent(t)}`}
                    className="badge bg-gray-100 text-gray-700 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-2 text-lg font-bold text-gray-900">Access information</h2>
            <div className="card space-y-3 p-6">
              <div className="flex items-start gap-3">
                <Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Official source page</p>
                  <a
                    href={d.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-brand-700 hover:underline"
                  >
                    {d.officialUrl}
                  </a>
                </div>
              </div>
              {d.directUrl && (
                <div className="flex items-start gap-3">
                  <Download className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Direct access / download</p>
                    <a
                      href={d.directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm text-brand-700 hover:underline"
                    >
                      {d.directUrl}
                    </a>
                  </div>
                </div>
              )}
              {d.license && (
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">License / access</p>
                    <p className="text-sm text-gray-700">{d.license}</p>
                  </div>
                </div>
              )}
              <p className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                This record is metadata only. The dataset is hosted and
                maintained by the original source organization. Always follow
                the source's terms of use.
              </p>
            </div>
          </div>
        </article>

        <aside className="space-y-5">
          <div className="card sticky top-20 p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
              Quick actions
            </h2>
            <div className="flex flex-col gap-2">
              <AccessButton d={d} />
              <button onClick={toggleSavedResource} className="btn-secondary justify-center">
                <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
                {saved ? "Saved" : "Save dataset"}
              </button>
              {d.directUrl && d.accessType !== "DIRECT_DOWNLOAD" && (
                <a
                  href={d.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary justify-center"
                >
                  <Download className="h-4 w-4" />
                  Direct file / API
                </a>
              )}
              <Link to="/submit" className="btn-secondary justify-center">
                Suggest a correction
              </Link>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              {(ACCESS_BUTTONS[d.accessType] || ACCESS_BUTTONS.VIEW).hint}
            </p>
            <dl className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Layers className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Type:</span> {d.dataType || "—"}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FileType className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Format:</span> {d.format || "—"}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Coverage:</span> {d.coverage || "—"}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Year:</span> {d.year || "—"}
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Related datasets</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <DatasetCard key={r.id} d={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
