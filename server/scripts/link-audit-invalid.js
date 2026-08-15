import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.dataset.findMany({
    select: { id: true, name: true, officialUrl: true, status: true },
  });

  const invalid = rows.filter((r) => {
    try {
      new URL(r.officialUrl);
      return false;
    } catch {
      return true;
    }
  });

  console.log(`invalid: ${invalid.length}`);
  for (const r of invalid.slice(0, 60)) {
    console.log(`- [${r.id}] ${r.name.slice(0, 60)} | URL=${JSON.stringify(r.officialUrl)}`);
  }
}

main().finally(() => prisma.$disconnect());