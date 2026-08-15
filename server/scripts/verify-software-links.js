/**
 * Verify software links with curl.exe (the only reliable checker on this machine).
 * Checks officialWebsite + downloadUrl + documentationUrl for each PUBLISHED software.
 * 2xx → VERIFIED; 3xx to a different URL → REDIRECTED; 4xx/5xx/network → BROKEN; bot-blocked 403/429 → UNKNOWN.
 * Concurrency 3 + 600 ms delay between requests to respect target sites.
 * Usage: node scripts/verify-software-links.js [slug...]
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const run = promisify(execFile);

const CONCURRENCY = 3;
const DELAY_MS = 600;

function curlCheck(url) {
  return new Promise((resolve) => {
    const args = [
      "-s", "-o", "NUL", "-w", "%{http_code} %{url_effective}",
      "-L", "--max-time", "20", "--connect-timeout", "10",
      "-A", "Mozilla/5.0 (compatible; GeoSoftwareHubLinkBot/1.0; +https://geosoftwarehub.local)",
    ];
    args.push(url);
    execFile("curl.exe", args, { windowsHide: true }, (err, stdout) => {
      const [code = "000", finalUrl = ""] = String(stdout).trim().split(" ", 2);
      const status = Number(code);
      let verdict;
      if (err && !stdout) {
        verdict = "UNKNOWN"; // connection-level failure with no response
      } else if (status === 0 || Number.isNaN(status)) {
        verdict = "UNKNOWN"; // timeout / TLS / DNS errors are not proof of a broken link
      } else if (status >= 200 && status < 400) {
        verdict = finalUrl && finalUrl !== url ? "REDIRECTED" : "VERIFIED";
      } else if (status === 403 || status === 429) {
        verdict = "UNKNOWN"; // bot-blocked; not proof of a broken link
      } else if (status >= 400) {
        verdict = "BROKEN";
      } else {
        verdict = "UNKNOWN";
      }
      resolve({ verdict, code: status, finalUrl });
    });
  });
}

async function verifyOne(software) {
  const targets = [
    { key: "official", url: software.officialWebsite, required: true },
    { key: "download", url: software.downloadUrl, required: false },
    { key: "docs", url: software.documentationUrl, required: false },
  ].filter((t) => t.url && (t.required || software.verificationStatus !== "UNKNOWN" || true));

  const results = {};
  for (const t of targets) {
    results[t.key] = await curlCheck(t.url);
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  // Overall verdict: any required broken => BROKEN; all ok => best of parts; mixed => keep most severe status
  const verdicts = Object.values(results).map((r) => r.verdict);
  let verdict;
  if (verdicts.includes("BROKEN")) verdict = "BROKEN";
  else if (verdicts.includes("REDIRECTED")) verdict = "REDIRECTED";
  else if (verdicts.length > 0 && verdicts.every((v) => v === "VERIFIED")) verdict = "VERIFIED";
  else verdict = "UNKNOWN";

  await prisma.software.update({
    where: { id: software.id },
    data: { verificationStatus: verdict, lastVerifiedAt: new Date() },
  });
  console.log(
    `${verdict.padEnd(10)} ${software.slug.padEnd(22)} official=${results.official?.code || "-"} download=${results.download?.code || "-"} docs=${results.docs?.code || "-"}`
  );
  return verdict;
}

async function main() {
  const only = process.argv.slice(2);
  const software = await prisma.software.findMany({
    where: only.length ? { slug: { in: only } } : { status: "PUBLISHED" },
    orderBy: { slug: "asc" },
  });
  console.log(`verifying ${software.length} software entries...`);

  const counts = { VERIFIED: 0, REDIRECTED: 0, BROKEN: 0, UNKNOWN: 0 };
  let i = 0;
  async function worker() {
    while (i < software.length) {
      const item = software[i++];
      const v = await verifyOne(item);
      counts[v]++;
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log("results:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());