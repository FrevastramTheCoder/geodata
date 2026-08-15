import { Router } from "express";

import prisma from "../lib/prisma.js";
import { recordActivity, recordView } from "../lib/activity.js";
import { optionalUser } from "../lib/auth.js";

export const softwareRouter = Router();
softwareRouter.use(optionalUser);

const PUBLIC = { status: "PUBLISHED" };
const FREE_LICENSES = ["FREE", "OPEN_SOURCE"];

function normalize(q) {
  const sort = ["popular", "verified", "name", "free", "open", "newest"].includes(q.sort) ? q.sort : "popular";
  const page = Math.max(1, Number(q.page) || 1);
  const perPage = Math.min(60, Math.max(1, Number(q.perPage) || 24));
  return {
    sort,
    page,
    perPage,
    q: String(q.q || "").trim().slice(0, 120),
    category: String(q.category || "").trim().slice(0, 120),
    developer: String(q.developer || "").trim().slice(0, 120),
    license: String(q.license || "").trim().toUpperCase(),
    os: String(q.os || "").trim().slice(0, 40),
    technology: String(q.technology || "").trim().slice(0, 80),
    free: q.free === "true",
    student: q.student === "true",
    verified: q.verified === "true",
  };
}

function buildWhere(q) {
  const where = { ...PUBLIC };
  const filters = [];
  if (q.category) filters.push({ category: { slug: q.category } });
  if (q.developer) filters.push({ developer: { slug: q.developer } });
  if (q.license) filters.push({ licenseType: q.license });
  else if (q.free) filters.push({ licenseType: { in: FREE_LICENSES } });
  if (q.os) filters.push({ operatingSystems: { has: q.os } });
  if (q.technology) filters.push({ technology: { has: q.technology } });
  if (q.student) filters.push({ studentAccess: true });
  if (q.verified) filters.push({ verificationStatus: { in: ["VERIFIED", "REDIRECTED"] } });
  const term = q.q;
  if (term) {
    filters.push({ OR: [
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { keywords: { has: term } },
      { technology: { has: term } },
      { licenseType: { contains: term, mode: "insensitive" } },
      { operatingSystems: { has: term } },
      { developer: { name: { contains: term, mode: "insensitive" } } },
      { category: { name: { contains: term, mode: "insensitive" } } },
    ] });
  }
  if (filters.length) where.AND = filters;
  return where;
}

function orderBy(sort) {
  switch (sort) {
    case "name":
      return [{ name: "asc" }];
    case "verified":
      return [{ lastVerifiedAt: "desc" }, { views: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    case "free":
      return [{ licenseType: "asc" }, { views: "desc" }]; // FREE/OPEN_SOURCE sort before commercial alphabetically
    case "open":
      return [{ licenseType: "asc" }, { views: "desc" }];
    default:
      return [{ views: "desc" }, { lastVerifiedAt: "desc" }];
  }
}

/** GET /api/software — search + filters + sort. */
softwareRouter.get("/", async (req, res) => {
  try {
    const filters = normalize(req.query);
    const { sort, page, perPage } = filters;
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.software.findMany({
        where,
        orderBy: orderBy(sort),
        skip: (page - 1) * perPage,
        take: perPage,
        include: { category: true, developer: true },
      }),
      prisma.software.count({ where }),
    ]);
    res.json({ items, total, page, perPage });
    if (req.user && filters.q) {
      await recordActivity({ userId: req.user.id, action: "SEARCH", resourceType: "SOFTWARE", resourceId: filters.q });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/software/categories — with published counts. */
softwareRouter.get("/categories", async (_req, res) => {
  try {
    const categories = await prisma.softwareCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });
    const counts = await Promise.all(
      categories.map((category) =>
        prisma.software.count({ where: { ...PUBLIC, categoryId: category.id } }),
      ),
    );
    res.json(categories.map((category, index) => ({ ...category, _count: { software: counts[index] } })));
  } catch (err) {
    console.error("software categories error:", err);
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/software/stats — live database statistics. */
softwareRouter.get("/stats", async (_req, res) => {
  try {
    const [total, categories, free, openSource, commercial, educational, trial, freemium, verified] = await Promise.all([
      prisma.software.count({ where: PUBLIC }),
      prisma.softwareCategory.count(),
      prisma.software.count({ where: { ...PUBLIC, licenseType: "FREE" } }),
      prisma.software.count({ where: { ...PUBLIC, licenseType: "OPEN_SOURCE" } }),
      prisma.software.count({ where: { ...PUBLIC, licenseType: "COMMERCIAL" } }),
      prisma.software.count({ where: { ...PUBLIC, licenseType: "EDUCATIONAL" } }),
      prisma.software.count({ where: { ...PUBLIC, licenseType: "TRIAL" } }),
      prisma.software.count({ where: { ...PUBLIC, licenseType: "FREEMIUM" } }),
      prisma.software.count({ where: { ...PUBLIC, verificationStatus: { in: ["VERIFIED", "REDIRECTED"] } } }),
    ]);
    res.json({
      total,
      categories,
      free: free + openSource,
      openSource,
      commercial,
      educational,
      trial,
      freemium,
      verified,
    });
  } catch (err) {
    console.error("software stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/software/submissions — public software suggestion. */
softwareRouter.post("/submissions", async (req, res) => {
  try {
    const { name, officialWebsite, downloadUrl, category, description, submitterName, submitterEmail } = req.body || {};
    if (!name || !officialWebsite) {
      return res.status(400).json({ error: "name and officialWebsite are required" });
    }
    if (String(name).trim().length > 200 || String(description || "").length > 5000) {
      return res.status(400).json({ error: "Submission text is too long" });
    }
    try {
      const official = new URL(officialWebsite);
      if (!['http:', 'https:'].includes(official.protocol)) throw new Error('invalid protocol');
      if (downloadUrl) {
        const download = new URL(downloadUrl);
        if (!['http:', 'https:'].includes(download.protocol)) throw new Error('invalid protocol');
      }
    } catch {
      return res.status(400).json({ error: "officialWebsite and downloadUrl must be valid HTTP(S) URLs" });
    }
    const sub = await prisma.softwareSubmission.create({
      data: {
        name,
        officialWebsite,
        downloadUrl,
        category,
        description,
        submitterName,
        submitterEmail,
        status: "PENDING_REVIEW",
      },
    });
    await recordActivity({ userId: req.user?.id, action: "SUBMIT_SOFTWARE", resourceType: "SOFTWARE_SUBMISSION", resourceId: sub.id });
    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/software/:slug — detail, increments views, related items. */
softwareRouter.get("/:slug", async (req, res) => {
  try {
    const item = await prisma.software.findUnique({
      where: { slug: String(req.params.slug) },
      include: { category: true, developer: true },
    });
    if (!item || item.status !== "PUBLISHED") {
      return res.status(404).json({ error: "Not found" });
    }
    prisma.software
      .update({ where: { id: item.id }, data: { views: { increment: 1 } } })
      .catch(() => {});
    recordView({ userId: req.user?.id, resourceType: "SOFTWARE", resourceId: item.id, softwareId: item.id });
    const related = await prisma.software.findMany({
      where: { categoryId: item.categoryId, status: "PUBLISHED", id: { not: item.id } },
      orderBy: { views: "desc" },
      take: 3,
      include: { category: true },
    });
    res.json({ ...item, related });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
