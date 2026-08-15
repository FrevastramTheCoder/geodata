import { Router } from "express";

import prisma from "../lib/prisma.js";
import { recordActivity, recordView } from "../lib/activity.js";
import { optionalUser } from "../lib/auth.js";

export const datasetsRouter = Router();
datasetsRouter.use(optionalUser);

const PUBLIC_STATUSES = ["PUBLISHED", "APPROVED"];
const FILTER_FIELDS = ["category", "source", "country", "year", "dataType", "format", "accessType", "coverage"];
const SORTS = new Set(["relevance", "newest", "popular", "verified"]);

const LIKE_ESCAPE = (s) => s.replace(/[\\%_]/g, "\\$&");

function visibleDataset(dataset, user) {
  if (user || dataset.accessType !== "DIRECT_DOWNLOAD") return dataset;
  return { ...dataset, directUrl: null, protected: true };
}

/**
 * GET /api/datasets
 * Database-driven search engine:
 *  - PostgreSQL full-text search (tsvector + websearch_to_tsquery)
 *  - partial (ILIKE) matching across title, description, coverage, source, category
 *  - filters: category, source, year, coverage, dataType, format, accessType
 *  - ranking by relevance (title-weighted), newest, popular
 *  - pagination
 */
datasetsRouter.get("/", async (req, res) => {
  try {
    const { q, page = 1, perPage = 24, sort = "relevance", ...rawFilters } = req.query;

    const p = Math.max(1, Number(page) || 1);
    const pp = Math.min(100, Math.max(1, Number(perPage) || 24));
    const order = SORTS.has(sort) ? sort : "relevance";
    const query = q && String(q).trim() ? String(q).trim() : null;

    // --- Build WHERE clause with positional parameters ($1, $2, ...) ---
    const conditions = [];
    const params = [];

    // Prisma positionals start at 1
    let idx = 1;
    const push = (value) => {
      params.push(value);
      return `$${idx++}`;
    };

    conditions.push(`d.status IN (${push(PUBLIC_STATUSES[0])}, ${push(PUBLIC_STATUSES[1])})`);

    const filters = {};
    for (const key of FILTER_FIELDS) {
      const value = rawFilters[key];
      if (value) filters[key] = String(value);
    }

    if (filters.category) {
      conditions.push(`c.slug = ${push(filters.category)}`);
    }
    if (filters.source) {
      conditions.push(`s.slug = ${push(filters.source)}`);
    }
    if (filters.country) {
      conditions.push(`d."country" ILIKE ${push(`%${LIKE_ESCAPE(filters.country)}%`)}`);
    }
    if (filters.coverage) {
      conditions.push(`d."coverage" ILIKE ${push(`%${LIKE_ESCAPE(filters.coverage)}%`)}`);
    }
    if (filters.year) {
      conditions.push(`d."year" = ${push(Number(filters.year) || 0)}`);
    }
    if (filters.dataType) {
      conditions.push(`d."dataType" ILIKE ${push(`%${LIKE_ESCAPE(filters.dataType)}%`)}`);
    }
    if (filters.format) {
      conditions.push(`d."format" ILIKE ${push(`%${LIKE_ESCAPE(filters.format)}%`)}`);
    }
    if (filters.accessType) {
      conditions.push(`d."accessType" = ${push(filters.accessType)}`);
    }

    // --- Query text: full-text + tokenized partial matching ---
    let rankExpr = "0";
    if (query) {
      // Each query word must partially match in at least one searchable field.
      const tokens = query.split(/\s+/).filter(Boolean);
      const tokenGroups = tokens.map((token) => {
        const like = `%${LIKE_ESCAPE(token)}%`;
        return (
          `(d."name" ILIKE ${push(like)} OR d."description" ILIKE ${push(like)} OR ` +
          `d."coverage" ILIKE ${push(like)} OR d.tags::text ILIKE ${push(like)} OR ` +
          `s."name" ILIKE ${push(like)} OR c."name" ILIKE ${push(like)})`
        );
      });
      conditions.push(`(${tokenGroups.join(" AND ")})`);

      const tsQuery = push(query);
      rankExpr =
        `(ts_rank(setweight(to_tsvector('simple'::regconfig, coalesce(d."name",'')), 'A') || ` +
        `setweight(to_tsvector('simple'::regconfig, coalesce(d."description",'')), 'B') || ` +
        `setweight(to_tsvector('simple'::regconfig, coalesce(array_to_string(d.tags, ' '),'')), 'C'), ` +
        `websearch_to_tsquery('simple', ${tsQuery})) * 100) + ` +
        `(CASE WHEN d."name" ILIKE ${push(`%${LIKE_ESCAPE(tokens.join(" "))}%`)} THEN 12 ELSE 0 END) + ` +
        `(CASE WHEN d."description" ILIKE ${push(`%${LIKE_ESCAPE(tokens.join(" "))}%`)} THEN 4 ELSE 0 END)`;
    }

    let orderSql;
    if (order === "relevance" && query) {
      orderSql = `${rankExpr} DESC, d."createdAt" DESC`;
    } else if (order === "popular") {
      orderSql = `d.popular DESC, d."createdAt" DESC`;
    } else if (order === "verified") {
      orderSql = `d."lastVerified" DESC NULLS LAST, d."createdAt" DESC`;
    } else {
      orderSql = `d."createdAt" DESC`;
    }

    const whereSql = conditions.join(" AND ");

    // --- Count ---
    const countRows = await prisma.$queryRawUnsafe(
      `SELECT count(*)::int AS total FROM "Dataset" d
       LEFT JOIN "Category" c ON c.id = d."categoryId"
       LEFT JOIN "Source" s ON s.id = d."sourceId"
       WHERE ${whereSql}`,
      ...params,
    );
    const total = countRows[0].total;

    // --- Rows (ids only, ordered by rank) ---
    const rows = await prisma.$queryRawUnsafe(
      `SELECT d.id FROM "Dataset" d
       LEFT JOIN "Category" c ON c.id = d."categoryId"
       LEFT JOIN "Source" s ON s.id = d."sourceId"
       WHERE ${whereSql}
       ORDER BY ${orderSql}
       LIMIT ${pp} OFFSET ${(p - 1) * pp}`,
      ...params,
    );

    const ids = rows.map((r) => r.id);
    const items =
      ids.length > 0
        ? await prisma.dataset.findMany({
            where: { id: { in: ids } },
            include: { category: true, source: true },
          })
        : [];

    const byId = new Map(items.map((i) => [i.id, i]));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
    const administrativeAreas = query
      ? await prisma.administrativeArea.findMany({
          where: {
            status: { in: ["VERIFIED", "REQUEST_REQUIRED"] },
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { officialName: { contains: query, mode: "insensitive" } },
              { code: { contains: query, mode: "insensitive" } },
            ],
          },
          orderBy: [{ level: "asc" }, { name: "asc" }],
          take: 20,
          include: {
            parent: { select: { id: true, name: true, level: true } },
            source: { select: { id: true, name: true, slug: true } },
          },
        })
      : [];

    res.json({
      query: query || "",
      total,
      page: p,
      perPage: pp,
      totalPages: Math.ceil(total / pp),
      items: ordered.map((item) => visibleDataset(item, req.user)),
      administrativeAreas,
    });
    if (req.user && query) {
      await recordActivity({ userId: req.user.id, action: "SEARCH", resourceType: "DATASET", resourceId: query });
    }
  } catch (err) {
    console.error("datasets search error:", err);
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/datasets/:id — single dataset by id or slug (public = PUBLISHED/APPROVED). */
datasetsRouter.get("/:id", async (req, res) => {
  try {
    const dataset = await prisma.dataset.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }], status: { in: PUBLIC_STATUSES } },
      include: { category: true, source: true },
    });
    if (!dataset) return res.status(404).json({ error: "Dataset not found" });
    prisma.dataset.update({ where: { id: dataset.id }, data: { views: { increment: 1 } } }).catch(() => {});
    recordView({ userId: req.user?.id, resourceType: "DATASET", resourceId: dataset.id, datasetId: dataset.id });
    res.json(visibleDataset(dataset, req.user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
