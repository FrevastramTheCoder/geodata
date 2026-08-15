/**
 * OpenStreetMap connector.
 *
 * Mechanism: official Geofabrik download catalogue (JSON index) — the most
 * reliable structured source for OSM extracts. Tanzania extract + neighbors.
 *
 * Priority: API > catalogue > controlled scraping.
 */

import { BaseConnector } from "../base.js";
import { getJson } from "../common.js";

const GEOFABRIK_INDEX = "https://download.geofabrik.de/index-v1.json";

const REGIONS = [
  { name: "Tanzania", path: "africa/tanzania", label: "Tanzania" },
  { name: "Kenya", path: "africa/kenya", label: "Kenya" },
  { name: "Uganda", path: "africa/uganda", label: "Uganda" },
  { name: "Rwanda", path: "africa/rwanda", label: "Rwanda" },
  { name: "Burundi", path: "africa/burundi", label: "Burundi" },
  { name: "Zambia", path: "africa/zambia", label: "Zambia" },
  { name: "Malawi", path: "africa/malawi", label: "Malawi" },
  { name: "Mozambique", path: "africa/mozambique", label: "Mozambique" },
];

export class OsmConnector extends BaseConnector {
  constructor() {
    super({
      slug: "osm",
      name: "OpenStreetMap",
      shortName: "OSM",
      description:
        "Open collaborative map data. Extracts for Tanzania and East Africa distributed via Geofabrik.",
      websiteUrl: "https://www.openstreetmap.org",
      country: "Global",
      type: "Community",
      priority: ["api", "catalog"],
      rateLimitMs: 2000,
    });
  }

  async discover() {
    return REGIONS.map((r) => ({
      type: "region",
      region: r,
      label: `Geofabrik ${r.label}`,
      url: GEOFABRIK_INDEX,
    }));
  }

  async fetch(target) {
    const index = await getJson(GEOFABRIK_INDEX, { source: this.slug, minDelayMs: this.rateLimitMs });
    return { kind: "json", index, region: target.region };
  }

  parse(raw) {
    const records = [];
    for (const feature of raw.index.features || []) {
      const props = feature.properties || {};
      const tags = props.tags || {};

      const name =
        tags["name:en"] || props.name || raw.region.name || "OSM Extract";

      // Only the target region (e.g. africa/tanzania) plus its files.
      if (!String(tags["iso3166-1:alpha2"] || props.name || "").includes(raw.region.label)) {
        continue;
      }

      const urls = props.urls || {};
      const pbf = urls.pbf || null;
      const shp = urls.shp || urls["shp.zip"] || null;
      const geofabrikPage = `https://download.geofabrik.de/${raw.region.path}.html`;

      records.push({
        title: `${name} — OpenStreetMap Extract`,
        description:
          "Full OSM extract for the region: roads, buildings, land use, water and points of interest. Updated daily by Geofabrik.",
        pageUrl: geofabrikPage,
        downloadUrl: pbf,
        year: new Date(props.timestamp || Date.now()).getFullYear(),
        format: "PBF (OSM), SHP",
        dataType: "Vector",
        coverage: raw.region.label,
        id: `geofabrik:${raw.region.path}`,
        accessUrlNote: shp ? `Shapefile also available: ${shp}` : null,
      });
    }
    return records;
  }

  async normalize(records, ctx) {
    return records.map((raw) => this.toDataset(raw, ctx));
  }

  toDataset(raw, ctx) {
    const category = ctx.categoryBySlug.get("transport-infrastructure");
    const license =
      "ODbL 1.0 (Open Database License) — © OpenStreetMap contributors";
    return {
      title: raw.title,
      description: raw.description,
      categoryId: category?.id || null,
      sourceId: ctx.sourceRow.id,
      coverage: raw.coverage,
      country: raw.coverage,
      region: raw.coverage,
      year: raw.year,
      dataType: raw.dataType,
      format: raw.format,
      resolution: null,
      license,
      accessType: "PUBLIC_DOWNLOAD",
      sourceUrl: raw.pageUrl,
      accessUrl: raw.downloadUrl,
      sourceRecordKey: `osm:${raw.id}`,
      lastVerified: new Date(),
      status: "DISCOVERED",
      keywords: ["openstreetmap", "roads", "buildings", "land use", raw.coverage.toLowerCase()],
    };
  }
}