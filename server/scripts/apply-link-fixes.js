import { PrismaClient } from "@prisma/client";
import { execFileSync } from "node:child_process";

const prisma = new PrismaClient();

const FIXES = [
  {
    match: "https://www.bgs.ac.uk/africangroundwateratlas/",
    url: "https://earthwise.bgs.ac.uk/index.php/Africa_Groundwater_Atlas_Home",
  },
  {
    match: "https://au.int/en/ie/gmes-africa",
    url: "https://gmes.au.int/en",
  },
  {
    match: "https://www.eorc.jaxa.jp/ALOS/en/aw3d30/",
    url: "https://www.eorc.jaxa.jp/ALOS/en/dataset/aw3d30/",
  },
  {
    match: "https://www.atlasofurbanexpansion.org/",
    url: "https://www.lincolninst.edu/data/atlas-of-urban-expansion",
  },
  {
    match: "https://www.bl.uk/georeferencer/",
    url: "https://britishlibrary.oldmapsonline.org/start",
  },
  {
    match: "https://www.youtube.com/@Burgis",
    url: "https://www.youtube.com/c/burdgis",
  },
  {
    match: "https://cshapes.org/",
    url: "https://icr.ethz.ch/data/cshapes/",
  },
  {
    match: "https://data.apps.fao.org/catalog/dataset/gaul",
    url: "https://data.apps.fao.org/catalog/iso/34f97afc-6218-459a-971d-5af1162d318a",
  },
  {
    match: "https://www.youtube.com/@GeoPythonConf",
    url: "https://www.youtube.com/channel/UCQ-tSRjoYXlqMCu93sXswdg",
  },
  {
    match: "https://www.geoportal.org/",
    url: "https://www.earthobservations.org/geoss.php",
  },
  {
    match: "https://edo.jrc.ec.europa.eu/gdo/",
    url: "https://drought.emergency.copernicus.eu/",
  },
  {
    match: "https://www.un-igrac.org/global-groundwater-information-system",
    url: "https://ggis.un-igrac.org/",
  },
  {
    match: "https://gshap.org/",
    url: "https://www.globalquakemodel.org/product/global-seismic-hazard-map",
  },
  {
    match: "https://www.globallandcover.com/",
    url: "https://www.webmap.cn/commres.do?method=globeDetails&type=brief",
  },
  {
    match:
      "https://sedac.ciesin.columbia.edu/data/sets/browsedata/set/gpw-v4-population-density-rev11",
    url: "https://www.earthdata.nasa.gov/data/catalog/sedac-ciesin-sedac-gpwv4-popdens-r11-4.11",
  },
  {
    match: "https://sedac.ciesin.columbia.edu/data/set/groads-global-roads-open-access-v1",
    url: "https://www.earthdata.nasa.gov/data/catalog/sedac-ciesin-sedac-groads-v1-1.0",
  },
  {
    match: "https://www.hydrosheds.org/products/lakeatlas",
    url: "https://www.hydrosheds.org/products/hydrolakes",
  },
  {
    match: "https://www.youtube.com/@RCMRD",
    url: "https://www.youtube.com/channel/UCBsaCz6wecwG53I1S-lwtyA",
  },
  {
    match: "https://www.unsalb.org/",
    url: "https://salb.un.org/en",
  },
  {
    match: "https://sedac.ciesin.columbia.edu/data/sets/browse",
    url: "https://www.earthdata.nasa.gov/data/catalog",
  },
  {
    match: "https://www.nbs.go.tz/index.php/en/census-surveys/census",
    url: "https://www.nbs.go.tz/statistics/topic/census-2022",
  },
  {
    match: "https://www.nbs.go.tz/index.php/en/census-surveys/nps",
    url: "https://www.nbs.go.tz/statistics/topic/national-panel-survey-nps",
  },
  {
    match: "https://www.wmf.org/project/tanzania-projects",
    url: "https://www.wmf.org/our-work",
  },
  {
    match: "https://www.youtube.com/@ardhitv6005",
    url: "https://www.youtube.com/@ardhitv",
  },
  {
    match: "https://www.youtube.com/@GeoGuru",
    url: "https://www.youtube.com/@GeoGuru1",
  },
  {
    match: "https://www.youtube.com/@TheAestheticCity",
    url: "https://www.youtube.com/channel/UCX4ppwcUldlxpuiRGoT1INQ",
  },
  {
    match: "https://www.ins-congo.cd/",
    url: "https://ins-rdc.org/",
    restrict: true,
  },
  {
    match: "https://www.mwt.go.tz/",
    nameContains: "SGR",
    url: "https://www.trc.co.tz/",
  },
  {
    match: "https://www.mwt.go.tz/",
    nameContains: "Ministry of Works",
    url: "https://www.mow.go.tz/",
  },
  {
    match: "https://www.sumatra.go.tz/",
    url: "https://www.tasac.go.tz/",
  },
  {
    match: "https://www.trl.co.tz/",
    url: "https://www.trc.co.tz/",
  },
  {
    match: "https://www.tum.de/en/studies/degree-programs/master/geodesy-and-geoinformation",
    url: "https://www.tum.de/en/studies/degree-programs/detail/geodesy-and-geoinformation-master-of-science-msc",
  },
  {
    match: "https://ghsl.jrc.ec.europa.eu/ucdb.php",
    url: "https://human-settlement.emergency.copernicus.eu/download.php?ds=ucdb",
  },
  {
    match: "https://www.tmcp.go.tz/",
    url: "https://www.madini.go.tz/",
  },
  {
    match: "https://www.worldpop.org/geodata/",
    url: "https://hub.worldpop.org/geodata/listing?id=71",
  },
  {
    match: "https://globalenergymonitor.org/projects/global-fossil-infrastructure-tracker/",
    url: "https://globalenergymonitor.org/projects/global-gas-infrastructure-tracker/",
  },
];

