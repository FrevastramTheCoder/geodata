import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

async function main() {
  const results = JSON.parse(
    readFileSync("scripts/recheck-curl.json", "utf8").replace(/^\uFEFF/, ""),
  );
  const reachable = results.filter((r) => r.reachable);
  console.log(`restoring ${reachable.length} curl-reachable links`);

  let restored = 0;
  for (const rec of reachable) {
    const dataset = await prisma.dataset.findUnique({
      where: { id: rec.id },
      select: { sourceRecordKey: true, name: true },
    });
    if (!dataset) continue;
    const isLegacy = String(dataset.sourceRecordKey || "").startsWith("legacy:");
    await prisma.dataset.update({
      where: { id: rec.id },
      data: {
        verificationStatus: "VERIFIED",
        status: isLegacy ? "PUBLISHED" : "DISCOVERED",
        lastVerified: new Date(),
      },
    });
    restored++;
    console.log(`  ok ${dataset.name}`);
  }

  const remaining = await prisma.dataset.count({
    where: { verificationStatus: "BROKEN" },
  });
  console.log(`restored: ${restored}, still flagged BROKEN: ${remaining}`);
}

main().finally(() => prisma.$disconnect());