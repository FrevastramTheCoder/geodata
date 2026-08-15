/**
 * Seed the Tanzania GeoData Hub database.
 *
 * 1. Creates the 32 catalog categories.
 * 2. Creates known data source organizations.
 * 3. Loads the 959 curated geospatial dataset entries from the existing
 *    datasets.json (catalog metadata + official URLs only — no data files).
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CATEGORIES = [
  { slug: "administrative-boundaries", name: "Administrative Boundaries", icon: "border-all", color: "#8e44ad", description: "Regional, district, ward, village and enumeration area boundaries." },
  { slug: "urban-regional-planning", name: "Urban & Regional Planning", icon: "city", color: "#5d6d7e", description: "Master plans, zoning, development control and planning schemes." },
  { slug: "land-use-land-cover", name: "Land Use & Land Cover", icon: "map", color: "#27ae60", description: "Land use plans, land cover classifications and agriculture." },
  { slug: "satellite-remote-sensing", name: "Satellite & Remote Sensing", icon: "satellite", color: "#3498db", description: "Satellite imagery and earth observation products." },
  { slug: "dem-terrain", name: "DEM & Terrain", icon: "mountain", color: "#e67e22", description: "Digital elevation models and terrain derivatives." },
  { slug: "climate-weather", name: "Climate & Weather", icon: "cloud", color: "#1abc9c", description: "Climate, weather, rainfall and temperature data." },
  { slug: "rainfall", name: "Rainfall", icon: "cloud-rain", color: "#2e86c1", description: "Precipitation, rainfall stations and gridded rainfall data." },
  { slug: "hydrology", name: "Hydrology", icon: "droplets", color: "#2980b9", description: "Water resources, rivers, lakes and watersheds." },
  { slug: "flood-risk", name: "Flood Risk", icon: "waves", color: "#148f77", description: "Flood hazard, exposure and flood risk assessment data." },
  { slug: "drought", name: "Drought", icon: "sun", color: "#ca6f1e", description: "Drought monitoring, indices and drought risk data." },
  { slug: "soil-geology", name: "Soil & Geology", icon: "layers", color: "#c0392b", description: "Soil properties, geology, minerals and geophysics." },
  { slug: "agriculture", name: "Agriculture", icon: "sprout", color: "#27ae60", description: "Agricultural production, crops and livestock statistics." },
  { slug: "population-demographics", name: "Population & Demographics", icon: "users", color: "#8e44ad", description: "Census and survey population statistics." },
  { slug: "census", name: "Census", icon: "clipboard-list", color: "#7d3c98", description: "Population and Housing Census data and spatial products." },
  { slug: "health", name: "Health", icon: "heart-pulse", color: "#e91e63", description: "Health facilities, disease and health statistics." },
  { slug: "education", name: "Education", icon: "graduation-cap", color: "#f39c12", description: "Schools, education facilities and statistics." },
  { slug: "transport-infrastructure", name: "Transport & Infrastructure", icon: "route", color: "#e74c3c", description: "Roads, railways, energy and utility networks." },
  { slug: "roads", name: "Roads", icon: "route", color: "#c0392b", description: "Road networks, road condition and transport data." },
  { slug: "railways", name: "Railways", icon: "train-front", color: "#6e2c00", description: "Railway networks and rail transport data." },
  { slug: "airports", name: "Airports", icon: "plane", color: "#1f618d", description: "Airports, airstrips and aviation data." },
  { slug: "ports", name: "Ports", icon: "anchor", color: "#0e6251", description: "Seaports, harbours and maritime infrastructure." },
  { slug: "buildings", name: "Buildings", icon: "building-2", color: "#5d6d7e", description: "Building footprints and built environment." },
  { slug: "cadastral-land", name: "Cadastral & Land", icon: "land-plot", color: "#8b4513", description: "Land tenure, parcels, titles and land administration." },
  { slug: "environment", name: "Environment", icon: "leaf", color: "#16a085", description: "Biodiversity, conservation and environmental monitoring." },
  { slug: "forestry", name: "Forestry", icon: "tree-pine", color: "#1e8449", description: "Forest cover, forest reserves and forestry data." },
  { slug: "wetlands", name: "Wetlands", icon: "fish", color: "#117864", description: "Wetlands, swamps and Ramsar site data." },
  { slug: "marine-coastal", name: "Marine & Coastal", icon: "waves", color: "#008080", description: "Ocean, marine and coastal zone data." },
  { slug: "disaster-risk", name: "Disaster & Risk", icon: "alert-triangle", color: "#d35400", description: "Hazards, disasters and risk assessment data." },
  { slug: "humanitarian-data", name: "Humanitarian Data", icon: "hand-heart", color: "#cb4335", description: "Humanitarian operations, displacement and response data." },
  { slug: "gis-tools-services", name: "GIS Tools & Services", icon: "wrench", color: "#7f8c8d", description: "GIS software, APIs, portals and services." },
  { slug: "research-data", name: "Research Data", icon: "flask-conical", color: "#5b2c6f", description: "Research datasets, publications and academic data." },
  { slug: "geoai-ml", name: "GeoAI & Machine Learning", icon: "cpu", color: "#34495e", description: "Geospatial AI, machine learning models and training data." },
];

const SOURCES = [
  { slug: "nbs", name: "National Bureau of Statistics Tanzania", shortName: "NBS Tanzania", country: "Tanzania", type: "Government", websiteUrl: "https://www.nbs.go.tz", description: "Official statistics, censuses, surveys and GIS boundary data of Tanzania." },
  { slug: "lands-tz", name: "Ministry of Lands, Housing & Human Settlements Development", shortName: "Wizara ya Ardhi", country: "Tanzania", type: "Government", websiteUrl: "https://www.lands.go.tz", description: "Land administration, survey and mapping." },
  { slug: "nlupc", name: "National Land Use Planning Commission", shortName: "NLUPC", country: "Tanzania", type: "Government", websiteUrl: "https://www.nlupc.go.tz", description: "National land use planning." },
  { slug: "tprb", name: "Town Planners Registration Board", shortName: "TPRB", country: "Tanzania", type: "Government", websiteUrl: "https://www.tprb.go.tz", description: "Regulation of town planning profession in Tanzania." },
  { slug: "usgs", name: "United States Geological Survey", shortName: "USGS", country: "United States", type: "Government", websiteUrl: "https://www.usgs.gov", description: "Earth science and remote sensing data." },
  { slug: "esa", name: "European Space Agency", shortName: "ESA", country: "Europe", type: "International", websiteUrl: "https://www.esa.int", description: "Copernicus earth observation programme." },
  { slug: "nasa", name: "NASA Earth Science Data", shortName: "NASA", country: "United States", type: "Government", websiteUrl: "https://earthdata.nasa.gov", description: "Earth observation and science data." },
  { slug: "fao", name: "Food and Agriculture Organization", shortName: "FAO", country: "International", type: "International", websiteUrl: "https://www.fao.org", description: "Agriculture, land and water statistics." },
  { slug: "worldbank", name: "World Bank", shortName: "World Bank", country: "International", type: "International", websiteUrl: "https://data.worldbank.org", description: "Development data and statistics." },
  { slug: "osm", name: "OpenStreetMap", shortName: "OSM", country: "Global", type: "Community", websiteUrl: "https://www.openstreetmap.org", description: "Open collaborative map data." },
  { slug: "hdx", name: "Humanitarian Data Exchange", shortName: "HDX", country: "Global", type: "NGO", websiteUrl: "https://data.humdata.org", description: "Humanitarian geospatial data sharing." },
  { slug: "worldpop", name: "WorldPop", shortName: "WorldPop", country: "International", type: "Research", websiteUrl: "https://www.worldpop.org", description: "High-resolution gridded population estimates." },
  { slug: "copernicus", name: "Copernicus (European Space Agency)", shortName: "Copernicus / ESA", country: "Europe", type: "International", websiteUrl: "https://dataspace.copernicus.eu", description: "Copernicus Sentinel earth observation data." },
  { slug: "gadm", name: "GADM", shortName: "GADM", country: "Global", type: "Research", websiteUrl: "https://gadm.org", description: "Global administrative areas." },
];

// These are the verified country and region records already published by NBS.
// Lower administrative levels are intentionally not inserted without an official
// NBS resource that identifies the areas and their access conditions.
const NBS_BOUNDARY_SOURCE_URL = "https://www.nbs.go.tz/statistics/topic/gis";
const NBS_COUNTRY_SOURCE_URL = "https://www.nbs.go.tz/statistics/geographic-information-system-gis";
const NBS_BOUNDARY_ACCESS_URL = "https://microdata.nbs.go.tz/index.php/catalog/49";
const NBS_BOUNDARY_VERSION = "2022 Census administrative structure";
const VERIFIED_NBS_AREAS = [
  { name: "Tanzania", code: "TZ", level: "COUNTRY", sourceUrl: NBS_BOUNDARY_SOURCE_URL, accessUrl: NBS_COUNTRY_SOURCE_URL },
  { name: "Arusha", code: "TZ01", level: "REGION" },
  { name: "Dar es Salaam", code: "TZ02", level: "REGION" },
  { name: "Dodoma", code: "TZ03", level: "REGION" },
  { name: "Iringa", code: "TZ04", level: "REGION" },
  { name: "Kagera", code: "TZ05", level: "REGION" },
  { name: "Kaskazini Pemba", code: "TZ06", level: "REGION" },
  { name: "Kaskazini Unguja", code: "TZ07", level: "REGION" },
  { name: "Kigoma", code: "TZ08", level: "REGION" },
  { name: "Kilimanjaro", code: "TZ09", level: "REGION" },
  { name: "Kusini Pemba", code: "TZ10", level: "REGION" },
  { name: "Kusini Unguja", code: "TZ11", level: "REGION" },
  { name: "Lindi", code: "TZ12", level: "REGION" },
  { name: "Mara", code: "TZ13", level: "REGION" },
  { name: "Mbeya", code: "TZ14", level: "REGION" },
  { name: "Mjini Magharibi", code: "TZ15", level: "REGION" },
  { name: "Morogoro", code: "TZ16", level: "REGION" },
  { name: "Mtwara", code: "TZ17", level: "REGION" },
  { name: "Mwanza", code: "TZ18", level: "REGION" },
  { name: "Pwani", code: "TZ19", level: "REGION" },
  { name: "Rukwa", code: "TZ20", level: "REGION" },
  { name: "Ruvuma", code: "TZ21", level: "REGION" },
  { name: "Shinyanga", code: "TZ22", level: "REGION" },
  { name: "Simiyu", code: "TZ23", level: "REGION" },
  { name: "Singida", code: "TZ24", level: "REGION" },
  { name: "Tabora", code: "TZ25", level: "REGION" },
  { name: "Tanga", code: "TZ26", level: "REGION" },
];

const COURSES = [
  {
    slug: "gis-fundamentals",
    title: "GIS Fundamentals",
    description: "Build a practical foundation in geographic information systems, spatial data and cartographic communication.",
    instructor: "GeoBrains Academy",
    category: "GIS Fundamentals",
    level: "Beginner",
    duration: "7 modules",
    preview: "Learn how maps become decision-ready spatial information.",
    learningObjectives: ["Explain core GIS concepts", "Work with vector and raster data", "Choose an appropriate coordinate reference system", "Produce a clear map layout"],
    certificateAvailable: true,
    lessons: ["Introduction to GIS", "Coordinate Reference Systems", "Spatial Data", "Vector Analysis", "Raster Analysis", "Cartography", "GIS Project"],
  },
  {
    slug: "remote-sensing",
    title: "Remote Sensing",
    description: "Understand satellite imagery, image interpretation and practical earth observation workflows.",
    instructor: "GeoBrains Academy",
    category: "Remote Sensing",
    level: "Intermediate",
    duration: "6 modules",
    preview: "Turn satellite observations into evidence for environmental and planning decisions.",
    learningObjectives: ["Describe remote sensing principles", "Interpret multispectral imagery", "Prepare imagery for analysis", "Communicate earth observation results"],
    certificateAvailable: true,
    lessons: ["Earth Observation Concepts", "Sensors and Resolutions", "Image Pre-processing", "Spectral Indices", "Classification", "Remote Sensing Project"],
  },
  {
    slug: "python-for-gis",
    title: "Python for GIS",
    description: "Automate repeatable geospatial workflows with Python, tables, geometry and spatial analysis.",
    instructor: "GeoBrains Academy",
    category: "Python for GIS",
    level: "Intermediate",
    duration: "6 modules",
    preview: "Replace repetitive GIS tasks with reliable, reproducible code.",
    learningObjectives: ["Use Python for data preparation", "Read and write spatial formats", "Automate geoprocessing", "Build a reproducible mini-project"],
    certificateAvailable: true,
    lessons: ["Python Setup for GIS", "Tabular and Spatial Data", "Geometry Operations", "Raster Workflows", "Automation Patterns", "Python GIS Project"],
  },
];

/** Map old category names -> new category slugs. */
const CATEGORY_MAP = {
  "Digital Elevation Models (DEM)": "dem-terrain",
  "Satellite Imagery & Earth Observation": "satellite-remote-sensing",
  "GIS Data Portals & Repositories": "gis-tools-services",
  "Spatial Planning & Land Governance": "urban-regional-planning",
  "Climate, Weather & Environment": "climate-weather",
  "Geology, Minerals & Geophysics": "soil-geology",
  "Hydrology & Water Resources": "hydrology",
  "Biodiversity & Conservation": "environment",
  "Infrastructure, Transport & Energy": "transport-infrastructure",
  "Administrative Boundaries & Demographics": "administrative-boundaries",
  "Ocean, Marine & Coastal": "marine-coastal",
  "Hazards, Disasters & Risk": "disaster-risk",
  "Urban Data & Smart Cities": "urban-regional-planning",
  "GIS APIs, Web Services & SDKs": "gis-tools-services",
  "GIS Software, Tools & Libraries": "gis-tools-services",
  "Laws, Guidelines & Acts - Town, Village & Regional Planning": "urban-regional-planning",
  "Learning Hub - GIS, Analysis, Planning, Urban Design & More": "gis-tools-services",
  "Land Use, Land Cover & Agriculture": "land-use-land-cover",
  "Cadastre, Land Tenure & Property": "cadastral-land",
  "Health, Education & Social Facilities Data": "health",
  "Transportation & Mobility Networks": "transport-infrastructure",
  "Energy, Mining & Utility Networks": "transport-infrastructure",
  "Conservation, Tourism & Natural Resources": "environment",
  "Tanzania Government Ministries & Agencies Data": "administrative-boundaries",
  "Streets, Roads & Transport Networks (Global)": "transport-infrastructure",
  "International Planning Projects & Case Studies": "urban-regional-planning",
  "Master Plans, Zoning & Development Control": "urban-regional-planning",
  "Historic Maps, Archives & Temporal Data": "administrative-boundaries",
  "Neighboring Countries GIS & Planning Portals": "gis-tools-services",
  "Planning & Infrastructure Projects Databases": "urban-regional-planning",
  "Heritage Conservation, Urban Squares & Open Spaces (Tanzania)": "environment",
  "Satellite Cities, New Towns & Urban Expansion (Tanzania)": "urban-regional-planning",
  "Natural Resources Reports & Maps (Tanzania)": "environment",
  "Local Downloaded Files (Tanzania Planning & GIS)": "gis-tools-services",
  "Research Papers, Journals & Publications": "gis-tools-services",
  "Academic Programs & Universities": "gis-tools-services",
};

