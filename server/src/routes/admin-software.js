import { Router } from "express";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import prisma from "../lib/prisma.js";
import { requireAdminRole, requireUser } from "../lib/auth.js";

export const adminSoftwareRouter = Router();
adminSoftwareRouter.use(requireUser, requireAdminRole);

const run = promisify(execFile);

const EDITABLE = [
  "name", "description", "developerId", "categoryId", "licenseType", "pricing",
  "operatingSystems", "technology", "version", "officialWebsite", "downloadUrl",
  "documentationUrl", "tutorialUrl", "systemRequirements", "keywords", "logoUrl",
  "status", "verificationStatus", "hasGIS", "hasRemoteSensing", "has3D", "hasCAD",
  "hasBIM", "hasWeb", "hasDatabase", "hasPython", "studentAccess",
];

const LICENSES = ["FREE", "OPEN_SOURCE", "FREEMIUM", "EDUCATIONAL", "COMMERCIAL", "TRIAL"];
const STATUSES = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "BROKEN"];

function pick(body) {
  const data = {};
  for (const f of EDITABLE) if (f in (body || {})) data[f] = body[f];
  return data;
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function curlCheck(url) {
  return new Promise((resolve) => {
    const args = ["-s", "-o", "NUL", "-w", "%{http_code} %{url_effective}", "-L", "--max-time", "20", "--connect-timeout", "10", "-A", "Mozilla/5.0 (compatible; GeoSoftwareHubLinkBot/1.0)"];
    args.push(url);
    execFile("curl.exe", args, { windowsHide: true }, (err, stdout) => {
      const [code = "000", finalUrl = ""] = String(stdout).trim().split(" ", 2);
      const status = Number(code);
      let verdict;
      if (err && !stdout) verdict = "UNKNOWN";
      else if (status === 0 || Number.isNaN(status)) verdict = "UNKNOWN";
      else if (status >= 200 && status < 400) verdict = finalUrl && finalUrl !== url ? "REDIRECTED" : "VERIFIED";
      else if (status === 403 || status === 429) verdict = "UNKNOWN";
      else if (status >= 400) verdict = "BROKEN";
      else verdict = "UNKNOWN";
      resolve({ verdict, code: status });
    });
  });
}

/** GET /api/admin/software?q=&status=&license=&perPage= */
adminSoftwareRouter.get("/software", async (req, res) => {
  try {
    const { q, status, license, perPage = 100 } = req.query;
    const where = {};
    if (status) where.status = String(status);
    if (license) where.licenseType = String(license);
    if (q) {
      where.OR = [
        { name: { contains: String(q), mode: "insensitive" } },
        { slug: { contains: String(q), mode: "insensitive" } },
        { developer: { name: { contains: String(q), mode: "insensitive" } } },
      ];
    }
    const items = await prisma.software.findMany({
      where,
      orderBy: [{ status: "asc" }, { views: "desc" }],
      take: Math.min(500, Number(perPage) || 100),
      include: { category: true, developer: true },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/admin/software — create (name + officialWebsite required). */
adminSoftwareRouter.post("/software", async (req, res) => {
  try {
    const data = pick(req.body);
    if (!data.name || !data.officialWebsite) {
      return res.status(400).json({ error: "name and officialWebsite are required" });
    }
    if (!data.slug) data.slug = slugify(data.name);
    const existing = await prisma.software.findUnique({ where: { slug: data.slug } });
    if (existing) return res.status(400).json({ error: `slug "${data.slug}" already in use` });
    if (data.licenseType && !LICENSES.includes(data.licenseType)) return res.status(400).json({ error: "Invalid licenseType" });
    if (!data.licenseType) data.licenseType = "COMMERCIAL";
    if (!data.description) data.description = "Details pending.";
    if (!data.status) data.status = "PENDING_REVIEW";
    if (!data.verificationStatus) data.verificationStatus = "UNKNOWN";
    const item = await prisma.software.create({ data });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/software/:id */
adminSoftwareRouter.patch("/software/:id", async (req, res) => {
  try {
    const data = pick(req.body);
    if (data.slug) {
      const dup = await prisma.software.findUnique({ where: { slug: data.slug } });
      if (dup && dup.id !== req.params.id) return res.status(400).json({ error: "slug already in use" });
    }
    if (data.licenseType && !LICENSES.includes(data.licenseType)) return res.status(400).json({ error: "Invalid licenseType" });
    if (data.status && !STATUSES.includes(data.status)) return res.status(400).json({ error: "Invalid status" });
    const item = await prisma.software.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/admin/software/:id */
adminSoftwareRouter.delete("/software/:id", async (req, res) => {
  try {
    await prisma.software.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/admin/software/:id/verify — live link check (respectful, single pass). */
adminSoftwareRouter.post("/software/:id/verify", async (req, res) => {
  try {
    const item = await prisma.software.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    const targets = [
      { key: "official", url: item.officialWebsite, required: true },
      { key: "download", url: item.downloadUrl, required: false },
      { key: "docs", url: item.documentationUrl, required: false },
    ].filter((t) => t.url);
    const results = {};
    for (const t of targets) {
      results[t.key] = await curlCheck(t.url);
    }
    const verdicts = Object.values(results).map((r) => r.verdict);
    let verdict;
    if (verdicts.includes("BROKEN")) verdict = "BROKEN";
    else if (verdicts.includes("REDIRECTED")) verdict = "REDIRECTED";
    else if (verdicts.length && verdicts.every((v) => v === "VERIFIED")) verdict = "VERIFIED";
    else verdict = "UNKNOWN";
    const updated = await prisma.software.update({
      where: { id: item.id },
      data: { verificationStatus: verdict, lastVerifiedAt: new Date() },
    });
    res.json({ verificationStatus: updated.verificationStatus, lastVerifiedAt: updated.lastVerifiedAt, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/software/submissions — user submissions. */
adminSoftwareRouter.get("/software/submissions", async (_req, res) => {
  try {
    const items = await prisma.softwareSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/software/submissions/:id — approve (creates software) or reject. */
adminSoftwareRouter.patch("/software/submissions/:id", async (req, res) => {
  try {
    const sub = await prisma.softwareSubmission.findUnique({ where: { id: req.params.id } });
    if (!sub) return res.status(404).json({ error: "Not found" });
    const action = req.body?.status;
    if (action === "APPROVED") {
      const data = {
        name: sub.name,
        slug: slugify(sub.name),
        description: sub.description || `${sub.name} — submitted for review.`,
        categoryId: null,
        licenseType: "COMMERCIAL",
        pricing: "To be verified",
        operatingSystems: [],
        technology: [],
        officialWebsite: sub.officialWebsite,
        downloadUrl: sub.downloadUrl,
        keywords: [sub.category || "submitted"],
        status: "PUBLISHED",
        verificationStatus: "UNKNOWN",
      };
      const existing = await prisma.software.findUnique({ where: { slug: data.slug } });
      if (existing) data.slug = `${data.slug}-${sub.id.slice(0, 6)}`;
      await prisma.software.create({ data });
      await prisma.softwareSubmission.update({ where: { id: sub.id }, data: { status: "APPROVED", notes: "Approved and added to catalogue" } });
    } else if (action === "REJECTED") {
      await prisma.softwareSubmission.update({ where: { id: sub.id }, data: { status: "REJECTED", notes: req.body?.notes || null } });
    } else {
      return res.status(400).json({ error: "status must be APPROVED or REJECTED" });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/admin/software/submissions/:id */
adminSoftwareRouter.delete("/software/submissions/:id", async (req, res) => {
  try {
    await prisma.softwareSubmission.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/software-categories */
adminSoftwareRouter.get("/software-categories", async (_req, res) => {
  try {
    const items = await prisma.softwareCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { software: true } } },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/admin/software-categories */
adminSoftwareRouter.post("/software-categories", async (req, res) => {
  try {
    const { name, slug, description, sortOrder } = req.body || {};
    if (!name || !slug) return res.status(400).json({ error: "name and slug are required" });
    const item = await prisma.softwareCategory.create({ data: { name, slug, description, sortOrder: Number(sortOrder) || 0 } });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/software-categories/:id */
adminSoftwareRouter.patch("/software-categories/:id", async (req, res) => {
  try {
    const { name, slug, description, sortOrder } = req.body || {};
    const data = {};
    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (description !== undefined) data.description = description;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder) || 0;
    const item = await prisma.softwareCategory.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/admin/software-categories/:id (moves software to uncategorized). */
adminSoftwareRouter.delete("/software-categories/:id", async (req, res) => {
  try {
    await prisma.software.updateMany({ where: { categoryId: req.params.id }, data: { categoryId: null } });
    await prisma.softwareCategory.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/developers */
adminSoftwareRouter.get("/developers", async (_req, res) => {
  try {
    const items = await prisma.developer.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { software: true } } },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/admin/developers */
adminSoftwareRouter.post("/developers", async (req, res) => {
  try {
    const { name, slug, website, description } = req.body || {};
    if (!name) return res.status(400).json({ error: "name is required" });
    const item = await prisma.developer.create({
      data: { name, slug: slug || slugify(name), website, description },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/admin/developers/:id */
adminSoftwareRouter.patch("/developers/:id", async (req, res) => {
  try {
    const { name, slug, website, description } = req.body || {};
    const data = {};
    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (website !== undefined) data.website = website;
    if (description !== undefined) data.description = description;
    const item = await prisma.developer.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/admin/developers/:id */
adminSoftwareRouter.delete("/developers/:id", async (req, res) => {
  try {
    await prisma.developer.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
