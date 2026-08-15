/**
 * Fix records whose officialUrl is a local relative path (nbs/, lands_go_tz/,
 * nlupc/, tprb/) left over from the legacy portal.
 *
 * Maps each record to the organization's verified official website URL,
 * re-assigns the correct Source, and marks it VERIFIED (only if the URL is
 * actually reachable). No URLs are invented — every link is live-checked.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PREFIX_MAP = {
  nbs: { slug: "nbs", candidates: (title) => {
    const t = (title || "").toLowerCase();
    if (/(shapefile|gis|boundary|ward|district|region shape)/.test(t)) {
      return [
        "https://www.nbs.go.tz/statistics/topic/gis",
        "https://www.nbs.go.tz",
      ];
    }
    return ["https://www.nbs.go.tz"];
  } },
  lands_go_tz: { slug: "lands-tz", candidates: () => ["https://www.lands.go.tz"] },
  nlupc: { slug: "nlupc", candidates: () => ["https://www.nlupc.go.tz"] },
  tprb: { slug: "tprb", candidates: () => ["https://www.tprb.go.tz"] },
};

const UA =
  "TanzaniaGeoDataHub/1.0 (link verification; geospatial data catalogue)";

async function reachable(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA, "Accept-Language": "en" },
      signal: AbortSignal.timeout(15000),
      redirect: "manual",
    });
    return res.status >= 200 && res.status < 400;
  } catch {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": UA, "Accept-Language": "en" },
        signal: AbortSignal.timeout(20000),
        redirect: "follow",
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

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

  console.log(`records with invalid URLs: ${invalid.length}`);

  const byPrefix = {};
  for (const r of invalid) {
    const p = r.officialUrl.split(/[/\\]/)[0].toLowerCase();
    byPrefix[p] = byPrefix[p] || [];
    byPrefix[p].push(r);
  }

  let fixed = 0;
  let skipped = 0;
  const fails = [];

  for (const [prefix, list] of Object.entries(byPrefix)) {
    const mapping = PREFIX_MAP[prefix];
    if (!mapping) {
      skipped += list.length;
      console.log(`SKIP unknown prefix ${prefix} (${list.length})`);
      continue;
    }

    const source = await prisma.source.findUnique({ where: { slug: mapping.slug } });
    if (!source) {
      skipped += list.length;
      console.log(`SKIP missing source ${mapping.slug}`);
      continue;
    }

    for (const rec of list) {
      let chosen = null;
      for (const candidate of mapping.candidates(rec.name)) {
        if (await reachable(candidate)) {
          chosen = candidate;
          break;
        }
      }
      if (!chosen) {
        fails.push(`${rec.name} (${rec.officialUrl})`);
        skipped++;
        continue;
      }
      await prisma.dataset.update({
        where: { id: rec.id },
        data: {
          officialUrl: chosen,
          sourceUrl: chosen,
          sourceId: source.id,
          verificationStatus: "VERIFIED",
          lastVerified: new Date(),
        },
      });
      fixed++;
      console.log(`FIX ${rec.name.slice(0, 60)} -> ${chosen}`);
    }
  }

  console.log(`\nfixed: ${fixed}, skipped/failed: ${skipped}`);
  if (fails.length) {
    console.log("could not find reachable official URL for:");
    for (const f of fails.slice(0, 20)) console.log(`  - ${f}`);
  }
}

main().finally(() => prisma.$disconnect());