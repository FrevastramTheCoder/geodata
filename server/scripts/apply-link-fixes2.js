import { PrismaClient } from "@prisma/client";
import { execFileSync } from "node:child_process";

const prisma = new PrismaClient();

const FIXES = [
  {
    match: "https://globaldamwatch.org/grand/",
    url: "https://www.globaldamwatch.org/grand/",
  },
  {
    match: "https://www.routledge.com/Urban-Planning-in-Africa/book-series/UPIA",
    url: "https://www.routledge.com/Routledge-Handbook-of-Urban-Planning-in-Africa/Silva/p/book/9781032086545",
  },
  {
    match: "https://www.fao.org/land-water/land/land-governance/land-resources-planning-toolbox/en/",
    nameContains: "Africover /",
    url: "https://data.apps.fao.org/catalog/iso/68f7b45c-31ec-4842-ad85-12b370ac670b",
  },
  {
    match: "https://www.fao.org/land-water/land/land-governance/land-resources-planning-toolbox/en/",
    nameContains: "Kenya & Tanzania",
    url: "https://data.apps.fao.org/catalog/iso/900acaf8-69a1-4df6-84ef-8bd71abad46b",
  },
  {
    match: "https://www.fao.org/tenure/collection/sola/",
    url: "https://www.fao.org/tenure/sola-suite/about/en/",
  },
  {
    match: "https://afrigeo.org/",
    url: "https://earthobservations.org/groups/african-group-on-earth-observations",
  },
  {
    match: "https://ethz.ch/en/studies/master/geomatics.html",
    url: "https://ethz.ch/en/studies/master/degree-programmes/architecture-and-civil-engineering/geomatics.html",
  },
  {
    match: "https://www.helsinki.fi/en/admissions-and-education/apply-masters-programmes/geography",
    url: "https://www.helsinki.fi/en/degree-programmes/geography-masters-programme",
  },
  {
    match: "https://www.sok.go.ke/",
    url: "https://lands.go.ke/department-functions",
  },
  {
    match: "https://www.lvbwo.go.tz/",
    url: "https://www.lvbwb.go.tz/",
  },
  {
    match: "https://www.stonetown.go.tz/",
    url: "https://stcda.go.tz/",
  },
  {
    match: "https://www.rcmrd.org/training/",
    url: "https://rcmrd.org/en/opportunities/training",
  },
];

const RESTRICT = ["https://mrdata.usgs.gov/"];

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

async function main() {
  let fixed = 0;
  let restricted = 0;

  for (const fix of FIXES) {
    const rows = await prisma.dataset.findMany({
      where: {
        officialUrl: fix.match,
        ...(fix.nameContains ? { name: { contains: fix.nameContains } } : {}),
      },
      select: { id: true, name: true, sourceRecordKey: true },
    });
    if (!rows.length) {
      console.log(`no match: ${fix.match}${fix.nameContains ? ` (${fix.nameContains})` : ""}`);
      continue;
    }
    if (!reachable(fix.url)) {
      console.log(`REJECTED (unreachable): ${fix.url}`);
      continue;
    }
    for (const row of rows) {
      const isLegacy = String(row.sourceRecordKey || "").startsWith("legacy:");
      await prisma.dataset.update({
        where: { id: row.id },
        data: {
          officialUrl: fix.url,
          verificationStatus: "VERIFIED",
          status: isLegacy ? "PUBLISHED" : "DISCOVERED",
          lastVerified: new Date(),
        },
      });
      fixed++;
      console.log(`fixed ${row.name} -> ${fix.url}`);
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
      await prisma.dataset.update({
        where: { id: row.id },
        data: { verificationStatus: "RESTRICTED", lastVerified: new Date() },
      });
      restricted++;
      console.log(`restricted ${row.name} (live for browsers, unreachable via curl)`);
    }
  }

  const remaining = await prisma.dataset.count({
    where: { verificationStatus: "BROKEN" },
  });
  console.log(`fixed: ${fixed}, restricted: ${restricted}, still BROKEN: ${remaining}`);
}

main().finally(() => prisma.$disconnect());