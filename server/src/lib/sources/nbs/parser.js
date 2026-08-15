/**
 * NBS parser.
 *
 * Parses raw HTML from approved NBS pages and JSON metadata exports from
 * the TNADA (NADA) catalogue into raw record objects.
 *
 * Only extracts publicly available metadata — never downloads or stores
 * microdata, and never copies copyrighted/restricted datasets.
 */

/** Extract the most recent 4-digit year from text. */
export function extractYear(text) {
  if (!text) return null;
  const years = [...String(text).matchAll(/(19|20)\d{2}/g)].map((m) => Number(m[0]));
  if (!years.length) return null;
  return Math.max(...years);
}

/**
 * Parse raw content fetched by the connector into raw records.
 * Handles both HTML pages and TNADA JSON metadata exports.
 * @param {object} opts - { kind: "html"|"json", url, text, page, study }
 * @returns {Array<object>}
 */
export function parseTarget({ kind, url, text, page, study }) {
  if (kind === "json") {
    return parseStudyMetadata(text, { ...study, metadataUrl: url });
  }
  if (page?.id === "nbs-shapefiles") {
    return parseShapefilesPage(text, page);
  }
  if (page?.id === "nbs-gis") {
    return parseGisOverviewPage(text, page);
  }
  return [];
}

/**
 * Parse the NBS Shapefiles topic page (nbs.go.tz/statistics/topic/gis).
 * Extracts official direct download links (public shapefile ZIPs).
 * @param {string} html
 * @param {object} page
 * @returns {Array<object>}
 */
export function parseShapefilesPage(html, page) {
  const records = [];
  const linkRe =
    /<a href="(https:\/\/www\.nbs\.go\.tz\/uploads\/statistics\/documents\/[^"]+)"[^>]*>(.*?)<\/a>/gs;

  let match;
  while ((match = linkRe.exec(html)) !== null) {
    const [, url, inner] = match;
    const titleMatch = inner.match(/<div>\s*(.*?)\s*<\/div>/s);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
      : decodeUrlTitle(url);

    const dateMatch = inner.match(/<div class="fs-08em bold-600">\s*(.*?)\s*<\/div>/s);
    const dateStr = dateMatch ? dateMatch[1].trim() : "";

    records.push({
      title,
      description:
        "Official NBS administrative boundary shapefiles distributed for public use from the NBS website.",
      pageUrl: page.url,
      downloadUrl: url,
      date: dateStr,
      year: extractYear(dateStr),
      format: "Shapefile (ZIP)",
      dataType: "Vector (Polygon)",
      coverage: "Tanzania",
    });
  }
  return records;
}

/**
 * Parse a TNADA study metadata JSON export into a single raw record.
 * @param {string} jsonText
 * @param {object} study
 * @returns {Array<object>}
 */
export function parseStudyMetadata(jsonText, study) {
  try {
    const meta = JSON.parse(jsonText);
    const doc = meta.document || meta;
    const title =
      doc.title ||
      doc.title_statement?.title ||
      doc.idno ||
      study.title ||
      "NBS Study";

    const year = extractYear(
      (doc.year || "") +
        " " +
        (doc.title_statement?.subtitle || "") +
        " " +
        (doc.study_desc?.coll_dates?.coll_date?.[0]?.start || ""),
    );

    const description =
      doc.abstract ||
      doc.title_statement?.subtitle ||
      doc.ver_statement?.ver_notes ||
      "NBS official study metadata (TNADA).";

    const type =
      doc.data_processing?.kind_of_data ||
      doc.study_desc?.data_processing?.kind_of_data ||
      "";

    const geography = extractGeographicCoverage(doc);

    return [
      {
        title,
        description,
        pageUrl: study.catalogUrl || meta.catalog_url || study.metadataUrl,
        // A catalogue record is not proof that a microdata download is public.
        // Keep the official catalogue page as the access path until NBS exposes
        // an explicit, verified download URL.
        downloadUrl: null,
        year,
        format: doc.data_files?.dct || "Metadata (DDI/JSON)",
        dataType: type || "Administrative records",
        coverage: geography,
        id: study.refId || doc.idno || String(study.id),
      },
    ];
  } catch (err) {
    throw new Error(`Failed to parse TNADA metadata JSON: ${err.message}`);
  }
}

/**
 * Parse the NBS GIS overview page into a single resource record.
 * @param {string} html
 * @param {object} page
 * @returns {Array<object>}
 */
export function parseGisOverviewPage(html, page) {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : page.title;
  const paraMatch = html.match(/<p[^>]*>([^<]{80,400})<\/p>/);
  return [
    {
      title,
      description: paraMatch ? paraMatch[1].trim() : page.description,
      pageUrl: page.url,
      downloadUrl: null,
      year: 2002,
      format: "Web / Portal",
      dataType: "GIS service",
      coverage: "Tanzania",
    },
  ];
}

function decodeUrlTitle(url) {
  const name = decodeURIComponent(url.split("/").pop() || "NBS Shapefile");
  return name.replace(/\.(zip|rar|7z|tar|gz|shp|json)$/i, "").replace(/[_-]+/g, " ");
}

function extractGeographicCoverage(doc) {
  const geo =
    doc.geog_cover ||
    doc.study_desc?.geog_cover ||
    doc.study_desc?.geog_coverage ||
    "";
  const text = Array.isArray(geo) ? geo.join(" ") : String(geo || "");
  if (/tanzania|national|mainland/i.test(text)) return "Tanzania";
  if (/zanzibar/i.test(text)) return "Zanzibar";
  if (text.trim()) return text.trim();
  return "Tanzania";
}
