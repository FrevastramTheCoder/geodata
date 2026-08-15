/**
 * NBS source discovery.
 *
 * Discovers official, publicly accessible NBS GIS / geospatial resource
 * pages. Prefers official NBS endpoints. Respects robots.txt, rate limits
 * and access restrictions. Does NOT crawl the whole site — only a curated
 * allowlist of GIS-related pages plus official catalogue/API endpoints.
 */

/**
 * Official NBS GIS/geospatial pages discovered via inspection of the NBS
 * website (nbs.go.tz). Each entry is an approved, public page.
 */
export const NBS_PAGES = [
  {
    id: "nbs-gis",
    title: "NBS Geographic Information System (GIS)",
    url: "https://www.nbs.go.tz/statistics/geographic-information-system-gis",
    description:
      "Overview of NBS GIS activities: census mapping, digitization and spatial analysis since 2002.",
  },
  {
    id: "nbs-shapefiles",
    title: "NBS Shapefiles (Administrative Boundaries)",
    url: "https://www.nbs.go.tz/statistics/topic/gis",
    description:
      "Official NBS shapefile catalogue: regional, district and ward boundaries from the 2012 and 2022 Population and Housing Censuses.",
  },
];

/**
 * Official NBS catalogue / API endpoints.
 * TNADA (microdata.nbs.go.tz) is a NADA instance; metadata JSON exports are
 * the official machine-readable endpoint for study metadata.
 */
export const NBS_ENDPOINTS = [
  {
    id: "tnada-catalog",
    title: "Tanzania National Data Archive (TNADA) — Central Data Catalog",
    url: "https://microdata.nbs.go.tz/index.php/catalog",
    description:
      "Official NBS microdata catalogue (NADA). Browse census and survey studies and metadata.",
  },
  {
    id: "tnada-metadata-json",
    title: "TNADA Study Metadata (JSON export)",
    url: "https://microdata.nbs.go.tz/index.php/metadata/export/{id}/json",
    description:
      "Official JSON metadata export endpoint for a single TNADA study (NADA DDI JSON).",
    metadataExport: true,
  },
];

/** Approved NBS study IDs in TNADA with geospatial relevance. */
export const NBS_GIS_STUDIES = [
  {
    id: 49,
    title: "Tanzania - Region Shapefile Metadata 2022 Census",
    refId: "TZA-NBS-PHC-2020-SHAPEFILESV01",
    catalogUrl: "https://microdata.nbs.go.tz/index.php/catalog/49",
  },
];