import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const r = await p.dataset.updateMany({
  where: { accessType: "Free" },
  data: { accessType: "PUBLIC_DOWNLOAD" },
});
const leftover = await p.dataset.groupBy({
  by: ["accessType"],
  _count: { _all: true },
});
console.log(`migrated: ${r.count}`);
for (const x of leftover) console.log(x.accessType.padEnd(24), x._count._all);
await p.$disconnect();
