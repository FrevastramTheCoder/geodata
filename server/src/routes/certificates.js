import { Router } from "express";

import prisma from "../lib/prisma.js";
import { requireUser } from "../lib/auth.js";

export const certificatesRouter = Router();

/** GET /api/certificates/verify/:certificateId — public verification. */
certificatesRouter.get("/verify/:certificateId", async (req, res) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateId: req.params.certificateId },
      include: { user: { select: { name: true } }, course: { select: { title: true, slug: true } } },
    });
    if (!certificate) return res.status(404).json({ error: "Certificate not found" });
    res.json({
      certificateId: certificate.certificateId,
      studentName: certificate.user.name,
      course: certificate.course.title,
      courseSlug: certificate.course.slug,
      instructor: certificate.instructor,
      completionDate: certificate.completionDate,
      issuer: certificate.issuer,
      verificationUrl: certificate.verificationUrl || `/verify/${certificate.certificateId}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/certificates — current user's certificates. */
certificatesRouter.get("/", requireUser, async (req, res) => {
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
