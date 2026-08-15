import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkYouTube(url) {
  const api = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(10000) });
    if (res.ok) return { reachable: true, code: res.status };
    return { reachable: false, code: res.status };
  } catch {
    return { reachable: false, code: null };
  }
}

async function main() {
  const rows = await prisma.dataset.findMany({
    where: { verificationStatus: "BROKEN" },
    select: { id: true, name: true, officialUrl: true, sourceRecordKey: true },
  });
  const yt = rows.filter((r) => r.officialUrl.includes("youtube.com"));
  console.log(`youtube records flagged broken: ${yt.length}`);

  let restored = 0;
  for (const rec of yt) {
    const result = await checkYouTube(rec.officialUrl);
    if (result.reachable) {
      const isLegacy = String(rec.sourceRecordKey || "").startsWith("legacy:");
      await prisma.dataset.update({
        where: { id: rec.id },
        data: {
          verificationStatus: "VERIFIED",
          status: isLegacy ? "PUBLISHED" : "DISCOVERED",
          lastVerified: new Date(),
        },
      });
      restored++;
      console.log(`RESTORED ${rec.name.slice(0, 60)}`);
    } else {
      console.log(`STILL DEAD ${rec.name.slice(0, 60)} (${rec.officialUrl})`);
    }
  }
  console.log(`youtube restored: ${restored}/${yt.length}`);
}

main().finally(() => prisma.$disconnect());