import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileDown,
  Globe2,
  Lock,
  MapPin,
  Search,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getBoundaryDetail, getBoundaryTree, listDatasets, searchAdministrativeAreas } from "../services/datasetsApi.js";
import { ErrorState, Loading } from "../components/ui.jsx";

const REQUEST_NOTE = "Not publicly available / requires official request";

const DOWNLOADS = [
  {
    label: "2022 PHC — Tanzania Wards (shapefiles, public)",
    url: "https://www.nbs.go.tz/uploads/statistics/documents/en-1714652282-TANZANIA_2022PHC_WARD_SHAPEFILES.zip",
  },
  {
    label: "Tanzania Districts Shapefiles 2019 (public)",
    url: "https://www.nbs.go.tz/uploads/statistics/documents/en-1705484748-Districts_Shapefiles_2019.zip",
  },
  {
    label: "2012 PHC — Regions & Districts (public)",
    url: "https://www.nbs.go.tz/uploads/statistics/documents/en-1705484749-Tanzania%20GIS%20Maps.zip",
  },
  {
    label: "2012 PHC — Wards / Shehia (public)",
    url: "https://www.nbs.go.tz/uploads/statistics/documents/en-1705484748-2012_Ward_Shapefiles.zip",
  },
  {
    label: "Region Shapefile Metadata 2022 (microdata catalogue)",
    url: "https://microdata.nbs.go.tz/index.php/catalog/49",
  },
];

const REQUEST_LEVELS = [
  { level: "VILLAGE", label: "Villages / Mitaa (level 4)" },
  { level: "ENUMERATION_AREA", label: "Enumeration Areas (level 5)" },
  { level: "HAMLET", label: "Hamlets" },
  { level: "SUB_WARD", label: "Sub-wards" },
];

