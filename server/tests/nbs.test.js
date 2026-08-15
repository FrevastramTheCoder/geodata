import { test } from "node:test";
import assert from "node:assert/strict";

import { parseShapefilesPage, extractYear, parseStudyMetadata } from "../src/lib/sources/nbs/parser.js";
import { normalizeRecord, buildDedupKey, inferCategorySlug } from "../src/lib/sources/nbs/normalizer.js";

const SAMPLE_SHAPEFILES_HTML = `
<div class="col px-0 pb-2 move-up">
  <div class="d-flex align-items-center bg-light box-shadow rounded-slight hover-bg h-100 w-100 p-2 pointer-hover position-relative">
    <a href="https://www.nbs.go.tz/uploads/statistics/documents/en-1714652282-TANZANIA_2022PHC_WARD_SHAPEFILES.zip" target="_blank" class="d-flex w-100 list-item align-items-center">
      <i class="fa fa-angle-double-right px-2 pr-3 text-faded text-secondary align-self-center"></i>
      <i class="fa fa-file-pdf px-2 pr-3 text-muted align-self-center"></i>
      <span class="d-inline-block text-gray">
      <div class="fs-08em bold-600"> 12 April, 2024 </div>
      <div> 2022 Population and Housing Census - Tanzania Wards (Shapefiles) </div>
    </span>
    </a>
  </div>
</div>
`;

const SAMPLE_NADA_JSON = JSON.stringify({
  document: {
    title: "Tanzania - Region Shapefile Metadata 2022 Census",
    idno: "TZA-NBS-PHC-2020-SHAPEFILESV01",
    abstract: "Geographical reference for the ward areas used in the 2022 PHC.",
    year: "2020 - 2022",
    geog_cover: "National Coverage",
    data_files: { dct: "Shapefile" },
  },
});

test("parseShapefilesPage extracts title, URL, date and year", () => {
  const recs = parseShapefilesPage(SAMPLE_SHAPEFILES_HTML, { url: "https://www.nbs.go.tz/statistics/topic/gis" });
  assert.equal(recs.length, 1);
  assert.equal(recs[0].title, "2022 Population and Housing Census - Tanzania Wards (Shapefiles)");
  assert.equal(recs[0].downloadUrl, "https://www.nbs.go.tz/uploads/statistics/documents/en-1714652282-TANZANIA_2022PHC_WARD_SHAPEFILES.zip");
  assert.equal(recs[0].year, 2024);
});

test("extractYear finds 4-digit years", () => {
  assert.equal(extractYear("12 April, 2024"), 2024);
  assert.equal(extractYear("17 January, 2012"), 2012);
  assert.equal(extractYear("no year here"), null);
});

test("parseStudyMetadata parses TNADA JSON export", () => {
  const rec = parseStudyMetadata(SAMPLE_NADA_JSON, { catalogUrl: "https://microdata.nbs.go.tz/index.php/catalog/49" });
  assert.equal(rec.length, 1);
  assert.equal(rec[0].title, "Tanzania - Region Shapefile Metadata 2022 Census");
  assert.equal(rec[0].coverage, "Tanzania");
  assert.equal(rec[0].year, 2022);
});

test("normalizeRecord produces a valid catalog shape with DISCOVERED status", () => {
  const categoryBySlug = new Map([
    ["administrative-boundaries", { id: "cat-1", slug: "administrative-boundaries" }],
    ["population-demographics", { id: "cat-2", slug: "population-demographics" }],
  ]);
  const sourceRow = { id: "src-1" };
  const raw = {
    title: "2022 PHC Ward Shapefiles",
    description: "Tanzania wards",
    pageUrl: "https://www.nbs.go.tz/statistics/topic/gis",
    downloadUrl: "https://www.nbs.go.tz/uploads/statistics/documents/x.zip",
    year: 2022,
    format: "Shapefile (ZIP)",
    dataType: "Vector (Polygon)",
    coverage: "Tanzania",
  };
  const rec = normalizeRecord(raw, { categoryBySlug, sourceRow });
  assert.equal(rec.status, "DISCOVERED");
  assert.equal(rec.sourceId, "src-1");
  assert.equal(rec.country, "Tanzania");
  assert.equal(rec.accessType, "DIRECT_DOWNLOAD");
  assert.ok(rec.sourceRecordKey.startsWith("nbs:"));
  assert.equal(rec.lastVerified instanceof Date, true);
});

test("buildDedupKey is stable and URL-based", () => {
  const a = buildDedupKey({ downloadUrl: "https://www.nbs.go.tz/uploads/x.zip", title: "X" });
  const b = buildDedupKey({ downloadUrl: "https://www.nbs.go.tz/uploads/x.zip", title: "X" });
  assert.equal(a, b);
  assert.ok(a.includes("nbs:"));
});

test("inferCategorySlug maps boundaries keywords", () => {
  assert.equal(inferCategorySlug({ title: "2022 Census Ward Boundaries", description: "" }), "administrative-boundaries");
  assert.equal(inferCategorySlug({ title: "Population projection", description: "census" }), "population-demographics");
});
