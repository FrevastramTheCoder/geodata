import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const rows = await p.dataset.findMany({
  where: { status: "BROKEN_LINK" },
  select: { id: true, name: true, verificationStatus: true },
});
let fixed = 0;
for (const r of rows) {
  if (r.verificationStatus === "BROKEN") continue;
  await p.dataset.update({
    where: { id: r.id },
    data: { status: "PUBLISHED" },
  });
  fixed++;
  console.log(`republished ${r.name} (${r.verificationStatus})`);
}
const still = await p.dataset.count({ where: { status: "BROKEN_LINK" } });
console.log(`republished: ${fixed}, still BROKEN_LINK: ${still}`);
await p.$disconnect();