function TreeRow({ node, selectedId, onSelect, depth }) {
  const [open, setOpen] = useState(depth === 0);
  const [children, setChildren] = useState(node.children || []);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [loaded, setLoaded] = useState((node.children || []).length > 0);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      setLoadingChildren(true);
      setChildren(node.children || []);
      setLoaded(true);
      setLoadingChildren(false);
    }
  }

  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition ${
          selectedId === node.id
            ? "bg-brand-50 font-semibold text-brand-800"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-200"
          aria-label="Expand"
        >
          {loadingChildren ? (
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600" />
          ) : hasChildren || !loaded ? (
            open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="block h-4 w-4" />
          )}
        </button>
        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
        <span className="truncate">{node.name}</span>
        {node.code && <span className="ml-auto text-xs text-gray-400">{node.code}</span>}
      </div>
      {open && (
        <div>
          {children.map((c) => (
            <TreeRow key={c.id} node={c} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
          ))}
          {loaded && !hasChildren && depth >= 0 && (
            <p
              className="px-3 py-1 text-xs italic text-gray-400"
              style={{ paddingLeft: `${(depth + 1) * 18 + 8}px` }}
            >
              Lower levels: use the official shapefile downloads below.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Boundaries() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [tree, setTree] = useState(null);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState(initialQuery);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const selectArea = useCallback(async (node) => {
    setSelected(node);
    if (node?.geometry || !node?.id) return;
    try {
      const detail = getBoundaryDetail(node.id);
      setSelected((current) => (current?.id === node.id ? { ...current, ...detail } : current));
    } catch {
      // The metadata row is still useful when a detail request is unavailable.
    }
  }, []);

  useEffect(() => {
    let alive = true;
    const roots = getBoundaryTree();
    setTree({ roots, total: roots.length });
    if (roots.length) selectArea(roots[0]);
    setLoading(false);
    return () => {
      alive = false;
    };
  }, [selectArea]);

  useEffect(() => {
    if (!initialQuery.trim()) return undefined;
    let alive = true;
    Promise.all([Promise.resolve(searchAdministrativeAreas(initialQuery.trim())), listDatasets({ q: initialQuery.trim(), perPage: 20 })])
      .then(([items, datasets]) => {
        if (!alive) return;
        setResults({ items, relatedDatasets: datasets.items || [], total: items.length });
        if (items.length) selectArea(items[0]);
      })
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, [initialQuery, selectArea]);

  useEffect(() => {
    if (!mapRef.current) return undefined;
    const map = L.map(mapRef.current).setView([-6.369, 34.888], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    const geometryLayer = L.layerGroup().addTo(map);
    const marker = L.circleMarker([-6.369, 34.888], {
      radius: 8,
      color: "#047857",
      fillColor: "#10b981",
      fillOpacity: 0.7,
    }).addTo(map).bindPopup("Select an area to preview verified geometry");
    mapInstance.current = { map, geometryLayer, marker };
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = mapInstance.current;
    if (!instance) return;
    instance.geometryLayer.clearLayers();
    instance.marker.setStyle({
      opacity: selected?.geometry ? 0 : 1,
      fillOpacity: selected?.geometry ? 0 : 0.7,
    });
    if (!selected?.geometry) {
      instance.map.setView([-6.369, 34.888], 6);
      return;
    }
    try {
      const layer = L.geoJSON(selected.geometry, {
        style: { color: "#047857", weight: 2, fillColor: "#10b981", fillOpacity: 0.18 },
      }).addTo(instance.geometryLayer);
      const bounds = layer.getBounds();
      if (bounds.isValid()) instance.map.fitBounds(bounds, { padding: [18, 18] });
    } catch {
      instance.map.setView([-6.369, 34.888], 6);
    }
  }, [selected]);

  async function search(e) {
    e.preventDefault();
    if (!q.trim()) return setResults(null);
    try {
      const [items, datasets] = await Promise.all([Promise.resolve(searchAdministrativeAreas(q.trim())), listDatasets({ q: q.trim(), perPage: 20 })]);
      setResults({ items, relatedDatasets: datasets.items || [], total: items.length });
      if (items.length) selectArea(items[0]);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Loading label="Loading administrative boundaries..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administrative Boundaries</h1>
          <p className="mt-1 text-sm text-gray-600">
            NBS census geography for Tanzania — regions, districts, wards, villages and enumeration areas.
          </p>
        </div>
        <form onSubmit={search} className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a region, district or ward..."
            className="input w-full pl-9"
          />
        </form>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Tree */}
        <aside className="card h-fit p-4 lg:sticky lg:top-20">
          <h2 className="mb-3 px-2 text-xs font-bold uppercase tracking-wide text-gray-500">
            Hierarchy {results ? `(search: ${results.total})` : ""}
          </h2>
          {results ? (
            <div className="space-y-1">
              {results.items.map((r) => (
                <button
                  key={r.id}
                   onClick={() => selectArea(r)}
                  className={`w-full rounded-lg px-2 py-1.5 text-left text-sm ${
                    selected?.id === r.id ? "bg-brand-50 font-semibold text-brand-800" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {r.name} <span className="text-xs text-gray-400">({r.level})</span>
                </button>
              ))}
              <button
                onClick={() => {
                  setResults(null);
                  setQ("");
                }}
                className="mt-2 w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                ← Clear search
              </button>
            </div>
           ) : (
             (tree?.roots || []).map((r) => (
              <TreeRow key={r.id} node={r} selectedId={selected?.id} onSelect={selectArea} depth={0} />
            ))
           )}

          {results?.relatedDatasets?.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <h3 className="px-2 text-xs font-bold uppercase tracking-wide text-gray-500">Related datasets</h3>
              <div className="mt-2 space-y-1">
                {results.relatedDatasets.map((dataset) => (
                   <Link key={dataset.id} to={`/datasets/${dataset.slug || dataset.id}`} className="block rounded-lg px-2 py-1.5 text-xs text-brand-700 hover:bg-brand-50">
                     {dataset.name}
                   </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
            <h3 className="px-2 text-xs font-bold uppercase tracking-wide text-gray-500">Request-only levels</h3>
            {REQUEST_LEVELS.map((r) => (
              <div key={r.level} className="flex items-center gap-2 px-2 text-xs text-gray-600">
                <Lock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                {r.label}
              </div>
            ))}
            <p className="px-2 text-xs italic leading-relaxed text-gray-400">{REQUEST_NOTE}</p>
          </div>
        </aside>

        {/* Detail */}
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-[1fr_320px]">
            <div className="card p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-brand-50 text-brand-700">{selected?.level}</span>
                {selected?.status && (
                  <span className="badge bg-green-100 text-green-800">{selected?.status}</span>
                )}
              </div>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">{selected?.name}</h2>
              {selected?.officialName && selected.officialName !== selected.name && (
                <p className="mt-1 text-sm text-gray-600">{selected.officialName}</p>
              )}
              <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Code</dt>
                  <dd className="mt-0.5 text-gray-900">{selected?.code || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Country</dt>
                  <dd className="mt-0.5 text-gray-900">{selected?.country || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Version</dt>
                  <dd className="mt-0.5 text-gray-900">{selected?.version || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Last verified</dt>
                  <dd className="mt-0.5 text-gray-900">
                    {selected?.lastVerifiedAt ? new Date(selected.lastVerifiedAt).toLocaleDateString() : "—"}
                  </dd>
                </div>
              </dl>
              {selected?.accessUrl && (
                <a
                  href={selected.accessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5 justify-center"
                >
                  <Globe2 className="h-4 w-4" />
                  Official boundary source
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                Source: {selected?.source?.name || "NBS — National Bureau of Statistics"} ·{" "}
                {selected?.sourceUrl ? (
                  <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                    origin page
                  </a>
                ) : (
                  "origin: NBS GIS pages"
                )}
              </p>
            </div>

            <div className="card overflow-hidden">
              <div ref={mapRef} className="h-64 w-full md:h-full md:min-h-64" />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
              <Download className="h-4 w-4 text-brand-600" /> Official shapefile downloads (NBS)
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Boundary polygons for regions, districts and wards are published openly by NBS on the{" "}
              <a
                href="https://www.nbs.go.tz/statistics/topic/gis"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-700 hover:underline"
              >
                NBS Shapefiles page
              </a>
              . Levels below ward are not published — request them from NBS.
            </p>
            <ul className="mt-4 space-y-2">
              {DOWNLOADS.map((d) => (
                <li key={d.url}>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
                  >
                    <FileDown className="h-4 w-4 shrink-0 text-brand-600" />
                    <span className="min-w-0 flex-1 truncate">{d.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
