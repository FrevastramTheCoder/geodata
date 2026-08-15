/**
 * CLI: run a source connector ingestion.
 *
 * Usage:
 *   node scripts/ingest.js nbs
 *   node scripts/ingest.js all
 */

import { runConnector, runAllConnectors, listConnectors } from "../src/lib/sources/index.js";

const args = process.argv.slice(2);
const slug = args[0];

async function main() {
  if (!slug || slug === "list") {
    console.log("Registered connectors:");
    for (const c of listConnectors()) console.log(`  ${c.slug} — ${c.name}`);
    return;
  }

  const started = Date.now();
  if (slug === "all") {
    console.log("Running all connectors...");
    const results = await runAllConnectors();
    for (const r of results) {
      console.log(
        `[${r.error ? "FAIL" : "OK"}] ${r.source}: discovered=${r.discovered} created=${r.created} duplicates=${r.duplicates} broken=${r.brokenLinks} errors=${r.parseErrors}${r.error ? ` (${r.error})` : ""}`,
      );
    }
  } else {
    const result = await runConnector(slug);
    console.log(JSON.stringify(result, null, 2));
  }
  console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});