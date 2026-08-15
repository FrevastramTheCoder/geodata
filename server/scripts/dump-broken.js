import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.dataset.findMany({
    where: { verificationStatus: "BROKEN" },
    select: { id: true, name: true, officialUrl: true, status: true },
  });
  writeFileSync(
    "scripts/broken-to-recheck.json",
    JSON.stringify(rows, null, 2),
    "utf8",
  );
  console.log(`dumped ${rows.length} records for recheck`);
}

main().finally(() => prisma.$disconnect());