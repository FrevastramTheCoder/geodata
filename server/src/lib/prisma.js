import { loadEnvFile } from "node:process";

import { PrismaClient } from "@prisma/client";

try {
  // Keep direct `node src/index.js` starts consistent with the npm scripts.
  loadEnvFile(new URL("../../.env", import.meta.url));
} catch {
  // Production deployments normally provide environment variables directly.
}

const prisma = new PrismaClient();

export default prisma;
