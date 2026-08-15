import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

async function main() {
  const raw = readFileSync("scripts/recheck-results.json", "utf8").replace(/^\uFEFF/, "");
  const results = JSON.parse(raw);
  const reachable = results.filter((r) => r.reachable);
  console.log(`restoring ${reachable.length} false-negative links`);

  let restored = 0;
  for (const rec of reachable) {
    const dataset = await prisma.dataset.findUnique({
      where: { id: rec.id },
      select: { sourceRecordKey: true },
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
  }

  const stillBroken = results.length - reachable.length;
  console.log(`restored: ${restored}, still broken: ${stillBroken}`);

  const broken = await prisma.dataset.count({
    where: { verificationStatus: "BROKEN" },
  });
  console.log(`datasets still flagged BROKEN in DB: ${broken}`);
}

main().finally(() => prisma.$disconnect());