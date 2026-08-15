import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function makeSlug(name, key) {
  const base = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const hash = String(key || base)
    .split("")
    .reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)
    .toString(36)
    .slice(0, 6);
  return `${base || "dataset"}-${hash}`;
}

async function main() {
  const rows = await prisma.dataset.findMany({ where: { slug: null } });
  let updated = 0;
  for (const row of rows) {
    const slug = makeSlug(row.name, row.sourceRecordKey || row.id);
    try {
      await prisma.dataset.update({ where: { id: row.id }, data: { slug } });
      updated++;
    } catch {
      await prisma.dataset.update({
        where: { id: row.id },
        data: { slug: `${slug}-${row.id.slice(0, 4)}` },
      });
      updated++;
    }
  }
  console.log(`Backfilled slugs for ${updated} datasets`);
}

main().finally(() => prisma.$disconnect());