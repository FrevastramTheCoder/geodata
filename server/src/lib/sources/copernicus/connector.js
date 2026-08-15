/**
 * Copernicus (ESA / EU) connector.
 *
 * Mechanism: official Copernicus Data Space Ecosystem STAC API —
 * catalogue.dataspace.copernicus.eu/stac. Standard STAC search (GET),
 * reliable, JSON.
 *
 * Priority: official STAC API.
 */

import { BaseConnector } from "../base.js";
import { getJson } from "../common.js";

const STAC = "https://catalogue.dataspace.copernicus.eu/stac/search";
const TANZANIA_BBOX = "29,-12,41,-0.5";

const COLLECTIONS = [
  { id: "sentinel-2-l2a", label: "Sentinel-2 L2A", category: "satellite-remote-sensing", format: "JPEG2000 / SAFE", dataType: "Raster", resolution: "10m" },
  { id: "sentinel-1-grd", label: "Sentinel-1 GRD SAR", category: "satellite-remote-sensing", format: "SAFE / GeoTIFF", dataType: "Raster", resolution: "10m" },
  { id: "sentinel-3-slstr-l2", label: "Sentinel-3 SLSTR L2", category: "climate-weather", format: "NetCDF", dataType: "Raster", resolution: "1km" },
];

export class CopernicusConnector extends BaseConnector {
  constructor() {
    super({
      slug: "copernicus",
      name: "Copernicus (European Space Agency)",
      shortName: "Copernicus / ESA",
      description:
        "Copernicus Sentinel satellite data for Tanzania via the official Data Space Ecosystem STAC API.",
      websiteUrl: "https://dataspace.copernicus.eu",
      country: "Europe",
      type: "International",
      priority: ["stac", "api"],
      rateLimitMs: 2500,
    });
  }

  async discover() {
    return COLLECTIONS.map((c) => ({
      type: "stac",
      collection: c,
      label: `Copernicus STAC: ${c.label}`,
      url: `${STAC}?collections=${c.id}&bbox=${TANZANIA_BBOX}&limit=3&sortby=-properties.datetime`,
    }));
  }

  async fetch(target) {
    const json = await getJson(target.url, { source: this.slug, minDelayMs: this.rateLimitMs });
    return { kind: "json", json, collection: target.collection };
  }

  parse(raw) {
    const features = raw.json?.features || [];
    return features.map((f) => ({
      title: `${raw.collection.label} — Tanzania Scene ${f.id.slice(0, 12)}`,
      description: `Copernicus Sentinel ${raw.collection.label} scene covering Tanzania (${new Date(f.properties?.datetime || Date.now()).toISOString().slice(0, 10)}). Available via the official Data Space Ecosystem.`,
      pageUrl: `https://browser.dataspace.copernicus.eu/?view=scene&productId=${f.id}`,
      downloadUrl: `https://catalogue.dataspace.copernicus.eu/odata/v1/Products('${f.id}')/$value`,
      year: f.properties?.datetime ? Number(f.properties.datetime.slice(0, 4)) : null,
      format: raw.collection.format,
      dataType: raw.collection.dataType,
      resolution: raw.collection.resolution,
      coverage: "Tanzania",
      id: f.id,
      category: raw.collection.category,
      license: "Copernicus Sentinel data — free and open (CC BY-SA 4.0)",
    }));
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
      resolution: raw.resolution,
      license: raw.license,
      accessType: "PUBLIC_DOWNLOAD",
      sourceUrl: raw.pageUrl,
      accessUrl: raw.downloadUrl,
      sourceRecordKey: `copernicus:${raw.id}`,
      lastVerified: new Date(),
      status: "DISCOVERED",
      keywords: ["copernicus", "sentinel", "esa", "satellite", "remote sensing", "tanzania"],
    };
  }
}