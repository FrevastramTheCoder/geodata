/**
 * NBS normalizer.
 *
 * Converts raw records into the canonical CatalogDataset shape with stable
 * dedup keys, category/source lookup, status and lastVerified timestamp.
 */

const SOURCE_SLUG = "nbs";
const SOURCE_NAME = "National Bureau of Statistics Tanzania";

const CATEGORY_BY_KEYWORD = [
  { slug: "administrative-boundaries", words: ["boundar", "region", "district", "ward", "village", "mtaa", "shehia", "enumeration", "shapefile"] },
  { slug: "population-demographics", words: ["population", "demographic", "household", "microdata"] },
  { slug: "satellite-remote-sensing", words: ["imagery", "satellite", "remote sensing", "land cover"] },
  { slug: "hydrology", words: ["water", "hydrolog"] },
  { slug: "climate-weather", words: ["climate", "weather", "rainfall", "temperature"] },
  { slug: "agriculture", words: ["agriculture", "crop", "livestock", "farm"] },
  { slug: "health", words: ["health", "facility", "disease"] },
  { slug: "education", words: ["education", "school"] },
  { slug: "transport-infrastructure", words: ["road", "transport", "infrastructure"] },
];

/**
 * Map a raw record to a category slug by keyword scoring, falling back to
 * "administrative-boundaries" (NBS output is mostly boundary-related).
 */
export function inferCategorySlug(raw) {
  const haystack = `${raw.title} ${raw.description || ""} ${raw.dataType || ""} ${raw.format || ""}`.toLowerCase();
  let best = { slug: "administrative-boundaries", score: 0 };
  for (const cat of CATEGORY_BY_KEYWORD) {
    const score = cat.words.reduce(
      (acc, w) => acc + (haystack.includes(w) ? 1 : 0),
      0,
    );
    if (score > best.score) best = { slug: cat.slug, score };
  }
  return best.slug;
}

/** Build a stable dedup key for a raw record. */
export function buildDedupKey(raw) {
  const stable =
    raw.id ||
    raw.downloadUrl ||
    raw.pageUrl ||
    `${raw.title}|${raw.year || ""}`;
  const base = `${SOURCE_SLUG}:${stable}`
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/g, "")
    .trim();
  return base;
}

/**
 * Normalize a raw record into the canonical dataset shape.
 * @param {object} raw
 * @param {object} opts - { categoryBySlug, sourceRow }
 */
export function normalizeRecord(raw, { categoryBySlug, sourceRow }) {
  const categorySlug = inferCategorySlug(raw);
  const category = categoryBySlug.get(categorySlug);

  const license = inferLicense(raw);
  const accessType = license.includes("Restricted")
    ? "REQUEST"
    : raw.downloadUrl
      ? "DIRECT_DOWNLOAD"
      : "VIEW";

  return {
    title: cleanTitle(raw.title),
    description: cleanText(raw.description),
    categoryId: category?.id || null,
    sourceId: sourceRow.id,
    coverage: raw.coverage || "Tanzania",
    country: "Tanzania",
    region: "Tanzania Mainland",
    year: raw.year || null,
    dataType: raw.dataType || "Vector / Boundaries",
    format: raw.format || "Shapefile",
    resolution: null,
    license,
    accessType,
    sourceUrl: raw.pageUrl,
    accessUrl: raw.downloadUrl || null,
    sourceRecordKey: buildDedupKey(raw),
    lastVerified: new Date(),
    status: "DISCOVERED",
    keywords: buildTags(raw),
  };
}

function inferLicense(raw) {
  const text = `${raw.title} ${raw.description || ""}`.toLowerCase();
  if (/lower-level|formal request|confidentiality|restricted|registration/i.test(text)) {
    return "Restricted — access by formal request to NBS";
  }
  return "Public — official NBS distribution";
}

function buildTags(raw) {
  const words = [
    raw.title,
    raw.dataType,
    raw.format,
    raw.coverage,
    raw.year ? `year:${raw.year}` : null,
  ]
    .filter(Boolean)
    .flatMap((s) => String(s).split(/[\s,;()-]+/))
    .map((w) => w.trim())
    .filter((w) => w.length > 2)
    .map((w) => w.toLowerCase());

  return [...new Set(words)].slice(0, 12);
}

function cleanTitle(title) {
  return String(title || "").trim().replace(/\.(zip)$/i, "").trim();
}

function cleanText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

export { SOURCE_SLUG, SOURCE_NAME };
