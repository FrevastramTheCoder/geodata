/**
 * NASA connector.
 *
 * Mechanism: official NASA CMR (Common Metadata Repository) search API —
 * cmr.earthdata.nasa.gov. Reliable, JSON, no auth for metadata search.
 *
 * Priority: official API (CMR).
 */

import { BaseConnector } from "../base.js";
import { getJson } from "../common.js";

const CMR = "https://cmr.earthdata.nasa.gov/search/collections.json";
const QUERIES = [
  { q: "Tanzania", category: "satellite-remote-sensing", dataType: "Raster", format: "HDF / NetCDF / GeoTIFF" },
  { q: "Tanzania population", category: "population-demographics", dataType: "Raster", format: "HDF / NetCDF" },
  { q: "Tanzania elevation", category: "dem-terrain", dataType: "Raster", format: "HDF / NetCDF" },
  { q: "Tanzania land cover", category: "land-use-land-cover", dataType: "Raster", format: "HDF / NetCDF" },
];

export class NasaConnector extends BaseConnector {
  constructor() {
    super({
      slug: "nasa",
      name: "NASA Earth Science Data",
      shortName: "NASA",
      description:
        "NASA Earth observation data relevant to Tanzania via the official CMR metadata search API.",
      websiteUrl: "https://earthdata.nasa.gov",
      country: "United States",
      type: "Government",
      priority: ["api"],
      rateLimitMs: 2500,
    });
  }

  async discover() {
    return QUERIES.map((q) => ({
      type: "cmr",
      query: q,
      label: `NASA CMR: ${q.q}`,
      url: `${CMR}?keyword=${encodeURIComponent(q.q)}&page_size=8&sort_key=revision_date`,
    }));
  }

  async fetch(target) {
    const json = await getJson(target.url, { source: this.slug, minDelayMs: this.rateLimitMs });
    return { kind: "json", feed: json.feed, query: target.query };
  }

  parse(raw) {
    const entries = raw.feed?.entry || [];
    return entries.map((e) => ({
      title: e.title || "NASA dataset",
      description: (e.summary || "").slice(0, 1200),
      pageUrl: (e.links || []).find((l) => l.rel === "http://esipfed.org/ns/fedsearch/1.0/metadata")?.href || `https://search.earthdata.nasa.gov/search?q=${encodeURIComponent(e.title || "")}`,
      downloadUrl: (e.links || []).find((l) => l.rel === "http://esipfed.org/ns/fedsearch/1.0/data#")?.href || null,
      year: e.revision_date ? Number(e.revision_date.slice(0, 4)) : null,
      format: raw.query.format,
      dataType: raw.query.dataType,
      coverage: "Tanzania / Africa",
      id: e.id,
      category: raw.query.category,
      license: "NASA Earth science data — free and open",
      keywords: (e.data_center ? [e.data_center] : []),
    }));
  }

  async normalize(records, ctx) {
    return records.map((raw) => this.toDataset(raw, ctx));
  }

  toDataset(raw, ctx) {
    const category = ctx.categoryBySlug.get(raw.category);
    return {
      title: raw.title,
      description: raw.description || "NASA Earth observation dataset relevant to Tanzania.",
      categoryId: category?.id || null,
      sourceId: ctx.sourceRow.id,
      coverage: raw.coverage,
      country: "Tanzania",
      region: "Africa",
      year: raw.year,
      dataType: raw.dataType,
      format: raw.format,
      resolution: null,
      license: raw.license,
      accessType: "PUBLIC_DOWNLOAD",
      sourceUrl: raw.pageUrl,
      accessUrl: raw.downloadUrl,
      sourceRecordKey: `nasa:${raw.id}`,
      lastVerified: new Date(),
      status: "DISCOVERED",
      keywords: ["nasa", "earthdata", "satellite", "remote sensing", ...(raw.keywords || [])].map((k) => k.toLowerCase()),
    };
  }
}