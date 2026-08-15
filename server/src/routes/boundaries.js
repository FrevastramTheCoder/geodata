import { Router } from "express";

import prisma from "../lib/prisma.js";

export const boundariesRouter = Router();

const PUBLIC_STATUSES = ["VERIFIED", "REQUEST_REQUIRED"];
const LEVELS = [
  "GLOBAL",
  "COUNTRY",
  "REGION",
  "DISTRICT",
  "COUNCIL",
  "WARD",
  "SHEHIA",
  "VILLAGE",
  "MTAA",
  "SUB_WARD",
  "HAMLET",
  "ENUMERATION_AREA",
];
const LEVEL_RANK = Object.fromEntries(LEVELS.map((l, i) => [l, i]));

const LEVELS_SQL = LEVELS.map((l) => `'${l}'`).join(", ");

/**
 * GET /api/boundaries
 * Filters: q (name partial), level, country, parentId, status
 * On-demand children via parentId for the hierarchy explorer.
 */
boundariesRouter.get("/", async (req, res) => {
  try {
    const { q, level, country, parentId, page = 1, perPage = 50 } = req.query;
    const where = { status: { in: PUBLIC_STATUSES } };
    if (q) {
      where.OR = [
        { name: { contains: String(q), mode: "insensitive" } },
        { officialName: { contains: String(q), mode: "insensitive" } },
        { code: { contains: String(q), mode: "insensitive" } },
      ];
    }
    if (level) {
      const normalizedLevel = String(level).toUpperCase();
      if (!LEVELS.includes(normalizedLevel)) return res.status(400).json({ error: "Invalid administrative level" });
      where.level = normalizedLevel;
    }
    if (country) where.country = String(country);
    if (parentId === "root") where.parentId = null;
    else if (parentId) where.parentId = String(parentId);

    const p = Math.max(1, Number(page) || 1);
    const pp = Math.min(100, Math.max(1, Number(perPage) || 50));

    const [total, items, relatedDatasets] = await Promise.all([
      prisma.administrativeArea.count({ where }),
      prisma.administrativeArea.findMany({
        where,
        orderBy: [{ level: "asc" }, { name: "asc" }],
        skip: (p - 1) * pp,
        take: pp,
        include: {
          _count: { select: { children: true } },
          parent: { select: { id: true, name: true, level: true } },
          source: { select: { id: true, name: true, slug: true } },
        },
      }),
      q
        ? prisma.dataset.findMany({
            where: {
              status: { in: ["PUBLISHED", "APPROVED"] },
              OR: [
                { name: { contains: String(q), mode: "insensitive" } },
                { description: { contains: String(q), mode: "insensitive" } },
                { coverage: { contains: String(q), mode: "insensitive" } },
                { region: { contains: String(q), mode: "insensitive" } },
              ],
            },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: { id: true, slug: true, name: true, coverage: true, region: true, officialUrl: true },
          })
        : Promise.resolve([]),
    ]);
    res.json({ total, page: p, perPage: pp, totalPages: Math.ceil(total / pp), items, relatedDatasets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/boundaries/tree?country=Tanzania&maxLevel=COUNCIL
 * Nested hierarchy built from roots, pruned at maxLevel (default COUNCIL).
 */
boundariesRouter.get("/tree", async (req, res) => {
  try {
    const { country = "Tanzania", maxLevel = "COUNCIL" } = req.query;
    const normalizedMaxLevel = String(maxLevel).toUpperCase();
    const maxRank = LEVEL_RANK[normalizedMaxLevel];
    if (maxRank === undefined) return res.status(400).json({ error: "Invalid maxLevel" });

    const rows = await prisma.administrativeArea.findMany({
      where: { country, status: { in: PUBLIC_STATUSES } },
      select: {
        id: true,
        name: true,
        officialName: true,
        code: true,
        level: true,
        parentId: true,
        accessUrl: true,
        year: true,
        version: true,
        status: true,
        lastVerifiedAt: true,
        sourceId: true,
        sourceUrl: true,
        geometry: true,
      },
    });

    const byId = new Map(rows.map((r) => [r.id, { ...r, children: [] }]));
    const roots = [];
    for (const row of rows) {
      const node = byId.get(row.id);
      const rank = LEVEL_RANK[row.level] ?? Infinity;
      if (rank > maxRank) continue;
      const parent = row.parentId ? byId.get(row.parentId) : null;
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
    res.json({ country, maxLevel: LEVELS[maxRank], total: rows.length, roots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/boundaries/:id — detail with direct children. */
boundariesRouter.get("/:id", async (req, res) => {
  try {
    const area = await prisma.administrativeArea.findFirst({
      where: { id: req.params.id, status: { in: PUBLIC_STATUSES } },
      include: {
        parent: { select: { id: true, name: true, level: true } },
        children: {
          orderBy: [{ level: "asc" }, { name: "asc" }],
          select: { id: true, name: true, code: true, level: true, status: true },
        },
        source: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!area) return res.status(404).json({ error: "Boundary not found" });
    res.json(area);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
