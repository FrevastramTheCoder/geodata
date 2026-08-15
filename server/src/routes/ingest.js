import { Router } from "express";

import prisma from "../lib/prisma.js";
import { getConnector, listConnectors, runConnector, runAllConnectors } from "../lib/sources/index.js";
import { requireAdminRole, requireUser } from "../lib/auth.js";

export const ingestRouter = Router();

/**
 * GET /api/ingest/sources
 * List registered connectors with last run info.
 */
ingestRouter.get("/sources", async (_req, res) => {
  try {
    const connectors = listConnectors();
    const lastRuns = await prisma.ingestRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
    });
    const lastRunBySource = new Map();
    for (const run of lastRuns) {
      if (!lastRunBySource.has(run.source)) lastRunBySource.set(run.source, run);
    }
    res.json(
      connectors.map((c) => ({
        ...c,
        lastRun: lastRunBySource.get(c.name) || null,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/ingest/all
 * Run every registered connector sequentially.
 */
ingestRouter.post("/all", requireUser, requireAdminRole, async (_req, res) => {
  try {
    const results = await runAllConnectors();
    res.json({ ok: true, results });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/ingest/:source
 * Run one connector's ingestion pipeline.
 */
ingestRouter.post("/:source", requireUser, requireAdminRole, async (req, res) => {
  const { source } = req.params;
  if (!getConnector(source)) {
    return res.status(404).json({ ok: false, error: `Unknown source connector: ${source}` });
  }
  try {
    const result = await runConnector(source);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/ingest/runs?source=&limit=
 * Ingestion run history.
 */
ingestRouter.get("/runs", async (req, res) => {
  try {
    const source = req.query.source;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const runs = await prisma.ingestRun.findMany({
      where: source ? { source: { contains: String(source) } } : undefined,
      orderBy: { startedAt: "desc" },
      take: limit,
    });
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
