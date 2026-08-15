/**
 * Scheduled ingestion — runs all source connectors every 24 hours.
 * Configurable via INGEST_INTERVAL_HOURS (default 24).
 * Never overlaps a previous run.
 */

import { runAllConnectors } from "./sources/index.js";

let running = false;
let timer = null;

export function startScheduler() {
  if (timer) return timer;

  const hours = Math.max(1, Number(process.env.INGEST_INTERVAL_HOURS) || 24);
  const intervalMs = hours * 60 * 60 * 1000;

  timer = setInterval(async () => {
    if (running) return;
    running = true;
    console.log(`[scheduler] running all connectors (${new Date().toISOString()})`);
    try {
      const results = await runAllConnectors();
      console.log(`[scheduler] done: ${JSON.stringify(results.map((r) => ({ source: r.source, created: r.created, duplicates: r.duplicates })))}`);
    } catch (err) {
      console.error(`[scheduler] failed: ${err.message}`);
    } finally {
      running = false;
    }
  }, intervalMs);

  timer.unref?.();
  console.log(`[scheduler] started, interval ${hours}h`);
  return timer;
}

export function stopScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}