/**
 * BaseConnector — the shared pipeline every source connector implements.
 *
 * A connector is a class extending BaseConnector that provides:
 *   discover()  -> discovery targets
 *   fetch()     -> raw data for a target
 *   parse()     -> raw -> raw records
 *   normalize() -> raw records -> CatalogDataset[]
 *
 * BaseConnector provides:
 *   validate()      -> structural validation
 *   deduplicate()   -> dedup by sourceRecordKey (DB-backed)
 *   run()           -> full pipeline: discover, fetch, parse, normalize,
 *                      validate, deduplicate, store + logging
 */

import prisma from "../prisma.js";
import { politeFetch } from "./common.js";

const VALID_STATUSES = new Set([
  "DISCOVERED",
  "PENDING_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "REJECTED",
  "BROKEN_LINK",
]);

export class BaseConnector {
  /**
   * @param {object} config
   * @param {string} config.slug - unique source slug (also registry key)
   * @param {string} config.name - display name, e.g. "National Bureau of Statistics Tanzania"
   * @param {string} config.shortName
   * @param {string} config.description
   * @param {string} config.websiteUrl
   * @param {string} config.country
   * @param {string} config.type - Government | International | NGO | Research | Community
   * @param {string[]} config.priority - ordered list of preferred mechanism ids
   * @param {number} [config.rateLimitMs=1500]
   */
  constructor(config) {
    this.slug = config.slug;
    this.name = config.name;
    this.shortName = config.shortName;
    this.description = config.description;
    this.websiteUrl = config.websiteUrl;
    this.country = config.country;
    this.type = config.type;
    this.priority = config.priority || ["api", "catalog", "rss", "stac", "html"];
    this.rateLimitMs = config.rateLimitMs || 1500;
    this.logs = [];
  }

  /** Subclass hook: return discovery targets. */
  async discover() {
    throw new Error(`${this.slug}: discover() not implemented`);
  }

  /** Subclass hook: fetch raw content for a target. */
  async fetch(target) {
    throw new Error(`${this.slug}: fetch() not implemented`);
  }

  /** Subclass hook: parse raw content into raw records. */
  async parse(raw, target) {
    throw new Error(`${this.slug}: parse() not implemented`);
  }

  /** Subclass hook: normalize raw records into CatalogDataset[]. */
  async normalize(records, ctx) {
    throw new Error(`${this.slug}: normalize() not implemented`);
  }

  /** Shared: fetch helpers. */
  async politeFetch(url, options = {}) {
    return politeFetch(url, options, { source: this.slug, minDelayMs: this.rateLimitMs });
  }

  // ------------------------------------------------------------------
  // Shared pipeline stages
  // ------------------------------------------------------------------

