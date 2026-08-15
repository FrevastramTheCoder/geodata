import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.dataset.findMany({
    select: { id: true, officialUrl: true, name: true },
  });
  const prefixes = {};
  for (const r of rows) {
    try {
      new URL(r.officialUrl);
      continue;
    } catch {
      const p = r.officialUrl.split(/[/\\]/)[0].toLowerCase();
      prefixes[p] = (prefixes[p] || 0) + 1;
    }
  }
  console.log(
    Object.entries(prefixes)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} = ${v}`)
      .join("\n"),
  );
}

main().finally(() => prisma.$disconnect());