const VERIFY_ONLY = [
  "https://konza.go.ke/",
  "https://globaldamwatch.org/grand/",
];

const RESTRICT = [
  "https://www.bloomberg.com/citylab",
  "https://www.sciencedirect.com/journal/computers-environment-and-urban-systems",
  "https://www.sciencedirect.com/journal/habitat-international",
  "https://www.sciencedirect.com/journal/isprs-journal-of-photogrammetry-and-remote-sensing",
  "https://www.sciencedirect.com/journal/land-use-policy",
  "https://www.sciencedirect.com/journal/landscape-and-urban-planning",
  "https://www.sciencedirect.com/journal/remote-sensing-of-environment",
  "https://www.researchgate.net/topic/GIS",
  "https://uk.sagepub.com/en-gb/eur/urban-planning-theory-since-1945/book234347",
  "https://www.london.gov.uk/programmes-strategies/planning/london-plan",
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

function reachable(url) {
  try {
    const code = execFileSync(
      "curl.exe",
      [
        "-s", "-o", "NUL", "-L",
        "-A", UA,
        "--max-time", "25", "-w", "%{http_code}", "-k", url,
      ],
      { encoding: "utf8" },
    ).trim();
    return /^[23][0-9][0-9]$/.test(code);
  } catch {
    return false;
  }
}

async function updateRow(row, data, kind) {
  const isLegacy = String(row.sourceRecordKey || "").startsWith("legacy:");
  const payload = {
    ...data,
    verificationStatus: data.verificationStatus || (kind === "restrict" ? "RESTRICTED" : "VERIFIED"),
    lastVerified: new Date(),
  };
  if (kind === "fix" || kind === "verify") {
    payload.status = isLegacy ? "PUBLISHED" : "DISCOVERED";
  }
  await prisma.dataset.update({ where: { id: row.id }, data: payload });
}

async function main() {
  let fixed = 0;
  let restricted = 0;
  let verifiedOnly = 0;

  for (const fix of FIXES) {
    const rows = await prisma.dataset.findMany({
      where: {
        officialUrl: fix.match,
        ...(fix.nameContains ? { name: { contains: fix.nameContains } } : {}),
      },
      select: { id: true, name: true, status: true, sourceRecordKey: true },
    });
    if (!rows.length) {
      console.log(`no match: ${fix.match}${fix.nameContains ? ` (${fix.nameContains})` : ""}`);
      continue;
    }
    if (!fix.restrict && !reachable(fix.url)) {
      console.log(`REJECTED (unreachable): ${fix.url}`);
      continue;
    }
    for (const row of rows) {
      await updateRow(
        row,
        fix.restrict ? { officialUrl: fix.url } : { officialUrl: fix.url },
        fix.restrict ? "restrict" : "fix",
      );
      fixed++;
      console.log(`${fix.restrict ? "restricted" : "fixed"} ${row.name} -> ${fix.url}`);
    }
  }

  for (const url of VERIFY_ONLY) {
    const rows = await prisma.dataset.findMany({
      where: { officialUrl: url },
      select: { id: true, name: true, status: true, sourceRecordKey: true },
    });
    if (!rows.length) {
      console.log(`no match: ${url}`);
      continue;
    }
    if (!reachable(url)) {
      console.log(`REJECTED (unreachable): ${url}`);
      continue;
    }
    for (const row of rows) {
      await updateRow(row, {}, "verify");
      verifiedOnly++;
      console.log(`verified ${row.name} (unchanged URL)`);
    }
  }

  for (const url of RESTRICT) {
    const rows = await prisma.dataset.findMany({
      where: { officialUrl: url },
      select: { id: true, name: true },
    });
    if (!rows.length) {
      console.log(`no match: ${url}`);
      continue;
    }
    for (const row of rows) {
      await updateRow(row, {}, "restrict");
      restricted++;
      console.log(`restricted ${row.name} (bot-blocked legit domain)`);
    }
  }

  const remaining = await prisma.dataset.count({
    where: { verificationStatus: "BROKEN" },
  });
  console.log(`fixed: ${fixed}, verified-only: ${verifiedOnly}, restricted: ${restricted}, still BROKEN: ${remaining}`);
}

main().finally(() => prisma.$disconnect());