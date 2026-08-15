/**
 * WorldPop connector.
 *
 * Mechanism: official WorldPop REST API (worldpop.org/rest) — JSON.
 * Tanzania gridded population and demographic datasets.
 *
 * Priority: official API.
 */

import { BaseConnector } from "../base.js";
import { getJson } from "../common.js";

const WORLDPOP_REST = "https://www.worldpop.org/rest";

export class WorldPopConnector extends BaseConnector {
  constructor() {
    super({
      slug: "worldpop",
      name: "WorldPop",
      shortName: "WorldPop",
      description:
        "High-resolution gridded population estimates and demographic projections for Tanzania (100m rasters).",
      websiteUrl: "https://www.worldpop.org",
      country: "International",
      type: "Research",
      priority: ["api"],
      rateLimitMs: 2500,
    });
  }

  async discover() {
    return [
      { type: "pop", url: `${WORLDPOP_REST}/data/pop/pop?iso3=TZA`, label: "WorldPop population (TZA)" },
      { type: "ppp", url: `${WORLDPOP_REST}/data/ppp/ppp?iso3=TZA`, label: "WorldPop poverty (TZA)" },
      { type: "uph", url: `${WORLDPOP_REST}/data/uph/uph?iso3=TZA`, label: "WorldPop urban population (TZA)" },
    ];
  }

  async fetch(target) {
    const json = await getJson(target.url, { source: this.slug, minDelayMs: this.rateLimitMs });
    return { kind: "json", data: json, type: target.type };
  }

  parse(raw) {
    const list = Array.isArray(raw.data) ? raw.data : raw.data?.data;
    if (!Array.isArray(list)) return [];

    const products = [
      { id: "pop", title: "Population Count", desc: "Unconstrained individual countries 100m resolution population count grids" },
      { id: "ppp", title: "Poverty (PPP)", desc: "Poverty probability surface grids" },
      { id: "uph", title: "Urban Population", desc: "Urban population distribution grids" },
    ].filter((p) => p.id === raw.type);

    const nameByType = {
      pop: "Population Count",
      ppp: "Poverty Probability",
      uph: "Urban Population",
    };

    return list.slice(0, 5).map((item) => ({
      title: `WorldPop — ${nameByType[raw.type]} (Tanzania, ${item.release || ""})`,
      description:
        (item.release ? `WorldPop release: ${item.release}. ` : "") +
        `High-resolution 100m gridded ${nameByType[raw.type].toLowerCase()} estimates for Tanzania (UN-adjusted).`,
      pageUrl: "https://www.worldpop.org/geodata",
      downloadUrl: item.zip || null,
      year: item.release ? Number(String(item.release).slice(0, 4)) : null,
      format: "GeoTIFF",
      dataType: "Raster",
      coverage: "Tanzania",
      id: `worldpop-${raw.type}-${item.release || "latest"}`,
      license: "CC BY 4.0 — WorldPop",
    }));
  }

  async normalize(records, ctx) {
    return records.map((raw) => this.toDataset(raw, ctx));
  }

  toDataset(raw, ctx) {
    const category = ctx.categoryBySlug.get("population-demographics");
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
      resolution: "100m",
      license: raw.license,
      accessType: "PUBLIC_DOWNLOAD",
      sourceUrl: raw.pageUrl,
      accessUrl: raw.downloadUrl,
      sourceRecordKey: `worldpop:${raw.id}`,
      lastVerified: new Date(),
      status: "DISCOVERED",
      keywords: ["worldpop", "population", "raster", "tanzania", "100m", "demographics"],
    };
  }
}