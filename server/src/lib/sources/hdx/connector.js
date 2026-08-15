/**
 * Humanitarian Data Exchange (HDX) connector.
 *
 * Mechanism: official CKAN API (data.humdata.org/api/3/action/package_search)
 * — structured, JSON, searchable. Filtered to Tanzania geospatial datasets.
 *
 * Priority: official API.
 */

import { BaseConnector } from "../base.js";
import { getJson } from "../common.js";

const HDX_API = "https://data.humdata.org/api/3/action/package_search";
const TANZANIA_QUERIES = [
  "tanzania cod",
  "tanzania shapefile",
  "tanzania geospatial",
  "tanzania boundary",
  "tanzania population",
  "tanzania roads",
  "tanzania flood",
];

export class HdxConnector extends BaseConnector {
  constructor() {
    super({
      slug: "hdx",
      name: "Humanitarian Data Exchange",
      shortName: "HDX",
      description:
        "Humanitarian data platform (OCHA). Tanzania subnational boundaries (COD), population and risk datasets.",
      websiteUrl: "https://data.humdata.org",
      country: "Global",
      type: "NGO",
      priority: ["api"],
      rateLimitMs: 2500,
    });
  }

  async discover() {
    return TANZANIA_QUERIES.map((query) => ({
      type: "search",
      query,
      label: `HDX search: ${query}`,
      url: HDX_API,
    }));
  }

  async fetch(target) {
    const url = `${HDX_API}?q=${encodeURIComponent(target.query)}&rows=10`;
    const data = await getJson(url, { source: this.slug, minDelayMs: this.rateLimitMs });
    return { kind: "json", results: data.result?.results || [] };
  }

  parse(raw) {
    return raw.results.map((pkg) => ({
      title: pkg.title || pkg.name,
      description: pkg.notes || "",
      pageUrl: `https://data.humdata.org/dataset/${pkg.name}`,
      downloadUrl: pkg.resources?.[0]?.url || null,
      year: extractYear(pkg.metadata_modified || pkg.metadata_created),
      format: (pkg.resources || []).map((r) => r.format).filter(Boolean).join(", ") || "Web",
      dataType: "Tabular / Vector",
      coverage: "Tanzania",
      id: pkg.id,
      license: pkg.license_title || "See source",
      tags: (pkg.tags || []).map((t) => t.name),
      org: pkg.organization?.title || "HDX",
    }));
  }

  async normalize(records, ctx) {
    return records.map((raw) => this.toDataset(raw, ctx));
  }

  toDataset(raw, ctx) {
    const category =
      ctx.categoryBySlug.get("administrative-boundaries") ||
      ctx.categoryBySlug.get("disaster-risk");
    const tags = (raw.tags || []).concat(["hdx", "humanitarian", "tanzania"]).slice(0, 12);
    return {
      title: raw.title,
      description: raw.description || "Tanzania dataset from the Humanitarian Data Exchange (HDX).",
      categoryId: category?.id || null,
      sourceId: ctx.sourceRow.id,
      coverage: raw.coverage,
      country: "Tanzania",
      region: "Tanzania",
      year: raw.year,
      dataType: raw.dataType,
      format: raw.format,
      resolution: null,
      license: raw.license,
      accessType: "PUBLIC_DOWNLOAD",
      sourceUrl: raw.pageUrl,
      accessUrl: raw.downloadUrl,
      sourceRecordKey: `hdx:${raw.id}`,
      lastVerified: new Date(),
      status: "DISCOVERED",
      keywords: tags.map((t) => t.toLowerCase()),
    };
  }
}

function extractYear(text) {
  if (!text) return null;
  const years = [...String(text).matchAll(/(19|20)\d{2}/g)].map((m) => Number(m[0]));
  return years.length ? Math.max(...years) : null;
}