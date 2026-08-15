import { Router } from "express";

import prisma from "../lib/prisma.js";
import { requireUser } from "../lib/auth.js";

export const researchRouter = Router();

/** GET /api/research — only approved community projects are public. */
researchRouter.get("/", async (_req, res) => {
  try {
    const items = await prisma.projectSubmission.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, title: true, description: true, projectUrl: true, category: true, createdAt: true },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/research — authenticated submissions start in PENDING_REVIEW. */
researchRouter.post("/", requireUser, async (req, res) => {
  const title = String(req.body?.title || "").trim();
  const description = String(req.body?.description || "").trim();
  const projectUrl = req.body?.projectUrl ? String(req.body.projectUrl).trim() : null;
  if (!title || !description || title.length > 200 || description.length > 5000) {
    return res.status(400).json({ error: "title and description are required" });
  }
  if (projectUrl) {
    try {
      const url = new URL(projectUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol');
    } catch {
      return res.status(400).json({ error: "projectUrl must be a valid HTTP(S) URL" });
    }
  }
  try {
    const item = await prisma.projectSubmission.create({ data: { userId: req.user.id, title, description, projectUrl, category: String(req.body?.category || "").trim().slice(0, 100) || null } });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
