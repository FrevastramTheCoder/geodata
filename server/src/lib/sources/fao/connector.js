/**
 * FAO connector.
 *
 * Mechanism: official FAOSTAT data API (www.fao.org/faostat/api) — JSON.
 * Tanzania land use, forestry and agricultural statistics.
 *
 * Priority: official API.
 */

import { BaseConnector } from "../base.js";
import { getJson } from "../common.js";

const FAOSTAT_API = "https://www.fao.org/faostat/api/v1/en/data";
const TZA_AREA = 215; // Tanzania (United Republic of)

const QUERIES = [
  {
    label: "Land Use",
    params: "dataset_code=RL&area_code=215&element_code=5110&item_code=6610&year=2020",
    category: "land-use-land-cover",
    dataType: "Tabular",
  },
  {
    label: "Land Cover",
    params: "dataset_code=LC&area_code=215&element_code=5110&item_code=6929&year=2020",
    category: "land-use-land-cover",
    dataType: "Tabular",
  },
  {
    label: "Forestry",
    params: "dataset_code=FO&area_code=215&element_code=5110&item_code=6620&year=2020",
    category: "environment",
    dataType: "Tabular",
  },
];

export class FaoConnector extends BaseConnector {
  constructor() {
    super({
      slug: "fao",
      name: "Food and Agriculture Organization",
      shortName: "FAO",
      description:
        "FAOSTAT and FAO geospatial data for Tanzania: land use, land cover, forestry, agriculture and water statistics.",
      websiteUrl: "https://www.fao.org",
      country: "International",
      type: "International",
      priority: ["api", "catalog"],
      rateLimitMs: 3000,
    });
  }

  async discover() {
    return QUERIES.map((q) => ({
      type: "faostat",
      query: q,
      label: `FAOSTAT ${q.label}`,
      url: `${FAOSTAT_API}?${q.params}`,
    }));
  }

  async fetch(target) {
    const json = await getJson(target.url, { source: this.slug, minDelayMs: this.rateLimitMs });
    return { kind: "json", data: json, query: target.query };
  }

  parse(raw) {
    const data = raw.data?.data || raw.data?.result || raw.data;
    if (!Array.isArray(data) || !data.length) return [];

    const first = data[0];
    const year = first?.year ? Number(String(first.year).replace(/\D/g, "").slice(0, 4)) : null;

    return [
      {
        title: `FAOSTAT — ${raw.query.label} (Tanzania)`,
        description:
          `Official FAOSTAT statistics for Tanzania: ${raw.query.label}. Item "${first.item || ""}" for area Tanzania (FAOSTAT area code ${TZA_AREA}).`,
        pageUrl: "https://www.fao.org/faostat/en/#data",
        downloadUrl: `${FAOSTAT_API}?${raw.query.params}`,
        year,
        format: "JSON / CSV",
        dataType: raw.query.dataType,
        coverage: "Tanzania",
        id: `faostat-${raw.query.params.split("=")[1]}-${raw.query.category}`,
        category: raw.query.category,
        license: "FAOSTAT data — free to use with attribution",
      },
    ];
  }

  async normalize(records, ctx) {
    return records.map((raw) => this.toDataset(raw, ctx));
  }

  toDataset(raw, ctx) {
    const category = ctx.categoryBySlug.get(raw.category);
    return {
      title: raw.title,
      description: raw.description,
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
      sourceRecordKey: `fao:${raw.id}`,
      lastVerified: new Date(),
      status: "DISCOVERED",
      keywords: ["fao", "faostat", "tanzania", "agriculture", raw.category.replace(/-/g, " ")],
    };
  }
}