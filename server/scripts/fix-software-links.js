import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const FIXES = [
  { slug: "envi", officialWebsite: "https://www.nv5geospatialsoftware.com/Products/ENVI", downloadUrl: "https://www.nv5geospatialsoftware.com/Products/ENVI", documentationUrl: null },
  { slug: "gvsig", downloadUrl: "https://www.gvsig-services.com/products/gvsig-desktop/downloads", documentationUrl: "https://www.gvsig.com/en/documentation" },
  { slug: "archicad", downloadUrl: "https://graphisoft.com/archicad" },
  { slug: "bricscad", downloadUrl: "https://www.bricsys.com/" },
  { slug: "cesiumjs", documentationUrl: "https://cesium.com/learn/" },
  { slug: "grass-gis", documentationUrl: "https://grass.osgeo.org/grass-stable/manuals/" },
  { slug: "mapwindow", downloadUrl: "https://www.mapwindow.org/", documentationUrl: "https://github.com/MapWindow/MapWindow5/wiki" },
  { slug: "pix4dmapper", downloadUrl: "https://www.pix4d.com/product/pix4dmapper-photogrammetry-software/" },
  { slug: "spss", documentationUrl: null },
  { slug: "sketchup", downloadUrl: "https://www.sketchup.com/" },
  { slug: "topcon-magnet", officialWebsite: "https://www.topconpositioning.com/", downloadUrl: "https://www.topconpositioning.com/" },
  { slug: "vectorworks", documentationUrl: "https://www.vectorworks.net/support" },
  { slug: "rhino", documentationUrl: "https://www.rhino3d.com/learn/" },
];

async function main() {
  for (const f of FIXES) {
    const s = await prisma.software.findUnique({ where: { slug: f.slug } });
    if (!s) { console.log(`MISSING ${f.slug}`); continue; }
    const data = { verificationStatus: "UNKNOWN", lastVerifiedAt: null };
    for (const k of ["officialWebsite", "downloadUrl", "documentationUrl"]) {
      if (k in f) data[k] = f[k];
    }
    await prisma.software.update({ where: { slug: f.slug }, data });
    console.log(`fixed ${f.slug}`);
  }
  const dev = await prisma.developer.update({
    where: { slug: "l3harris-geospatial" },
    data: { name: "NV5 Geospatial", website: "https://www.nv5geospatialsoftware.com", description: "Developer of ENVI remote sensing software (formerly L3Harris Geospatial)." },
  });
  console.log(`developer updated: ${dev.name}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());