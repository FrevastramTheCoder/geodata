import { PrismaClient } from "@prisma/client";
import { execFileSync } from "node:child_process";

const prisma = new PrismaClient();

const FIXES = [
  {
    match: "https://www.youtube.com/@planetizen",
    url: "https://www.youtube.com/@PlanetizenHQ",
  },
  {
    match: "https://www.youtube.com/@TheAAG",
    url: "https://www.youtube.com/@geographers",
  },
  {
    match: "https://www.youtube.com/@johnjnelso",
    url: "https://www.youtube.com/@JohnNelsonMaps",
  },
  {
    match: "https://www.youtube.com/@nbstanzania",
    url: "https://www.youtube.com/channel/UCs15bGGyez5mWJyhKnKRlNA",
  },
  {
    match: "https://www.youtube.com/@googleearthengine",
    url: "https://www.youtube.com/googleearth",
  },
];

function reachable(url) {
  try {
    const code = execFileSync(
      "curl.exe",
      [
        "-s", "-o", "NUL", "-L",
        "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
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
  for (const fix of FIXES) {
    const rows = await prisma.dataset.findMany({
      where: { officialUrl: fix.match },
      select: { id: true, name: true, status: true, sourceRecordKey: true },
    });
    if (!rows.length) {
      console.log(`no match for ${fix.match}`);
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
  const remaining = await prisma.dataset.count({
    where: { verificationStatus: "BROKEN" },
  });
  console.log(`fixed: ${fixed}, still BROKEN: ${remaining}`);
}

main().finally(() => prisma.$disconnect());