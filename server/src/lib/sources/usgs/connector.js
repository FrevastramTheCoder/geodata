/**
 * USGS connector.
 *
 * Mechanism: official USGS ScienceBase catalog API (sciencebase.gov/catalog)
 * — JSON, documented. Tanzania-relevant earth science datasets.
 *
 * Priority: official API (ScienceBase). EarthExplorer (requires login) is
 * listed as a manual access route only.
 */

import { BaseConnector } from "../base.js";
import { getJson } from "../common.js";

const SB_API = "https://www.sciencebase.gov/catalog/items";
const QUERIES = [
  { q: "Tanzania", category: "soil-geology", dataType: "Vector / Tabular", format: "Shapefile / GeoJSON / CSV" },
  { q: "Tanzania geology", category: "soil-geology", dataType: "Vector / Tabular", format: "Shapefile / GeoJSON / CSV" },
  { q: "Tanzania hydrology", category: "hydrology", dataType: "Vector / Tabular", format: "Shapefile / GeoJSON / CSV" },
  { q: "Tanzania elevation", category: "dem-terrain", dataType: "Raster", format: "GeoTIFF" },
];

export class UsgsConnector extends BaseConnector {
  constructor() {
    super({
      slug: "usgs",
      name: "United States Geological Survey",
      shortName: "USGS",
      description:
        "USGS earth science data relevant to Tanzania: geology, water, elevation and hazards, via the official ScienceBase API.",
      websiteUrl: "https://www.usgs.gov",
      country: "United States",
      type: "Government",
      priority: ["api", "catalog"],
      rateLimitMs: 2500,
    });
  }

  async discover() {
    return QUERIES.map((q) => ({
      type: "sciencebase",
      query: q,
      label: `USGS ScienceBase: ${q.q}`,
      url: `${SB_API}?format=json&q=${encodeURIComponent(q.q)}&max=8`,
    }));
  }

  async fetch(target) {
    const json = await getJson(target.url, { source: this.slug, minDelayMs: this.rateLimitMs });
    return { kind: "json", items: json.items || [], query: target.query };
  }

  parse(raw) {
    return raw.items.map((it) => {
      const links = it.webLinks || [];
      const detailUrl =
        links.find((l) => /html$/i.test(l.uri || ""))?.uri ||
        `https://www.sciencebase.gov/catalog/item/${it.id}`;
      const download =
        links.find((l) => l.type === "download")?.uri ||
        links.find((l) => /\.(zip|shp|tif|tiff|csv|geojson|json)$/i.test(l.uri || ""))?.uri ||
        null;

      return {
        title: it.title || "USGS ScienceBase item",
        description: (it.summary || "").slice(0, 1200),
        pageUrl: detailUrl,
        downloadUrl: download,
        year: it.datePublished ? Number(String(it.datePublished).slice(0, 4)) : null,
        format: raw.query.format,
        dataType: raw.query.dataType,
        coverage: "Tanzania / Africa",
        id: it.id,
        category: raw.query.category,
        license: "USGS data — public domain (unless noted)",
      };
    });
  }

  async normalize(records, ctx) {
    return records.map((raw) => this.toDataset(raw, ctx));
  }

  toDataset(raw, ctx) {
    const category = ctx.categoryBySlug.get(raw.category);
    return {
      title: raw.title,
      description: raw.description || "USGS ScienceBase dataset relevant to Tanzania.",
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
      sourceRecordKey: `usgs:${raw.id}`,
      lastVerified: new Date(),
      status: "DISCOVERED",
      keywords: ["usgs", "sciencebase", "geology", "earth science", "tanzania"],
    };
  }
}