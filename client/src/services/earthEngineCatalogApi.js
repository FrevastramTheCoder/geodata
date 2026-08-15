import { fetchJson } from "./externalFetch.js";

export const EARTH_ENGINE_STAC_ROOT = "https://storage.googleapis.com/earthengine-stac/catalog/catalog.json";
export const EARTH_ENGINE_CATALOG_PAGE = "https://developers.google.com/earth-engine/datasets/catalog";

let catalogPromise;
let itemPromises = new Map();

function childLinks(catalog) {
  return (catalog?.links || []).filter((link) => link.rel === "child" && link.href);
}

function categoryFor(title, id) {
  const value = `${title} ${id}`.toLowerCase();
  if (/dem|elevation|topograph|terrain|lidar/.test(value)) return "DEM & Terrain";
  if (/rain|precip|climate|temperature|weather|atmosphere|drought/.test(value)) return "Climate & Weather";
  if (/landcover|land-cover|landuse|forest|vegetation|crop|agriculture|soil/.test(value)) return "Land Use / Land Cover";
  if (/water|hydro|river|ocean|marine|coast|flood/.test(value)) return "Hydrology";
  if (/population|human|urban|building|settlement|nighttime|lights/.test(value)) return "Population & Human Geography";
  if (/vector|table|feature|roads|boundar/.test(value)) return "Vector & Tables";
  return "Satellite & Remote Sensing";
}

function normalizeLink(link, provider) {
  const id = link.title || link.href.split("/").pop()?.replace(/\.json$/, "") || "dataset";
  const safeId = id.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();
  const pageUrl = `${EARTH_ENGINE_CATALOG_PAGE}/${encodeURIComponent(id)}`;
  return {
    id: `gee-${safeId}`,
    slug: `gee-${safeId}`,
    earthEngineId: id,
    name: id.replace(/[_-]+/g, " "),
    description: `Official Google Earth Engine public dataset from the ${provider} catalog. Open the catalog entry for full metadata, bands, coverage, licensing and access instructions.`,
    category: { slug: categoryFor(id, id).toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: categoryFor(id, id) },
    source: { slug: "google-earth-engine", name: "Google Earth Engine" },
    provider: "Google Earth Engine",
    sourceUrl: pageUrl,
    officialUrl: pageUrl,
    stacUrl: link.href,
    format: "Earth Engine collection",
    dataType: "Raster / Catalog",
    coverage: "Global or provider-defined",
    country: "Global",
    license: "See official catalog entry",
    accessType: "VIEW",
    status: "PUBLISHED",
    verificationStatus: "EXTERNAL",
    sourceType: "external-api",
    providerCatalog: provider,
  };
}

async function loadCatalog() {
  const root = await fetchJson(EARTH_ENGINE_STAC_ROOT, { timeout: 10000 });
  const providers = childLinks(root);
  const catalogs = await Promise.allSettled(providers.map((provider) => fetchJson(provider.href, { timeout: 10000 })));
  const records = [];
  catalogs.forEach((result, index) => {
    if (result.status !== "fulfilled") return;
    const providerName = providers[index].title || result.value.title || "Google Earth Engine";
    childLinks(result.value).forEach((link) => records.push(normalizeLink(link, providerName)));
  });
  return [...new Map(records.map((record) => [record.id, record])).values()];
}

export function getEarthEngineDatasets() {
  if (!catalogPromise) {
    catalogPromise = loadCatalog().catch(() => []);
  }
  return catalogPromise;
}

export async function getEarthEngineDataset(record) {
  if (!record?.stacUrl) return record;
  if (!itemPromises.has(record.stacUrl)) {
    itemPromises.set(record.stacUrl, fetchJson(record.stacUrl, { timeout: 20000 }).catch(() => null));
  }
  const item = await itemPromises.get(record.stacUrl);
  if (!item) return record;
  const tags = item.keywords || item.properties?.keywords || [];
  return {
    ...record,
    name: item.title || record.name,
    description: item.description || record.description,
    tags: Array.isArray(tags) ? tags : [],
    license: item.license || item.properties?.license || record.license,
    coverage: item.bbox ? `${item.bbox.join(", ")}` : record.coverage,
    startDate: item.start_datetime || item.properties?.start_datetime,
    endDate: item.end_datetime || item.properties?.end_datetime,
    assets: item.assets || {},
    geeDatasetId: item.properties?.["gee:dataset_id"] || item.properties?.gee_dataset_id || record.earthEngineId,
  };
}
