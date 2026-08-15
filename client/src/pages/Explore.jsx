import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { getDataSources, getDatasetCategories, listDatasets } from "../services/datasetsApi.js";
import {
  DatasetCard,
  Loading,
  ErrorState,
  EmptyState,
  Pagination,
} from "../components/ui.jsx";

const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "verified", label: "Recently verified" },
  { value: "popular", label: "Most viewed" },
];

const ACCESS_TYPES = ["PUBLIC_DOWNLOAD", "DIRECT_DOWNLOAD", "REQUEST", "VIEW"];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState({ categories: [], sources: [], formats: [], types: [] });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(params.get("q") || "");

  const q = params.get("q") || "";
  const page = Number(params.get("page")) || 1;
  const perPage = Number(params.get("perPage")) || 24;
  const sort = params.get("sort") || "relevance";
  const category = params.get("category") || "";
  const source = params.get("source") || "";
  const country = params.get("country") || "";
  const year = params.get("year") || "";
  const dataType = params.get("dataType") || "";
  const format = params.get("format") || "";
  const accessType = params.get("accessType") || "";

  useEffect(() => {
    Promise.all([getDatasetCategories(), getDataSources()])
      .then(([categories, sources]) => {
        const formats = new Set();
        const types = new Set();
        (categories || []).forEach(() => {});
        setMeta({
          categories: categories || [],
          sources: (sources || []).filter((s) => s._count?.datasets > 0),
          formats: [...formats],
          types: [...types],
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    query.set("page", String(page));
    query.set("perPage", String(perPage));
    if (sort !== "relevance") query.set("sort", sort);
    if (category) query.set("category", category);
    if (source) query.set("source", source);
    if (country) query.set("country", country);
    if (year) query.set("year", year);
    if (dataType) query.set("dataType", dataType);
    if (format) query.set("format", format);
    if (accessType) query.set("accessType", accessType);

    listDatasets(Object.fromEntries(query.entries()))
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [q, page, perPage, sort, category, source, country, year, dataType, format, accessType]);

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  }

  function submitSearch(e) {
    e.preventDefault();
    setParam("q", searchInput.trim());
  }

  const activeFilterCount = useMemo(
    () => [category, source, country, year, dataType, format, accessType].filter(Boolean).length,
    [category, source, country, year, dataType, format, accessType],
  );

  const years = useMemo(() => {
    const y = new Set();
    const now = new Date().getFullYear();
    for (let i = now; i >= 1990; i -= 2) y.add(i);
    return [...y];
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore Data</h1>
        <p className="mt-1 text-sm text-gray-600">
          Search {data ? `${data.total.toLocaleString()} verified and online resources` : "verified and online geospatial resources"} from official providers and the online Earth Engine catalogue. Select a category to refresh the results.
        </p>
      </div>

      <form onSubmit={submitSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search datasets, descriptions, keywords..."
            className="input py-3 pl-11 pr-4"
          />
        </div>
        <button type="submit" className="btn-primary px-6">
          Search
        </button>
        <button
          type="button"
          className="btn-secondary lg:hidden"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="badge bg-brand-600 text-white">{activeFilterCount}</span>
          )}
        </button>
      </form>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="card sticky top-20 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-700">
                <Filter className="h-4 w-4" /> Filters
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    const next = new URLSearchParams();
                    const keep = params.get("q");
                    if (keep) next.set("q", keep);
                    setParams(next, { replace: true });
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                >
                  <X className="h-3.5 w-3.5" /> Clear ({activeFilterCount})
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Category</label>
                <select value={category} onChange={(e) => setParam("category", e.target.value)} className="input">
                  <option value="">All categories</option>
                  {meta.categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({c._count?.datasets || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Source</label>
                <select value={source} onChange={(e) => setParam("source", e.target.value)} className="input">
                  <option value="">All sources</option>
                  {meta.sources.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} ({s._count?.datasets || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Country / Region</label>
                <input
                  value={country}
                  onChange={(e) => setParam("country", e.target.value)}
                  placeholder="e.g. Tanzania"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Year</label>
                <select value={year} onChange={(e) => setParam("year", e.target.value)} className="input">
                  <option value="">Any year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Data type</label>
                <select value={dataType} onChange={(e) => setParam("dataType", e.target.value)} className="input">
                  <option value="">All types</option>
                  {["Raster", "Vector", "Tabular", "Web / Catalog", "Web / Portal", "GIS service", "Administrative records"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Format</label>
                <select value={format} onChange={(e) => setParam("format", e.target.value)} className="input">
                  <option value="">All formats</option>
                  {["Shapefile", "GeoTIFF", "CSV", "GeoJSON", "KML", "PDF", "Web", "HTML", "PBF (OSM), SHP", "HDF / NetCDF"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Access</label>
                <select value={accessType} onChange={(e) => setParam("accessType", e.target.value)} className="input">
                  <option value="">All access</option>
                  {ACCESS_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              {data ? (
                <>
                  <span className="font-bold text-gray-900">{data.total.toLocaleString()}</span>{" "}
                  result{data.total === 1 ? "" : "s"}
                  {q && (
                    <>
                      {" "}for{" "}
                      <span className="font-semibold text-brand-700">“{q}”</span>
                    </>
                  )}
                </>
              ) : "Loading results..."}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500" htmlFor="sort">Sort</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="input w-auto py-2"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <Loading label="Searching the catalogue..." />
          ) : error ? (
            <ErrorState message={error} onRetry={() => setParams(new URLSearchParams(params), { replace: true })} />
          ) : data && data.items.length === 0 ? (
            <EmptyState
              title={q ? `No results for "${q}"` : "No datasets match these filters"}
              body="Try different keywords or clear some filters."
            />
          ) : (
            <>
              {data?.administrativeAreas?.length > 0 && (
                <section className="mb-6 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Administrative areas</h2>
                      <p className="mt-0.5 text-xs text-gray-600">Matching official geographic units.</p>
                    </div>
                    <Link to={`/boundaries?q=${encodeURIComponent(q)}`} className="text-xs font-semibold text-brand-700 hover:underline">
                      Open boundary explorer
                    </Link>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {data.administrativeAreas.map((area) => (
                      <Link key={area.id} to={`/boundaries?q=${encodeURIComponent(area.name)}`} className="rounded-lg bg-white p-3 text-sm hover:ring-1 hover:ring-brand-300">
                        <span className="font-semibold text-gray-900">{area.name}</span>
                        <span className="ml-2 text-xs text-gray-500">{area.level}{area.code ? ` · ${area.code}` : ""}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data?.items.map((d) => (
                  <DatasetCard key={d.id} d={d} />
                ))}
              </div>
              <Pagination
                page={data?.page || 1}
                totalPages={data?.totalPages || 1}
                onPage={(p) => setParam("page", String(p))}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
