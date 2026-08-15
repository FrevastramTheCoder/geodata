import { Link } from "react-router-dom";
import { ExternalLink, MapPin } from "lucide-react";
import { datasetUrl } from "../api.js";

const STATUS_STYLES = {
  PUBLISHED: "bg-green-100 text-green-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  DISCOVERED: "bg-sky-100 text-sky-800",
  REJECTED: "bg-red-100 text-red-800",
  BROKEN_LINK: "bg-red-100 text-red-800",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600";
  return <span className={`badge ${style}`}>{status.replace(/_/g, " ")}</span>;
}

export function VerificationBadge({ status }) {
  const map = {
    VERIFIED: "bg-green-100 text-green-800",
    REDIRECTED: "bg-amber-100 text-amber-800",
    BROKEN: "bg-red-100 text-red-800",
    RESTRICTED: "bg-orange-100 text-orange-800",
    EXTERNAL: "bg-blue-100 text-blue-800",
    UNKNOWN: "bg-gray-100 text-gray-600",
  };
  return <span className={`badge ${map[status] || map.UNKNOWN}`}>{status || "UNKNOWN"}</span>;
}

export function CategoryIcon({ icon = "map", className = "h-5 w-5" }) {
  const ICONS = {
    "border-all": "⊞",
    city: "⌂",
    map: "◉",
    satellite: "✷",
    mountain: "▲",
    cloud: "☁",
    "cloud-rain": "☂",
    droplets: "≈",
    waves: "〰",
    sun: "☀",
    layers: "▤",
    sprout: "❀",
    users: "☺",
    "clipboard-list": "☰",
    "heart-pulse": "♥",
    "graduation-cap": "⌘",
    route: "⌁",
    "train-front": "☰",
    plane: "✈",
    anchor: "⚓",
    "building-2": "▣",
    "land-plot": "▨",
    leaf: "❧",
    "tree-pine": "♣",
    fish: "≈",
    "alert-triangle": "⚠",
    "hand-heart": "✚",
    wrench: "⚒",
    "flask-conical": "◍",
    cpu: "▣",
  };
  return (
    <span className={`inline-flex items-center justify-center rounded-lg ${className}`}>
      {ICONS[icon] || "◉"}
    </span>
  );
}

export function CategoryPill({ category }) {
  if (!category) return null;
  return (
    <Link
      to={`/explore?category=${category.slug}`}
      className="badge bg-brand-50 text-brand-700 transition hover:bg-brand-100"
    >
      {category.name}
    </Link>
  );
}

export function DatasetCard({ d }) {
  return (
    <article className="card flex flex-col p-5 transition hover:border-brand-400 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <CategoryPill category={d.category} />
        <StatusBadge status={d.status} />
      </div>
      <h3 className="mb-1.5 line-clamp-2 text-base font-bold leading-snug text-gray-900">
        <Link to={datasetUrl(d)} className="hover:text-brand-700">
          {d.name}
        </Link>
      </h3>
      <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
        {d.description || "No description available."}
      </p>
      <dl className="mb-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-brand-600" />
          <span>{d.coverage || d.country || "—"}</span>
        </div>
        <div><span className="text-gray-400">Source:</span> {d.source?.shortName || d.source?.name || "—"}</div>
        <div><span className="text-gray-400">Year:</span> {d.year || "—"}</div>
        <div><span className="text-gray-400">Type:</span> {d.dataType || "—"}</div>
        <div><span className="text-gray-400">Format:</span> {d.format || "—"}</div>
        <div><span className="text-gray-400">Access:</span> {d.accessType || "—"}</div>
      </dl>
      <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
        <Link to={datasetUrl(d)} className="btn-secondary flex-1 justify-center py-2 text-xs">
          View Details
        </Link>
        {d.officialUrl && (
          <a
            href={d.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 justify-center py-2 text-xs"
            title="Opens the official external source"
          >
            Access Dataset
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

export function Loading({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      <p className="mt-4 text-sm font-medium">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <p className="text-sm font-semibold text-red-600">Something went wrong</p>
      <p className="mt-1 text-sm text-gray-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = "No datasets found", body = "Try adjusting your search or filters." }) {
  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl">
        ◉
      </div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{body}</p>
    </div>
  );
}

export function SoftwareCard({ s }) {
  const free = s.licenseType === "FREE" || s.licenseType === "OPEN_SOURCE";
  return (
    <article className="card flex flex-col p-5 transition hover:border-brand-400 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="badge bg-brand-50 text-brand-700">{s.category?.name || "Software"}</span>
        <VerificationBadge status={s.verificationStatus} />
      </div>
      <h3 className="mb-1.5 line-clamp-2 text-base font-bold leading-snug text-gray-900">
        <Link to={`/software/${s.slug}`} className="hover:text-brand-700">
          {s.name}
        </Link>
      </h3>
      <p className="mb-1 text-xs font-medium text-gray-500">{s.developer?.name || "—"}</p>
      <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
        {s.description || "No description available."}
      </p>
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span
          className={`badge ${free ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}
        >
          {s.licenseType?.replace(/_/g, " ")}
        </span>
        {(s.operatingSystems || []).slice(0, 3).map((os) => (
          <span key={os} className="badge bg-gray-100 text-gray-500">{os}</span>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
        <Link to={`/software/${s.slug}`} className="btn-secondary flex-1 justify-center py-2 text-xs">
          View Details
        </Link>
        <a
          href={s.downloadUrl || s.officialWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex-1 justify-center py-2 text-xs"
          title="Opens the official external source"
        >
          {s.downloadUrl ? "Get Software" : "Official Site"}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}

export function LicenseBadge({ license }) {
  const free = license === "FREE" || license === "OPEN_SOURCE";
  return (
    <span className={`badge ${free ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
      {(license || "—").replace(/_/g, " ")}
    </span>
  );
}

export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold ${
              p === page
                ? "bg-brand-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:border-brand-400"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
