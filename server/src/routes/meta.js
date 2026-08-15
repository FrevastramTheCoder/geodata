import { Router } from "express";

import prisma from "../lib/prisma.js";
import { recordActivity } from "../lib/activity.js";
import { optionalUser } from "../lib/auth.js";

export const metaRouter = Router();
metaRouter.use(optionalUser);

/** GET /api/categories — with dataset counts (published only). */
metaRouter.get("/categories", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { datasets: { where: { status: { in: ["PUBLISHED", "APPROVED"] } } } },
        },
      },
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/sources — with published dataset counts. */
metaRouter.get("/sources", async (_req, res) => {
  try {
    const sources = await prisma.source.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { datasets: { where: { status: { in: ["PUBLISHED", "APPROVED"] } } } },
        },
      },
    });
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/stats — homepage statistics. */
metaRouter.get("/stats", async (_req, res) => {
  try {
    const [datasets, sources, categories] = await Promise.all([
      prisma.dataset.count({ where: { status: { in: ["PUBLISHED", "APPROVED"] } } }),
      prisma.source.count(),
      prisma.category.count(),
    ]);
    res.json({ datasets, sources, categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/submissions — create a public dataset submission. */
metaRouter.post("/submissions", async (req, res) => {
  try {
    const {
      name, description, category, coverage, source, year,
      dataType, format, resolution, license, officialUrl, directUrl,
      submitterName, submitterEmail,
    } = req.body || {};

    if (!name || !officialUrl) {
      return res.status(400).json({ error: "name and officialUrl are required" });
    }
    if (String(name).trim().length > 200 || String(description || "").length > 5000) {
      return res.status(400).json({ error: "Submission text is too long" });
    }
    try {
      const parsedUrl = new URL(officialUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('invalid protocol');
      if (directUrl) {
        const parsedDirectUrl = new URL(directUrl);
        if (!['http:', 'https:'].includes(parsedDirectUrl.protocol)) throw new Error('invalid protocol');
      }
    } catch {
      return res.status(400).json({ error: "officialUrl and directUrl must be valid HTTP(S) URLs" });
    }

    const submission = await prisma.submission.create({
      data: {
        name,
        description,
        category,
        coverage,
        source,
        year: year ? Number(year) : null,
        dataType,
        format,
        resolution,
        license,
        officialUrl,
        directUrl,
        submitterName,
        submitterEmail,
        userId: req.user?.id || null,
        status: "PENDING_REVIEW",
      },
    });
    await recordActivity({ userId: req.user?.id, action: "SUBMIT_DATASET", resourceType: "SUBMISSION", resourceId: submission.id });
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/submissions — public list (approved only, lightweight). */
metaRouter.get("/submissions", async (_req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, category: true, officialUrl: true, createdAt: true },
    });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
