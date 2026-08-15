import { Router } from "express";

import prisma from "../lib/prisma.js";
import { optionalUser } from "../lib/auth.js";

export const opportunitiesRouter = Router();
opportunitiesRouter.use(optionalUser);

/** GET /api/opportunities?q=&category= */
opportunitiesRouter.get("/", async (req, res) => {
  try {
    const where = { status: "PUBLISHED" };
    const category = String(req.query.category || "").trim();
    const q = String(req.query.q || "").trim().slice(0, 100);
    if (category) where.category = category;
    if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { organization: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];
    const items = await prisma.opportunity.findMany({ where, orderBy: [{ deadline: "asc" }, { createdAt: "desc" }], take: 100 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/opportunities/:id */
opportunitiesRouter.get("/:id", async (req, res) => {
  try {
    const item = await prisma.opportunity.findFirst({ where: { id: req.params.id, status: "PUBLISHED" } });
    if (!item) return res.status(404).json({ error: "Opportunity not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
