/**
 * Type definitions for the NBS source connector (JSDoc typedefs).
 *
 * These mirror the normalized catalog record shape used across the
 * discover -> parse -> normalize -> validate -> dedupe -> store pipeline.
 */

/**
 * A raw record extracted from a source page/API before normalization.
 * @typedef {Object} RawNbsRecord
 * @property {string} title
 * @property {string} [description]
 * @property {string} pageUrl
 * @property {string} [downloadUrl]
 * @property {string} [date] - display date / publish date string
 * @property {number} [year]
 * @property {string} [format] - e.g. "Shapefile", "ZIP", "JSON"
 * @property {string} [dataType]
 * @property {string} [coverage] - e.g. "Tanzania"
 * @property {string} [id] - stable identifier if the source provides one
 */

/**
 * Normalized catalog record, ready for validation and storage.
 * @typedef {Object} NormalizedNbsRecord
 * @property {string} name
 * @property {string} description
 * @property {string} categoryId
 * @property {string} sourceId
 * @property {string} coverage
 * @property {string} country
 * @property {number|null} year
 * @property {string} dataType
 * @property {string} format
 * @property {string|null} resolution
 * @property {string} license
 * @property {string} accessType - "PUBLIC_DOWNLOAD" | "DIRECT_DOWNLOAD" | "REQUEST" | "VIEW"
 * @property {string} officialUrl
 * @property {string|null} directUrl
 * @property {string} sourceUrl
 * @property {string} sourceRecordKey - dedup key (unique per record)
 * @property {Date} lastVerified
 * @property {string} status - always "DISCOVERED" at ingest time
 */

/**
 * Result of a full ingestion run.
 * @typedef {Object} IngestResult
 * @property {number} discovered
 * @property {number} created
 * @property {number} updated
 * @property {number} duplicates
 * @property {number} brokenLinks
 * @property {number} parseErrors
 * @property {Array<{level:string,message:string}>} logs
 */

export {};