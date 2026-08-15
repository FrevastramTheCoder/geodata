/**
 * World Bank connector.
 *
 * Mechanism: official World Bank Indicators API (api.worldbank.org) — JSON,
 * stable, documented. Tanzania-relevant development & geospatial indicators.
 *
 * Priority: official API.
 */

import { BaseConnector } from "../base.js";
import { getJson } from "../common.js";

const API = "https://api.worldbank.org/v2/country/TZA/indicator";

const INDICATORS = [
  { code: "SP.POP.TOTL", title: "Population, total", category: "population-demographics", dataType: "Tabular", format: "JSON / CSV" },
  { code: "EN.POP.DNST", title: "Population density", category: "population-demographics", dataType: "Tabular", format: "JSON / CSV" },
  { code: "SP.URB.TOTL.IN.ZS", title: "Urban population (% of total)", category: "urban-regional-planning", dataType: "Tabular", format: "JSON / CSV" },
  { code: "AG.LND.AGRI.ZS", title: "Agricultural land (% of land area)", category: "agriculture", dataType: "Tabular", format: "JSON / CSV" },
  { code: "AG.LND.FRST.ZS", title: "Forest area (% of land area)", category: "environment", dataType: "Tabular", format: "JSON / CSV" },
  { code: "AG.LND.ARBL.ZS", title: "Arable land (% of land area)", category: "land-use-land-cover", dataType: "Tabular", format: "JSON / CSV" },
  { code: "EN.ATM.CO2E.PC", title: "CO2 emissions (metric tons per capita)", category: "environment", dataType: "Tabular", format: "JSON / CSV" },
  { code: "IS.ROD.DNST.K2", title: "Road density (km per 100 sq. km of land area)", category: "transport-infrastructure", dataType: "Tabular", format: "JSON / CSV" },
  { code: "SH.STA.WASH.ZS", title: "People using safely managed drinking water services (%)", category: "hydrology", dataType: "Tabular", format: "JSON / CSV" },
];

export class WorldBankConnector extends BaseConnector {
  constructor() {
    super({
      slug: "worldbank",
      name: "World Bank",
      shortName: "World Bank",
      description:
        "Development indicators and spatial data for Tanzania via the official World Bank Open Data API.",
      websiteUrl: "https://data.worldbank.org",
      country: "International",
      type: "International",
      priority: ["api"],
      rateLimitMs: 2500,
    });
  }

  async discover() {
    return INDICATORS.map((ind) => ({
      type: "indicator",
      indicator: ind,
      label: `World Bank indicator: ${ind.code}`,
      url: `${API}/${ind.code}?format=json&per_page=10&date=2010:2024`,
    }));
  }

  async fetch(target) {
    const json = await getJson(target.url, { source: this.slug, minDelayMs: this.rateLimitMs });
    return { kind: "json", data: json, indicator: target.indicator };
  }

  parse(raw) {
    if (!Array.isArray(raw.data) || raw.data.length < 2) return [];
    const rows = raw.data[1] || [];
    if (!rows.length) return [];

    const latest = rows
      .filter((r) => r && r.value !== null && r.value !== undefined)
      .sort((a, b) => Number(b.date) - Number(a.date))[0];

    return [
      {
        title: `${raw.indicator.title} — Tanzania (World Bank)`,
        description:
          `World Bank development indicator ${raw.indicator.code} for Tanzania, latest value ${latest.value} (${latest.date}). Official World Bank Open Data.`,
        pageUrl: `https://data.worldbank.org/indicator/${raw.indicator.code}?locations=TZ`,
        downloadUrl: `${API}/${raw.indicator.code}?format=json&per_page=100&date=1960:2024`,
        year: Number(latest.date),
        format: raw.indicator.format,
        dataType: raw.indicator.dataType,
        coverage: "Tanzania",
        id: raw.indicator.code,
        category: raw.indicator.category,
        license: "CC BY 4.0 — World Bank Open Data",
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
      sourceRecordKey: `worldbank:${raw.id}`,
      lastVerified: new Date(),
      status: "DISCOVERED",
      keywords: ["world bank", "tanzania", "statistics", raw.category.replace(/-/g, " ")],
    };
  }
}