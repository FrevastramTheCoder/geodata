import express from "express";
import cors from "cors";

import prisma from "./lib/prisma.js";
import { datasetsRouter } from "./routes/datasets.js";
import { ingestRouter } from "./routes/ingest.js";
import { metaRouter } from "./routes/meta.js";
import { adminRouter } from "./routes/admin.js";
import { adminSoftwareRouter } from "./routes/admin-software.js";
import { authRouter } from "./routes/auth.js";
import { boundariesRouter } from "./routes/boundaries.js";
import { softwareRouter } from "./routes/software.js";
import { startScheduler } from "./lib/scheduler.js";
import { userRouter } from "./routes/user.js";
import { trainingRouter } from "./routes/training.js";
import { certificatesRouter } from "./routes/certificates.js";
import { opportunitiesRouter } from "./routes/opportunities.js";
import { researchRouter } from "./routes/research.js";
import { contactRouter } from "./routes/contact.js";

const app = express();
app.disable("x-powered-by");

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "ok", service: "tanzania-geodata-hub-api" });
  } catch (err) {
    console.error("health check failed:", err.message);
    res.status(503).json({ status: "degraded", database: "unavailable", service: "tanzania-geodata-hub-api" });
  }
});

app.use("/api/datasets", datasetsRouter);
app.use("/api/ingest", ingestRouter);
app.use("/api", metaRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin", adminSoftwareRouter);
app.use("/api/auth", authRouter);
app.use("/api/me", userRouter);
app.use("/api/training", trainingRouter);
app.use("/api/certificates", certificatesRouter);
app.use("/api/opportunities", opportunitiesRouter);
app.use("/api/research", researchRouter);
app.use("/api/contact", contactRouter);
app.use("/api/boundaries", boundariesRouter);
app.use("/api/software", softwareRouter);

/** GET /robots.txt — SEO. */
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(
    "User-agent: *\n" +
      "Allow: /\n" +
      "Disallow: /admin\n" +
      "Disallow: /dashboard\n" +
      "Sitemap: http://localhost:4000/sitemap.xml\n"
  );
});

/** GET /sitemap.xml — dynamic sitemap from the database. */
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const [software, categories, datasets] = await Promise.all([
      prisma.software.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.softwareCategory.findMany({ select: { slug: true } }),
      prisma.dataset.findMany({ where: { status: { in: ["PUBLISHED", "APPROVED"] } }, select: { slug: true, updatedAt: true } }),
    ]);
    const urls = [
      { loc: "/", changefreq: "daily" },
      { loc: "/software", changefreq: "daily" },
      { loc: "/software/categories", changefreq: "weekly" },
      { loc: "/software/free", changefreq: "weekly" },
      { loc: "/software/students", changefreq: "weekly" },
      { loc: "/software/compare", changefreq: "weekly" },
      { loc: "/software/submit", changefreq: "monthly" },
      ...categories.map((c) => ({ loc: `/software/categories/${c.slug}`, changefreq: "weekly" })),
      ...software.map((s) => ({ loc: `/software/${s.slug}`, lastmod: s.updatedAt?.toISOString?.(), changefreq: "monthly" })),
      ...datasets.map((d) => (d.slug ? { loc: `/datasets/${d.slug}`, lastmod: d.updatedAt?.toISOString?.(), changefreq: "monthly" } : null)).filter(Boolean),
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(
        (u) =>
          `  <url>\n    <loc>http://localhost:4000${u.loc}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ""}    <changefreq>${u.changefreq}</changefreq>\n  </url>`
      )
      .join("\n")}\n</urlset>\n`;
    res.type("application/xml").send(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled API error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`GIS & Remote Sensing Hub API listening on http://localhost:${PORT}`);
  if (process.env.ENABLE_SCHEDULER !== "false") startScheduler();
});
