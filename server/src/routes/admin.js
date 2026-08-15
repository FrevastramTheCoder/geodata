import { Router } from "express";

import prisma from "../lib/prisma.js";
import { requireAdminRole, requireSuperAdmin, requireUser } from "../lib/auth.js";
import { verifyUrl } from "../lib/verifyUrl.js";

export const adminRouter = Router();

const VALID_STATUSES = new Set([
  "DISCOVERED",
  "PENDING_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "REJECTED",
  "BROKEN_LINK",
  "ARCHIVED",
]);

const EDITABLE_FIELDS = [
  "name",
  "description",
  "coverage",
  "country",
  "year",
  "dataType",
  "format",
  "resolution",
  "license",
  "accessType",
  "officialUrl",
  "directUrl",
  "popular",
];

/** The admin console uses the same Google session as the public portal. */
adminRouter.post("/login", (_req, res) => {
  res.status(410).json({ error: "Admin sign-in uses Google OAuth at /login" });
});

/** All routes below require a current active ADMIN or SUPER_ADMIN user. */
adminRouter.use(requireUser, requireAdminRole);

/** GET /api/admin/stats — catalogue and user-management statistics. */
adminRouter.get("/stats", async (_req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const week = new Date(today);
    week.setUTCDate(week.getUTCDate() - 6);
    const month = new Date(today);
    month.setUTCDate(month.getUTCDate() - 29);
    const [group, totalUsers, activeUsers, suspendedUsers, newToday, newThisWeek, newThisMonth, totalCourses, totalSoftware, certificatesIssued, contactMessages, courseEnrollments, mostViewedDatasets, mostViewedSoftware, searchGroups] = await Promise.all([
      prisma.dataset.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: week } } }),
      prisma.user.count({ where: { createdAt: { gte: month } } }),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.software.count({ where: { status: "PUBLISHED" } }),
      prisma.certificate.count(),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
      prisma.enrollment.count(),
      prisma.dataset.findMany({ where: { status: { in: ["PUBLISHED", "APPROVED"] } }, orderBy: { views: "desc" }, take: 5, select: { id: true, slug: true, name: true, views: true } }),
      prisma.software.findMany({ where: { status: "PUBLISHED" }, orderBy: { views: "desc" }, take: 5, select: { id: true, slug: true, name: true, views: true } }),
      prisma.activityLog.groupBy({ by: ["resourceId"], where: { action: "SEARCH", resourceId: { not: null } }, _count: { _all: true }, orderBy: { _count: { resourceId: "desc" } }, take: 10 }),
    ]);
    const counts = Object.fromEntries(group.map((g) => [g.status, g._count._all]));
    const total = group.reduce((a, g) => a + g._count._all, 0);
    res.json({
      total,
      ...counts,
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, newToday: newToday, newThisWeek, newThisMonth },
      totalUsers,
      activeUsers,
      suspendedUsers,
      newUsersToday: newToday,
      newUsersThisWeek: newThisWeek,
      newUsersThisMonth: newThisMonth,
      totalCourses,
      totalSoftware,
      certificatesIssued,
      contactMessages,
      courseEnrollments,
      mostViewedDatasets,
      mostViewedSoftware,
      mostSearchedKeywords: searchGroups.map((item) => ({ keyword: item.resourceId, searches: item._count._all })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/datasets?status=&q=&page=&perPage= */
adminRouter.get("/datasets", async (req, res) => {
  try {
    const { status, q, page = 1, perPage = 25 } = req.query;
    const where = {};
    if (status) where.status = String(status);
    if (q) {
      where.OR = [
        { name: { contains: String(q), mode: "insensitive" } },
        { description: { contains: String(q), mode: "insensitive" } },
      ];
    }
    const [total, items] = await Promise.all([
      prisma.dataset.count({ where }),
      prisma.dataset.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        include: { category: true, source: true },
      }),
    ]);
    res.json({ total, page: Number(page), perPage: Number(perPage), totalPages: Math.ceil(total / Number(perPage)), items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/datasets/:id */
adminRouter.get("/datasets/:id", async (req, res) => {
  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id: req.params.id },
      include: { category: true, source: true },
    });
    if (!dataset) return res.status(404).json({ error: "Dataset not found" });
    res.json(dataset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/datasets/:id/status { status } */
adminRouter.patch("/datasets/:id/status", async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${[...VALID_STATUSES].join(", ")}` });
    }
    const dataset = await prisma.dataset.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(dataset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/datasets/:id — edit metadata. */
adminRouter.patch("/datasets/:id", async (req, res) => {
  try {
    const data = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in (req.body || {})) data[field] = req.body[field];
    }
    if (data.year !== undefined && data.year !== null) {
      data.year = Number(data.year) || null;
    }
    const dataset = await prisma.dataset.update({
      where: { id: req.params.id },
      data,
    });
    res.json(dataset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/admin/datasets/:id/verify-link */
adminRouter.post("/datasets/:id/verify-link", async (req, res) => {
  try {
    const dataset = await prisma.dataset.findUnique({ where: { id: req.params.id } });
    if (!dataset) return res.status(404).json({ error: "Dataset not found" });

    const url = dataset.officialUrl;
    const verification = await verifyUrl(url);
    const restrictedStatuses = new Set([401, 403, 429]);
    const verificationStatus = verification.reachable
      ? verification.finalUrl && verification.finalUrl !== url
        ? "REDIRECTED"
        : "VERIFIED"
      : restrictedStatuses.has(verification.httpStatus)
        ? "RESTRICTED"
        : "BROKEN";

    // Automatically flag broken links for admin review.
    const updateData = {
      verificationStatus,
      lastVerified: new Date(verification.verifiedAt),
    };
    if (verificationStatus === "BROKEN" && dataset.status !== "BROKEN_LINK") updateData.status = "BROKEN_LINK";
    await prisma.dataset.update({ where: { id: dataset.id }, data: updateData });

    await prisma.ingestLog.create({
      data: {
        level: verification.reachable ? "INFO" : "WARN",
        message: `Link verified for "${dataset.name}": ${verification.httpStatus} in ${verification.responseTimeMs}ms`,
        datasetId: dataset.id,
      },
    });

    res.json({ ...verification, verificationStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/sources — sources with dataset counts. */
adminRouter.get("/sources", async (_req, res) => {
  try {
    const sources = await prisma.source.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { datasets: true } } },
    });
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/logs — recent ingest runs + log entries. */
adminRouter.get("/logs", async (req, res) => {
  try {
    const runs = await prisma.ingestRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
    });
    const entries = await prisma.ingestLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { dataset: { select: { name: true } } },
    });
    res.json({ runs, entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/messages — contact inbox. */
adminRouter.get("/messages", async (req, res) => {
  try {
    const status = ["UNREAD", "READ", "ARCHIVED"].includes(String(req.query.status)) ? String(req.query.status) : undefined;
    const messages = await prisma.contactMessage.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" }, take: 200 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/messages/:id */
adminRouter.patch("/messages/:id", async (req, res) => {
  const status = String(req.body?.status || "");
  if (!["UNREAD", "READ", "ARCHIVED"].includes(status)) return res.status(400).json({ error: "Invalid message status" });
  try {
    const message = await prisma.contactMessage.update({ where: { id: req.params.id }, data: { status } });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/projects — pending research/project submissions. */
adminRouter.get("/projects", async (req, res) => {
  try {
    const status = ["PENDING_REVIEW", "APPROVED", "REJECTED"].includes(String(req.query.status)) ? String(req.query.status) : undefined;
    const projects = await prisma.projectSubmission.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" }, take: 200, include: { user: { select: { id: true, name: true, email: true } } } });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/courses — course and lesson inventory. */
adminRouter.get("/courses", async (_req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { lessons: true, enrollments: true, certificates: true } } },
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/courses/:id/status */
adminRouter.patch("/courses/:id/status", async (req, res) => {
  const status = String(req.body?.status || "");
  if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) return res.status(400).json({ error: "Invalid course status" });
  try {
    const course = await prisma.course.update({ where: { id: req.params.id }, data: { status } });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/projects/:id */
adminRouter.patch("/projects/:id", async (req, res) => {
  const status = String(req.body?.status || "");
  if (!["APPROVED", "REJECTED", "PENDING_REVIEW"].includes(status)) return res.status(400).json({ error: "Invalid project status" });
  try {
    const project = await prisma.projectSubmission.update({ where: { id: req.params.id }, data: { status } });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
};

/** GET /api/admin/users?q=&role=&status=&from=&to=&page=&perPage= */
adminRouter.get("/users", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().slice(0, 100);
    const page = Math.max(1, Number(req.query.page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(req.query.perPage) || 25));
    const where = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }
    if (["USER", "ADMIN", "SUPER_ADMIN"].includes(String(req.query.role))) where.role = String(req.query.role);
    if (["ACTIVE", "SUSPENDED", "DELETED"].includes(String(req.query.status))) where.status = String(req.query.status);
    const from = req.query.from ? new Date(String(req.query.from)) : null;
    const to = req.query.to ? new Date(String(req.query.to)) : null;
    if (from && !Number.isNaN(from.getTime())) where.createdAt = { ...(where.createdAt || {}), gte: from };
    if (to && !Number.isNaN(to.getTime())) {
      to.setUTCHours(23, 59, 59, 999);
      where.createdAt = { ...(where.createdAt || {}), lte: to };
    }
    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        select: USER_FIELDS,
      }),
    ]);
    res.json({ total, page, perPage, totalPages: Math.ceil(total / perPage), items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/users/:id — profile, activity, submissions and saved resources. */
adminRouter.get("/users/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: USER_FIELDS });
    if (!user) return res.status(404).json({ error: "User not found" });
    const [activity, submissions, favorites, recentlyViewed] = await Promise.all([
      prisma.activityLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, action: true, resourceType: true, resourceId: true, createdAt: true } }),
      prisma.submission.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, name: true, officialUrl: true, status: true, createdAt: true } }),
      prisma.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100, include: { dataset: { select: { id: true, slug: true, name: true } }, software: { select: { id: true, slug: true, name: true } }, opportunity: { select: { id: true, title: true } } } }),
      prisma.recentlyViewed.findMany({ where: { userId: user.id }, orderBy: { viewedAt: "desc" }, take: 100, include: { dataset: { select: { id: true, slug: true, name: true } }, software: { select: { id: true, slug: true, name: true } } } }),
    ]);
    res.json({ user, activity, submissions, favorites, recentlyViewed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function actorMayManageTarget(actor, target) {
  if (!target || target.id === actor.id || target.role === "SUPER_ADMIN" || target.status === "DELETED") return false;
  if (actor.role === "ADMIN") return target.role === "USER";
  return ["USER", "ADMIN"].includes(target.role);
}

/** PATCH /api/admin/users/:id/role — only SUPER_ADMIN may change roles. */
adminRouter.patch("/users/:id/role", requireSuperAdmin, async (req, res) => {
  try {
    const role = String(req.body?.role || "");
    if (!["USER", "ADMIN"].includes(role)) return res.status(400).json({ error: "Role must be USER or ADMIN" });
    const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, role: true, status: true } });
    if (!target) return res.status(404).json({ error: "User not found" });
    if (!actorMayManageTarget(req.user, target)) return res.status(403).json({ error: "You cannot change this user's role" });
    const user = await prisma.user.update({ where: { id: target.id }, data: { role }, select: USER_FIELDS });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/users/:id/status — lifecycle management with hierarchy checks. */
adminRouter.patch("/users/:id/status", async (req, res) => {
  try {
    const status = String(req.body?.status || "");
    if (!["ACTIVE", "SUSPENDED", "DELETED"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, role: true, status: true } });
    if (!target) return res.status(404).json({ error: "User not found" });
    if (!actorMayManageTarget(req.user, target)) return res.status(403).json({ error: "You cannot manage this user" });
    if (status === "DELETED") {
      const suffix = `${target.id}-${Date.now()}`;
      await prisma.$transaction([
        prisma.submission.updateMany({ where: { userId: target.id }, data: { submitterName: null, submitterEmail: null } }),
        prisma.favorite.deleteMany({ where: { userId: target.id } }),
        prisma.recentlyViewed.deleteMany({ where: { userId: target.id } }),
        prisma.user.update({ where: { id: target.id }, data: { name: "Deleted user", email: `deleted+${suffix}@redacted.invalid`, googleId: `deleted-${suffix}`, avatarUrl: null, status: "DELETED", lastLoginAt: null } }),
      ]);
    } else {
      await prisma.user.update({ where: { id: target.id }, data: { status } });
    }
    const user = await prisma.user.findUnique({ where: { id: target.id }, select: USER_FIELDS });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Legacy route retained as a safe alias for callers using DELETE. */
adminRouter.delete("/users/:id", async (req, res) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, role: true } });
    if (!target) return res.status(404).json({ error: "User not found" });
    if (!actorMayManageTarget(req.user, target)) return res.status(403).json({ error: "You cannot delete this user" });
    const suffix = `${target.id}-${Date.now()}`;
    await prisma.$transaction([
      prisma.submission.updateMany({ where: { userId: target.id }, data: { submitterName: null, submitterEmail: null } }),
      prisma.favorite.deleteMany({ where: { userId: target.id } }),
      prisma.recentlyViewed.deleteMany({ where: { userId: target.id } }),
      prisma.user.update({ where: { id: target.id }, data: { name: "Deleted user", email: `deleted+${suffix}@redacted.invalid`, googleId: `deleted-${suffix}`, avatarUrl: null, status: "DELETED", lastLoginAt: null } }),
    ]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const AREA_LEVELS = new Set([
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
]);

const AREA_EDITABLE_FIELDS = [
  "name",
  "officialName",
  "code",
  "level",
  "parentId",
  "country",
  "region",
  "district",
  "ward",
  "sourceId",
  "sourceUrl",
  "accessUrl",
  "year",
  "version",
  "geometry",
  "status",
];

/** GET /api/admin/boundaries?q=&level=&status=&parentId= */
adminRouter.get("/boundaries", async (req, res) => {
  try {
    const { q, level, status, parentId } = req.query;
    const where = {};
    if (q) {
      where.OR = [
        { name: { contains: String(q), mode: "insensitive" } },
        { code: { contains: String(q), mode: "insensitive" } },
      ];
    }
    if (level) where.level = String(level);
    if (status) where.status = String(status);
    if (parentId === "root") where.parentId = null;
    else if (parentId) where.parentId = String(parentId);

    const items = await prisma.administrativeArea.findMany({
      where,
      orderBy: [{ level: "asc" }, { name: "asc" }],
      take: 200,
      include: { _count: { select: { children: true } } },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/admin/boundaries — create an administrative area. */
adminRouter.post("/boundaries", async (req, res) => {
  try {
    const data = {};
    for (const field of AREA_EDITABLE_FIELDS) {
      if (field in (req.body || {})) data[field] = req.body[field];
    }
    if (!data.name || !data.level) {
      return res.status(400).json({ error: "name and level are required" });
    }
    if (!AREA_LEVELS.has(data.level)) {
      return res.status(400).json({ error: `Invalid level. Allowed: ${[...AREA_LEVELS].join(", ")}` });
    }
    if (data.year !== undefined && data.year !== null) data.year = Number(data.year) || null;
    if (data.geometry !== undefined && data.geometry !== null && (typeof data.geometry !== "object" || Array.isArray(data.geometry))) {
      return res.status(400).json({ error: "geometry must be a GeoJSON object" });
    }
    const area = await prisma.administrativeArea.create({ data });
    res.status(201).json(area);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/boundaries/:id — edit an administrative area. */
adminRouter.patch("/boundaries/:id", async (req, res) => {
  try {
    const data = {};
    for (const field of AREA_EDITABLE_FIELDS) {
      if (field in (req.body || {})) data[field] = req.body[field];
    }
    if (data.level !== undefined && !AREA_LEVELS.has(data.level)) {
      return res.status(400).json({ error: `Invalid level. Allowed: ${[...AREA_LEVELS].join(", ")}` });
    }
    if (data.year !== undefined && data.year !== null) data.year = Number(data.year) || null;
    if (data.geometry !== undefined && data.geometry !== null && (typeof data.geometry !== "object" || Array.isArray(data.geometry))) {
      return res.status(400).json({ error: "geometry must be a GeoJSON object" });
    }
    const area = await prisma.administrativeArea.update({
      where: { id: req.params.id },
      data,
    });
    res.json(area);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/admin/boundaries/:id — remove an administrative area. */
adminRouter.delete("/boundaries/:id", async (req, res) => {
  try {
    const children = await prisma.administrativeArea.count({
      where: { parentId: req.params.id },
    });
    if (children > 0) {
      return res.status(400).json({ error: `Cannot delete: has ${children} child area(s)` });
    }
    await prisma.administrativeArea.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
