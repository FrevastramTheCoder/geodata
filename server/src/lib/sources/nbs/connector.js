/**
 * NBS source connector (National Bureau of Statistics Tanzania).
 *
 * Extends BaseConnector. Uses the most reliable structured source available:
 *  - Official TNADA (NADA) JSON metadata export API for study metadata
 *  - Official NBS website HTML pages (controlled scraping of approved pages)
 *
 * Priority: official API/catalogue > structured download pages > controlled HTML.
 */

import { BaseConnector } from "../base.js";
import { isAllowedByRobots } from "../common.js";
import { NBS_PAGES, NBS_ENDPOINTS, NBS_GIS_STUDIES } from "./discover.js";
import { parseTarget } from "./parser.js";
import { normalizeRecord, SOURCE_SLUG, SOURCE_NAME } from "./normalizer.js";

export class NbsConnector extends BaseConnector {
  constructor() {
    super({
      slug: SOURCE_SLUG,
      name: SOURCE_NAME,
      shortName: "NBS Tanzania",
      description:
        "Official statistics, censuses, surveys and GIS boundary data of Tanzania. Includes TNADA microdata catalogue and census shapefiles.",
      websiteUrl: "https://www.nbs.go.tz",
      country: "Tanzania",
      type: "Government",
      priority: ["api", "catalog", "html"],
      rateLimitMs: 1500,
    });
  }

  /** Discovery targets: approved NBS GIS pages + TNADA study metadata. */
  async discover() {
    const targets = [];

    for (const page of NBS_PAGES) {
      if (await isAllowedByRobots(page.url, this.slug)) {
        targets.push({ type: "page", page, label: page.title });
      }
    }

    for (const study of NBS_GIS_STUDIES) {
      const endpoint = NBS_ENDPOINTS.find((e) => e.metadataExport);
      targets.push({
        type: "study",
        page: endpoint,
        study,
        label: `TNADA study ${study.id}`,
      });
    }

    return targets;
  }

  /** Fetch raw content for a target (HTML page or JSON metadata). */
  async fetch(target) {
    if (target.type === "study") {
      const url = target.page.url.replace("{id}", String(target.study.id));
      const res = await this.politeFetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`Metadata fetch failed (${res.status}) for ${url}`);
      return { kind: "json", url, text: await res.text() };
    }
    const res = await this.politeFetch(target.page.url);
    if (!res.ok) throw new Error(`Page fetch failed (${res.status}) for ${target.page.url}`);
    return { kind: "html", url: target.page.url, text: await res.text() };
  }

  /** Parse raw content into raw records. */
  async parse(raw, target) {
    return parseTarget({
      kind: raw.kind,
      url: raw.url,
      text: raw.text,
      page: target.page,
      study: target.study,
    });
  }

  /** Normalize raw records into CatalogDataset[]. */
  async normalize(records, ctx) {
    return records.map((raw) =>
      normalizeRecord(raw, {
        categoryBySlug: ctx.categoryBySlug,
        sourceRow: ctx.sourceRow,
      }),
    );
  }
}