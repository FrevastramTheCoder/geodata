import { ADMINISTRATIVE_AREAS, DATASET_CATEGORIES, DATASET_RESOURCES, DATA_SOURCES } from "../data/externalResources.js";
import { fetchJson, externalApiUrl } from "./externalFetch.js";
import { getEarthEngineDataset, getEarthEngineDatasets } from "./earthEngineCatalogApi.js";

const configuredUrl = externalApiUrl(import.meta.env?.VITE_DATASETS_API_URL);
let externalCatalogPromise;

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const CATEGORY_ALIASES = {
  "remote-sensing": "satellite-remote-sensing",
  "earth-observation": "satellite-remote-sensing",
  climate: "climate-weather",
  demographics: "population-demographics",
  "population-human-geography": "population-demographics",
};

function normalizeCategory(value) {
  const raw = typeof value === "object" ? value?.slug || value?.name : value;
  const normalized = slugify(raw);
  const known = DATASET_CATEGORIES.find((item) => item.slug === normalized || slugify(item.name) === normalized);
  const slug = known?.slug || CATEGORY_ALIASES[normalized] || normalized || "research-data";
  const definition = DATASET_CATEGORIES.find((item) => item.slug === slug);
  return {
    slug,
    name: definition?.name || (typeof value === "object" ? value?.name : value) || "Research Data",
  };
}

function normalizeSource(value) {
  if (typeof value === "object" && value) {
    return {
      ...value,
      slug: value.slug || slugify(value.name),
      name: value.name || value.slug || "External source",
    };
  }
  const name = String(value || "External source");
  return { slug: slugify(name), name };
}

function payloadItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  return [];
}

function normalizeExternalDataset(item, index) {
  const name = item.name || item.title || item.label || `External dataset ${index + 1}`;
  const source = normalizeSource(item.source || item.provider || item.organization);
  const officialUrl = item.officialUrl || item.sourceUrl || item.url || item.landingPage || item.link || null;
  const category = normalizeCategory(item.category || item.categorySlug || item.categoryName || item.topic);
  const id = item.id || item.slug || item.identifier || `external-${index}-${slugify(name)}`;
  return {
    ...item,
    id,
    slug: item.slug || id,
    name,
    description: item.description || item.abstract || "Online dataset from an external catalogue.",
    category,
    source,
    provider: item.provider || source.slug,
    sourceUrl: item.sourceUrl || officialUrl,
    officialUrl,
    dataType: item.dataType || item.type || "Web / Catalog",
    format: item.format || item.fileFormat || "Web",
    status: item.status || "PUBLISHED",
    verificationStatus: item.verificationStatus || "EXTERNAL",
    sourceType: item.sourceType || "external-api",
  };
}

function allCategories(items) {
  const map = new Map(DATASET_CATEGORIES.map((item) => [item.slug, { ...item, _count: { datasets: 0 } }]));
  items.forEach((item) => {
    const value = normalizeCategory(item.category);
    const existing = map.get(value.slug) || { ...value, _count: { datasets: 0 } };
    existing._count.datasets += 1;
    map.set(value.slug, existing);
  });
  return [...map.values()];
}

function staticDatasets() {
  return getEarthEngineDatasets().then((gee) => [...DATASET_RESOURCES, ...gee]);
}

function matches(item, params) {
  const q = String(params.q || "").trim().toLowerCase();
  if (q) {
    const haystack = [item.name, item.description, item.provider, item.coverage, item.country, item.category?.name, ...(item.tags || [])].join(" ").toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (params.category && normalizeCategory(item.category).slug !== normalizeCategory(params.category).slug) return false;
  const itemSource = item.source?.slug || slugify(item.source?.name || item.provider);
  if (params.source && itemSource !== slugify(params.source) && slugify(item.provider) !== slugify(params.source)) return false;
  if (params.country && !`${item.country} ${item.coverage}`.toLowerCase().includes(String(params.country).toLowerCase())) return false;
  if (params.year && String(item.year || "") !== String(params.year)) return false;
  if (params.dataType && !String(item.dataType || "").toLowerCase().includes(String(params.dataType).toLowerCase())) return false;
  if (params.format && !String(item.format || "").toLowerCase().includes(String(params.format).toLowerCase())) return false;
  if (params.accessType && item.accessType !== params.accessType) return false;
  return true;
}

function sortItems(items, sort, query) {
  const copy = [...items];
  if (sort === "popular") return copy.sort((a, b) => Number(b.popular) - Number(a.popular));
  if (sort === "verified") return copy.sort((a, b) => String(b.verificationStatus).localeCompare(String(a.verificationStatus)));
  if (sort === "relevance" && query) return copy.sort((a, b) => Number(b.name.toLowerCase().startsWith(query.toLowerCase())) - Number(a.name.toLowerCase().startsWith(query.toLowerCase())));
  return copy;
}

async function externalDatasets(params) {
  if (!configuredUrl) return null;
  if (!externalCatalogPromise) {
    externalCatalogPromise = fetchJson(configuredUrl, { timeout: 8000 })
      .then((payload) => payloadItems(payload).map(normalizeExternalDataset))
      .catch(() => []);
  }
  const items = await externalCatalogPromise;
  return items.filter((item) => matches(item, params));
}

async function catalogDatasets() {
  const [builtIn, external] = await Promise.all([
    staticDatasets(),
    externalDatasets({}),
  ]);
  const items = [...builtIn, ...(external || [])];
  return [...new Map(items.map((item) => [item.id || item.slug, item])).values()];
}

export async function listDatasets(params = {}) {
  const items = (await catalogDatasets()).filter((item) => matches(item, params));
  const sorted = sortItems(items, params.sort || "relevance", params.q || "");
  const perPage = Math.max(1, Number(params.perPage) || 24);
  const page = Math.max(1, Number(params.page) || 1);
  const start = (page - 1) * perPage;
  return {
    query: params.q || "",
    items: sorted.slice(start, start + perPage),
    total: sorted.length,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(sorted.length / perPage)),
    administrativeAreas: searchAdministrativeAreas(params.q),
  };
}

export async function getDataset(id) {
  const items = await catalogDatasets();
  const found = items.find((item) => item.id === id || item.slug === id || item.earthEngineId === id);
  return found?.sourceType === "external-api" ? getEarthEngineDataset(found) : found || null;
}

export async function getDatasetCategories() {
  return allCategories(await catalogDatasets());
}

export async function getDataSources() {
  const items = await catalogDatasets();
  return DATA_SOURCES.map((item) => ({ ...item, _count: { datasets: items.filter((dataset) => dataset.source?.slug === item.slug || dataset.provider === item.slug).length } }));
}

export async function getDatasetStats() {
  const items = await catalogDatasets();
  return { datasets: items.length, sources: new Set(items.map((item) => item.provider)).size, categories: allCategories(items).length };
}

export function searchAdministrativeAreas(query) {
  const value = String(query || "").trim().toLowerCase();
  if (!value) return [];
  return ADMINISTRATIVE_AREAS.flatMap((root) => [root, ...(root.children || [])]).filter((item) => `${item.name} ${item.code}`.toLowerCase().includes(value));
}

export function getBoundaryTree() {
  return ADMINISTRATIVE_AREAS;
}

export function getBoundaryDetail(id) {
  return ADMINISTRATIVE_AREAS.flatMap((root) => [root, ...(root.children || [])]).find((item) => item.id === id) || null;
}
