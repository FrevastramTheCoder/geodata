import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const g = await prisma.dataset.groupBy({ by: ["status"], _count: { _all: true } });
  for (const x of g) console.log(`${x.status}=${x._count._all}`);
  const v = await prisma.dataset.groupBy({ by: ["verificationStatus"], _count: { _all: true } });
  for (const x of v) console.log(`verify:${x.verificationStatus}=${x._count._all}`);
}

main().finally(() => prisma.$disconnect());