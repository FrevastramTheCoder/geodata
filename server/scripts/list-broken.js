import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.dataset.findMany({
    where: { verificationStatus: "BROKEN" },
    select: { id: true, name: true, officialUrl: true, status: true, sourceRecordKey: true },
    orderBy: { name: "asc" },
  });
  console.log(`broken: ${rows.length}`);
  for (const r of rows) {
    console.log(`${r.name.slice(0, 70)} | ${r.officialUrl}`);
  }
}

main().finally(() => prisma.$disconnect());