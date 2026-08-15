import { Router } from "express";

import prisma from "../lib/prisma.js";
import { recordActivity } from "../lib/activity.js";
import { requireUser } from "../lib/auth.js";

export const userRouter = Router();
userRouter.use(requireUser);

const DATASET_STATUSES = { status: { in: ["PUBLISHED", "APPROVED"] } };

function cleanText(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** GET /api/me/profile */
userRouter.get("/profile", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: { select: { favorites: true, submissions: true, certificates: true, enrollments: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/me/dashboard */
userRouter.get("/dashboard", async (req, res) => {
  try {
    const [enrollments, completedLessons, favorites, recentlyViewed, submissions, certificates] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: req.user.id },
        orderBy: { updatedAt: "desc" },
        include: { course: { include: { _count: { select: { lessons: true } } } } },
      }),
      prisma.lessonProgress.count({ where: { userId: req.user.id, completedAt: { not: null } } }),
      prisma.favorite.count({ where: { userId: req.user.id } }),
      prisma.recentlyViewed.findMany({
        where: { userId: req.user.id },
        orderBy: { viewedAt: "desc" },
        take: 8,
        include: { dataset: { select: { id: true, slug: true, name: true } }, software: { select: { id: true, slug: true, name: true } } },
      }),
      prisma.submission.count({ where: { userId: req.user.id } }),
      prisma.certificate.count({ where: { userId: req.user.id } }),
    ]);

    res.json({
      stats: { completedLessons, favorites, submissions, certificates },
      courses: enrollments.map((enrollment) => ({
        id: enrollment.course.id,
        slug: enrollment.course.slug,
        title: enrollment.course.title,
        progress: enrollment.progress,
        completedAt: enrollment.completedAt,
        lessonCount: enrollment.course._count.lessons,
      })),
      recentlyViewed,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/me/favorites */
userRouter.get("/favorites", async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        dataset: { include: { category: true, source: true } },
        software: { include: { category: true, developer: true } },
        opportunity: true,
      },
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/me/favorites { resourceType: DATASET|SOFTWARE, resourceId } */
userRouter.post("/favorites", async (req, res) => {
  const resourceType = cleanText(req.body?.resourceType, 20).toUpperCase();
  const resourceId = cleanText(req.body?.resourceId, 160);
  if (!resourceId || !["DATASET", "SOFTWARE", "OPPORTUNITY"].includes(resourceType)) {
    return res.status(400).json({ error: "resourceType and resourceId are required" });
  }

  try {
    let data;
    if (resourceType === "DATASET") {
      const dataset = await prisma.dataset.findFirst({ where: { OR: [{ id: resourceId }, { slug: resourceId }], ...DATASET_STATUSES } });
      if (!dataset) return res.status(404).json({ error: "Dataset not found" });
      data = { resourceType, resourceId: dataset.id, datasetId: dataset.id };
    } else if (resourceType === "SOFTWARE") {
      const software = await prisma.software.findFirst({ where: { OR: [{ id: resourceId }, { slug: resourceId }], status: "PUBLISHED" } });
      if (!software) return res.status(404).json({ error: "Software not found" });
      data = { resourceType, resourceId: software.id, softwareId: software.id };
    } else {
      const opportunity = await prisma.opportunity.findFirst({ where: { id: resourceId, status: "PUBLISHED" } });
      if (!opportunity) return res.status(404).json({ error: "Opportunity not found" });
      data = { resourceType, resourceId: opportunity.id, opportunityId: opportunity.id };
    }

    const favorite = await prisma.favorite.upsert({
      where: { userId_resourceType_resourceId: { userId: req.user.id, resourceType, resourceId: data.resourceId } },
      update: {},
      create: { userId: req.user.id, ...data },
    });
    await recordActivity({ userId: req.user.id, action: "ADD_FAVORITE", resourceType, resourceId: data.resourceId, datasetId: data.datasetId, softwareId: data.softwareId });
    res.status(201).json(favorite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/me/favorites/:resourceType/:resourceId */
userRouter.delete("/favorites/:resourceType/:resourceId", async (req, res) => {
  const resourceType = cleanText(req.params.resourceType, 20).toUpperCase();
  const resourceId = cleanText(req.params.resourceId, 160);
  if (!resourceId || !["DATASET", "SOFTWARE", "OPPORTUNITY"].includes(resourceType)) {
    return res.status(400).json({ error: "Invalid favorite" });
  }
  try {
    await prisma.favorite.deleteMany({ where: { userId: req.user.id, resourceType, resourceId } });
    await recordActivity({ userId: req.user.id, action: "REMOVE_FAVORITE", resourceType, resourceId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/me/certificates */
userRouter.get("/certificates", async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: req.user.id },
      orderBy: { completionDate: "desc" },
      include: { course: { select: { title: true, slug: true } } },
    });
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