/** Map dataset URL host -> source slug for known organizations. */
function sourceSlugFromUrl(url) {
  if (!url) return "osm";
  const u = url.toLowerCase();
  if (u.includes("usgs.gov")) return "usgs";
  if (u.includes("esa.int") || u.includes("copernicus") || u.includes("sentinel-hub")) return "esa";
  if (u.includes("nasa.gov") || u.includes("earthdata")) return "nasa";
  if (u.includes("fao.org")) return "fao";
  if (u.includes("worldbank.org")) return "worldbank";
  if (u.includes("openstreetmap.org")) return "osm";
  if (u.includes("humdata.org")) return "hdx";
  if (u.includes("gadm.org")) return "gadm";
  if (u.includes("lands.go.tz")) return "lands-tz";
  if (u.includes("nlupc.go.tz")) return "nlupc";
  if (u.includes("tprb.go.tz")) return "tprb";
  if (u.includes("nbs.go.tz") || u.includes("microdata.nbs")) return "nbs";
  return "osm";
}

/** Deterministic URL-safe slug for legacy catalogue records. */
function legacySlug(name, id) {
  const base = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const hash = String(id)
    .split("")
    .reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)
    .toString(36)
    .slice(0, 6);
  return `${base || "dataset"}-${hash}`;
}