  /** Validate a normalized record; returns { ok, errors }. */
  validate(record) {
    const errors = [];
    if (!record.title || String(record.title).trim().length < 3) errors.push("missing title");
    if (!record.sourceUrl || !/^https?:\/\//.test(record.sourceUrl)) errors.push("missing/invalid sourceUrl");
    if (record.year !== null && record.year !== undefined && !Number.isInteger(record.year)) errors.push("invalid year");
    if (!VALID_STATUSES.has(record.status)) errors.push(`invalid status ${record.status}`);
    if (!["PUBLIC_DOWNLOAD", "DIRECT_DOWNLOAD", "REQUEST", "VIEW"].includes(record.accessType)) errors.push("invalid accessType");
    if (!record.sourceRecordKey) errors.push("missing sourceRecordKey");
    return { ok: errors.length === 0, errors };
  }

  /**
   * Deduplicate a normalized record against the database.
   * Returns "created" | "duplicate" | "updated" | "broken".
   */
  async deduplicate(record, result) {
    const existing = await prisma.dataset.findUnique({
      where: { sourceRecordKey: record.sourceRecordKey },
    });
    if (existing) {
      result.duplicates += 1;
      this.log(`INFO`, `Duplicate skipped: ${record.title} (${record.sourceRecordKey})`);
      await prisma.dataset.update({
        where: { id: existing.id },
        data: {
          lastVerified: record.lastVerified,
          verificationStatus: existing.verificationStatus || "UNKNOWN",
          status: existing.status || "DISCOVERED",
        },
      });
      return "duplicate";
    }
    return "new";
  }

  /**
   * Full pipeline. Subclass hooks are called in order.
   * @returns {Promise<object>} run result with counts and logs
   */
  async run() {
    const result = {
      source: this.name,
      discovered: 0,
      created: 0,
      updated: 0,
      duplicates: 0,
      brokenLinks: 0,
      parseErrors: 0,
      logs: [],
    };

    const run = await prisma.ingestRun.create({
      data: { source: this.name, status: "RUNNING" },
    });

    try {
      const categoryBySlug = new Map(
        (await prisma.category.findMany()).map((c) => [c.slug, c]),
      );
      const sourceRow = await this.getOrCreateSource();

      const targets = await this.discover();
      for (const target of targets) {
        try {
          const raw = await this.fetch(target);
          const records = await this.parse(raw, target);
          result.discovered += records.length;

          const normalized = await this.normalize(records, { categoryBySlug, sourceRow });
          for (const rec of normalized) {
            const validation = this.validate(rec);
            if (!validation.ok) {
              result.parseErrors += 1;
              this.log("ERROR", `Invalid record "${rec.title}": ${validation.errors.join("; ")}`);
              continue;
            }
            const dedup = await this.deduplicate(rec, result);
            if (dedup === "new") {
              const linkOk = await this.checkLink(rec.sourceUrl);
              if (!linkOk) {
                result.brokenLinks += 1;
                this.log("WARN", `Broken/blocked link: ${rec.title} (${rec.sourceUrl})`);
                continue;
              }
              await this.store(rec, run.id);
              result.created += 1;
              this.log("INFO", `Discovered: ${rec.title}`);
            }
          }
        } catch (err) {
          result.parseErrors += 1;
          this.log("ERROR", `${target.label || target.url || target}: ${err.message}`);
        }
      }

      await prisma.ingestRun.update({
        where: { id: run.id },
        data: {
          status: "COMPLETED",
          finishedAt: new Date(),
          discovered: result.discovered,
          created: result.created,
          updated: result.updated,
          duplicates: result.duplicates,
          brokenLinks: result.brokenLinks,
          parseErrors: result.parseErrors,
          log: result.logs,
        },
      });
    } catch (err) {
      await prisma.ingestRun.update({
        where: { id: run.id },
        data: { status: "FAILED", finishedAt: new Date(), log: this.logs },
      });
      this.log("ERROR", `Ingest failed: ${err.message}`);
      throw err;
    }

    for (const entry of this.logs) {
      await prisma.ingestLog.create({ data: { runId: run.id, level: entry.level, message: entry.message } });
    }
    result.logs = this.logs;
    return result;
  }

  log(level, message) {
    this.logs.push({ level, message });
  }

  /**
   * Persist a validated record as DISCOVERED, mapping the canonical
   * CatalogDataset shape onto the database schema.
   */
  async store(rec, runId) {
    const { categoryId, sourceId, ...rest } = rec;
    await prisma.dataset.create({
      data: {
        name: rec.title,
        slug: makeSlug(rec.title, rec.sourceRecordKey),
        description: rec.description,
        categoryId,
        sourceId,
        coverage: rec.coverage,
        country: rec.country,
        region: rec.region,
        year: rec.year,
        dataType: rec.dataType,
        format: rec.format,
        resolution: rec.resolution,
        crs: rec.crs || null,
        license: rec.license,
        accessType: rec.accessType,
        officialUrl: rec.sourceUrl,
        directUrl: rec.accessUrl || null,
        sourceUrl: rec.sourceUrl,
        tags: rec.keywords || [],
        lastVerified: rec.lastVerified,
        verificationStatus: "VERIFIED",
        status: "DISCOVERED",
        ingestRunId: runId,
        sourceRecordKey: rec.sourceRecordKey,
      },
    });
  }

  /** Get or create the Source row for this connector. */
  async getOrCreateSource() {
    let source = await prisma.source.findUnique({ where: { slug: this.slug } });
    if (!source) {
      source = await prisma.source.create({
        data: {
          slug: this.slug,
          name: this.name,
          shortName: this.shortName,
          description: this.description,
          websiteUrl: this.websiteUrl,
          country: this.country,
          type: this.type,
        },
      });
    }
    return source;
  }

  /** Lightweight HEAD/GET availability check. */
  async checkLink(url) {
    try {
      const res = await this.politeFetch(url, { method: "HEAD" });
      if (res.status === 405) {
        const get = await this.politeFetch(url);
        return get.ok;
      }
      return res.ok;
    } catch {
      return false;
    }
  }
}

/** Deterministic URL-safe slug with a short key hash for uniqueness. */
export function makeSlug(title, key) {
  const base = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const hash = String(key || base)
    .split("")
    .reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)
    .toString(36)
    .slice(0, 6);
  return `${base || "dataset"}-${hash}`;
}