/**
 * Link health audit — inspect catalogue URLs before verification.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.dataset.findMany({
    select: { id: true, officialUrl: true, status: true, verificationStatus: true },
  });

  const hosts = {};
  const statusCounts = {};
  let invalid = 0;

  for (const r of rows) {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    try {
      const h = new URL(r.officialUrl).host;
      hosts[h] = (hosts[h] || 0) + 1;
    } catch {
      invalid++;
    }
  }

  console.log(`total: ${rows.length}`);
  console.log(
    "status: " +
      Object.entries(statusCounts).map(([k, v]) => `${k}=${v}`).join(", "),
  );
  console.log(`invalid URLs: ${invalid}`);
  console.log(
    "top hosts:\n" +
      Object.entries(hosts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([h, c]) => `  ${h} = ${c}`)
        .join("\n"),
  );
}

main().finally(() => prisma.$disconnect());