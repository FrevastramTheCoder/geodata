/**
 * Common Dataset interface shared by every source connector.
 *
 * Every connector's normalize() output must conform to this shape before
 * validation and storage.
 *
 * @typedef {Object} CatalogDataset
 * @property {string} title - dataset title
 * @property {string} description
 * @property {string} category - category slug (see seed CATEGORIES)
 * @property {string} source - source slug (registry key)
 * @property {string} sourceUrl - page the record was discovered from
 * @property {string|null} accessUrl - direct access/download URL (nullable)
 * @property {string} coverage - geographic coverage (e.g. "Tanzania")
 * @property {string} country
 * @property {string} region
 * @property {number|null} year
 * @property {string} dataType - e.g. "Vector (Polygon)", "Raster", "Tabular"
 * @property {string} format - e.g. "Shapefile", "GeoTIFF", "CSV"
 * @property {string|null} resolution
 * @property {string} license - access/license information
 * @property {string} accessType - "PUBLIC_DOWNLOAD" | "DIRECT_DOWNLOAD" | "REQUEST" | "VIEW"
 * @property {string[]} keywords
 * @property {Date} lastVerified
 * @property {string} status - always "DISCOVERED" at ingest time
 * @property {string} sourceRecordKey - stable dedup key (unique per record)
 * @property {string|null} id - connector-provided stable id (if any)
 */

export {};

/**
 * Status workflow for ingested records.
 * Records are NEVER published automatically:
 *   DISCOVERED -> PENDING_REVIEW -> APPROVED -> PUBLISHED
 */
export const STATUS_FLOW = [
  "DISCOVERED",
  "PENDING_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "REJECTED",
  "BROKEN_LINK",
];