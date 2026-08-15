import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.dataset.findMany({
    select: { id: true, name: true, officialUrl: true, sourceId: true, source: { select: { slug: true, name: true } } },
  });
  const invalid = rows.filter((r) => {
    try {
      new URL(r.officialUrl);
      return false;
    } catch {
      return true;
    }
  });
  const bySource = {};
  const byPrefix = {};
  for (const r of invalid) {
    const p = r.officialUrl.split(/[/\\]/)[0].toLowerCase();
    byPrefix[p] = (byPrefix[p] || 0) + 1;
    bySource[r.source?.slug || "null"] = (bySource[r.source?.slug || "null"] || 0) + 1;
  }
  console.log("by source:", bySource);
  console.log("by prefix:", byPrefix);
  console.log("sample nbs items:");
  for (const r of invalid.filter((x) => x.officialUrl.startsWith("nbs/")).slice(0, 8)) {
    console.log(`  ${r.name.slice(0, 60)} | ${r.officialUrl}`);
  }
  console.log("sample tprb items:");
  for (const r of invalid.filter((x) => x.officialUrl.startsWith("tprb/")).slice(0, 5)) {
    console.log(`  ${r.name.slice(0, 60)} | ${r.officialUrl}`);
  }
  console.log("sample nlupc items:");
  for (const r of invalid.filter((x) => x.officialUrl.startsWith("nlupc/")).slice(0, 5)) {
    console.log(`  ${r.name.slice(0, 60)} | ${r.officialUrl}`);
  }
}

main().finally(() => prisma.$disconnect());