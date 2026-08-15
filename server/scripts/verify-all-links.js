/**
 * Full catalogue link verification.
 *
 * Checks every dataset's officialUrl (HEAD, GET fallback) politely:
 *  - per-host minimum delay
 *  - bounded concurrency
 *  - timeouts
 *
 * Updates:
 *  verificationStatus = VERIFIED | REDIRECTED | BROKEN | UNKNOWN
 *  status = BROKEN_LINK (and lastVerified) when unreachable
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CONCURRENCY = 6;
const HOST_DELAY_MS = 700;
const UA = "TanzaniaGeoDataHub/1.0 (link verification; geospatial data catalogue)";

const lastHit = new Map();
async function throttle(host) {
  const now = Date.now();
  const wait = HOST_DELAY_MS - (now - (lastHit.get(host) || 0));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastHit.set(host, Date.now());
}

async function check(url) {
  let host = "";
  try {
    host = new URL(url).host;
  } catch {
    return { reachable: false, status: null, redirected: false, error: "invalid url" };
  }
  await throttle(host);

  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA, "Accept-Language": "en" },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });
    return {
      reachable: res.ok,
      status: res.status,
      redirected: res.redirected,
      error: null,
    };
  } catch (headErr) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": UA, "Accept-Language": "en" },
        signal: AbortSignal.timeout(25000),
        redirect: "follow",
      });
      return {
        reachable: res.ok,
        status: res.status,
        redirected: res.redirected,
        error: res.ok ? null : `http ${res.status}`,
      };
    } catch (getErr) {
      return {
        reachable: false,
        status: null,
        redirected: false,
        error: (headErr.message || "") + (getErr.message || ""),
      };
    }
  }
}

async function main() {
  const rows = await prisma.dataset.findMany({
    select: { id: true, name: true, officialUrl: true, status: true },
  });
  console.log(`verifying ${rows.length} datasets`);

  let idx = 0;
  let verified = 0;
  let redirected = 0;
  let broken = 0;
  const brokenList = [];
  const skipped = [];

  async function worker() {
    while (idx < rows.length) {
      const rec = rows[idx++];
      let url = rec.officialUrl;
      try {
        new URL(url);
      } catch {
        skipped.push(rec);
        continue;
      }

      const result = await check(url);
      const status = result.reachable
        ? result.redirected
          ? "REDIRECTED"
          : "VERIFIED"
        : "BROKEN";

      const data = {
        verificationStatus: status,
        lastVerified: new Date(),
      };
      if (!result.reachable && rec.status !== "BROKEN_LINK") {
        data.status = "BROKEN_LINK";
        brokenList.push(`${rec.name.slice(0, 70)} | ${url} | ${result.error}`);
      }

      await prisma.dataset.update({ where: { id: rec.id }, data });

      if (status === "VERIFIED") verified++;
      else if (status === "REDIRECTED") redirected++;
      else broken++;
      if (idx % 100 === 0) console.log(`  progress: ${idx}/${rows.length}`);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\nDONE: verified=${verified} redirected=${redirected} broken=${broken} skipped=${skipped.length}`);
  if (brokenList.length) {
    console.log("broken links:");
    for (const b of brokenList) console.log(`  - ${b}`);
  }
}

main().finally(() => prisma.$disconnect());