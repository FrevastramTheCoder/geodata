import { Router } from "express";

import prisma from "../lib/prisma.js";
import { optionalUser, requireUser } from "../lib/auth.js";

export const trainingRouter = Router();
trainingRouter.use(optionalUser);

const COURSE_STATUSES = { status: "PUBLISHED" };

function publicCourse(course) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    instructor: course.instructor,
    category: course.category,
    level: course.level,
    duration: course.duration,
    preview: course.preview,
    learningObjectives: course.learningObjectives,
    certificateAvailable: course.certificateAvailable,
    lessonCount: course._count?.lessons ?? course.lessons?.length ?? 0,
    lessons: course.lessons?.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      orderNumber: lesson.orderNumber,
      duration: lesson.duration,
      isPreview: lesson.isPreview,
      ...(lesson.content !== undefined ? { content: lesson.content } : {}),
      ...(lesson.materials ? { materials: lesson.materials } : {}),
      ...(lesson.assignments ? { assignments: lesson.assignments } : {}),
    })),
  };
}

/** GET /api/training — public course catalogue and previews. */
trainingRouter.get("/", async (_req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: COURSE_STATUSES,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { lessons: true } } },
    });
    res.json(courses.map(publicCourse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/training/:slug — public metadata; full lesson content requires a session. */
trainingRouter.get("/:slug", async (req, res) => {
  try {
    const course = await prisma.course.findFirst({
      where: { slug: req.params.slug, ...COURSE_STATUSES },
      include: {
        _count: { select: { lessons: true } },
        lessons: { orderBy: { orderNumber: "asc" }, include: { materials: true, assignments: true } },
      },
    });
    if (!course) return res.status(404).json({ error: "Course not found" });
    const enrollment = req.user ? await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId: course.id } } }) : null;
    const canAccess = Boolean(req.user && enrollment);
    const response = publicCourse({
      ...course,
      lessons: canAccess ? course.lessons : course.lessons.map((lesson) => ({ ...lesson, content: undefined, materials: undefined, assignments: undefined })),
    });
    res.json({ ...response, enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/training/:slug/enroll */
trainingRouter.post("/:slug/enroll", requireUser, async (req, res) => {
  try {
    const course = await prisma.course.findFirst({ where: { slug: req.params.slug, ...COURSE_STATUSES } });
    if (!course) return res.status(404).json({ error: "Course not found" });
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: req.user.id, courseId: course.id } },
      update: {},
      create: { userId: req.user.id, courseId: course.id },
    });
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/training/lessons/:lessonId — protected direct lesson endpoint. */
trainingRouter.get("/lessons/:lessonId", requireUser, async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.lessonId },
      include: { course: true, materials: true, assignments: true, progress: { where: { userId: req.user.id } } },
    });
    if (!lesson || lesson.course.status !== "PUBLISHED") return res.status(404).json({ error: "Lesson not found" });
    const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId: lesson.courseId } } });
    if (!enrollment) return res.status(403).json({ error: "Enroll in this course to access the lesson" });
    res.json({ ...lesson, course: { id: lesson.course.id, slug: lesson.course.slug, title: lesson.course.title } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/training/lessons/:lessonId/complete */
trainingRouter.post("/lessons/:lessonId/complete", requireUser, async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId }, include: { course: true } });
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId: lesson.courseId } } });
    if (!enrollment) return res.status(403).json({ error: "Enroll in this course first" });

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: req.user.id, lessonId: lesson.id } },
      update: { completedAt: new Date() },
      create: { userId: req.user.id, lessonId: lesson.id, completedAt: new Date() },
    });
    const [lessonCount, completedCount] = await Promise.all([
      prisma.lesson.count({ where: { courseId: lesson.courseId } }),
      prisma.lessonProgress.count({ where: { userId: req.user.id, lesson: { courseId: lesson.courseId }, completedAt: { not: null } } }),
    ]);
    const progress = lessonCount ? Math.round((completedCount / lessonCount) * 100) : 0;
    const completedAt = progress === 100 ? new Date() : null;
    await prisma.enrollment.update({ where: { id: enrollment.id }, data: { progress, completedAt } });
    if (progress === 100 && lesson.course.certificateAvailable) {
      const certificateId = `GSH-${req.user.id.slice(-8)}-${lesson.courseId.slice(-8)}`;
      await prisma.certificate.upsert({
        where: { certificateId },
        update: {},
        create: {
          certificateId,
          userId: req.user.id,
          courseId: lesson.courseId,
          instructor: lesson.course.instructor,
          completionDate: completedAt || new Date(),
          issuer: "GIS & Remote Sensing Hub",
        },
      }).catch(() => {});
    }
    res.json({ progress, completed: progress === 100 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