async function upsertAdministrativeArea(area, sourceId, parentId = null) {
  const data = {
    ...area,
    country: "Tanzania",
    sourceId,
    parentId,
    year: 2022,
    version: NBS_BOUNDARY_VERSION,
    status: "VERIFIED",
  };
  const existing = await prisma.administrativeArea.findFirst({
    where: { country: data.country, level: data.level, code: data.code },
  });
  if (existing) {
    return prisma.administrativeArea.update({ where: { id: existing.id }, data });
  }
  return prisma.administrativeArea.create({ data });
}

async function main() {
  console.log("Seeding Tanzania GeoData Hub...");

  for (const [i, cat] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { ...cat, sortOrder: i },
      create: { ...cat, sortOrder: i },
    });
  }
  console.log(`Categories: ${CATEGORIES.length}`);

  const sourceSlugs = new Map();
  for (const s of SOURCES) {
    await prisma.source.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
    sourceSlugs.set(s.slug, s.name);
  }
  console.log(`Sources: ${SOURCES.length}`);

  const nbsSource = await prisma.source.findUnique({ where: { slug: "nbs" } });
  if (!nbsSource) throw new Error("NBS source was not created");
  const country = VERIFIED_NBS_AREAS[0];
  const countryArea = await upsertAdministrativeArea(
    {
      ...country,
      sourceUrl: country.sourceUrl || NBS_BOUNDARY_SOURCE_URL,
      accessUrl: country.accessUrl || NBS_BOUNDARY_ACCESS_URL,
    },
    nbsSource.id,
  );
  for (const area of VERIFIED_NBS_AREAS.slice(1)) {
    await upsertAdministrativeArea(
      {
        ...area,
        sourceUrl: NBS_BOUNDARY_SOURCE_URL,
        accessUrl: NBS_BOUNDARY_ACCESS_URL,
      },
      nbsSource.id,
      countryArea.id,
    );
  }
  console.log(`Administrative areas: ${VERIFIED_NBS_AREAS.length} verified NBS country/region records`);

  // Load curated catalogue from existing datasets.json
  const dataPath = path.join(__dirname, "..", "..", "..", "datasets.json");
  let raw;
  try {
    raw = JSON.parse(readFileSync(dataPath, "utf8"));
  } catch {
    console.warn(`datasets.json not found at ${dataPath} — skipping curated import`);
    raw = { items: [] };
  }
  const items = Array.isArray(raw.items) ? raw.items : Array.isArray(raw) ? raw : [];

  const cats = await prisma.category.findMany();
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));

  let created = 0;
  for (const item of items) {
    const categorySlug =
      CATEGORY_MAP[item.category] || "gis-tools-services";
    const sourceSlug = item.local
      ? item.category?.includes("nbs")
        ? "nbs"
        : "lands-tz"
      : sourceSlugFromUrl(item.url);

    const source = await prisma.source.findUnique({ where: { slug: sourceSlug } });

    const key = `legacy:${item.id}`;
    await prisma.dataset.upsert({
      where: { sourceRecordKey: key },
      update: {},
      create: {
        name: item.name || "Untitled dataset",
        slug: legacySlug(item.name || "dataset", item.id),
        description: item.desc || null,
        categoryId: catBySlug.get(categorySlug)?.id || null,
        coverage: item.local ? "Tanzania" : "Global",
        country: item.local ? "Tanzania" : "Global",
        region: item.local ? "Tanzania" : "Global",
        year: item.local ? 2024 : null,
        dataType: "Web / Catalog",
        format: item.format || "Web",
        license: "See official source",
        accessType: "PUBLIC_DOWNLOAD",
        officialUrl: item.url || "https://www.nbs.go.tz",
        sourceUrl: item.url || null,
        sourceRecordKey: key,
        lastVerified: new Date(),
        status: "PUBLISHED",
        tags: (item.tags || "").split(" ").filter(Boolean).slice(0, 10),
        popular: item.id <= 12,
        isLocal: !!item.local,
        sourceId: source?.id || null,
      },
    });
    created++;
  }
  console.log(`Datasets: ${created} (incl. NBS connector records if previously ingested)`);

  for (const courseData of COURSES) {
    const { lessons, ...course } = courseData;
    const savedCourse = await prisma.course.upsert({
      where: { slug: course.slug },
      update: course,
      create: course,
    });
    for (const [index, title] of lessons.entries()) {
      await prisma.lesson.upsert({
        where: { courseId_orderNumber: { courseId: savedCourse.id, orderNumber: index + 1 } },
        update: { title, description: `Module ${index + 1}: ${title}`, isPreview: index === 0, content: `Protected lesson content for ${title}.` },
        create: { courseId: savedCourse.id, title, description: `Module ${index + 1}: ${title}`, orderNumber: index + 1, isPreview: index === 0, content: `Protected lesson content for ${title}.` },
      });
    }
  }
  console.log(`Courses: ${COURSES.length}`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
