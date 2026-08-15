import prisma from "./prisma.js";

const ACTIONS = new Set([
  "LOGIN",
  "LOGOUT",
  "VIEW_DATASET",
  "VIEW_SOFTWARE",
  "SEARCH",
  "SUBMIT_DATASET",
  "SUBMIT_SOFTWARE",
  "ADD_FAVORITE",
  "REMOVE_FAVORITE",
]);

/** Record a minimal, non-sensitive user event. Logging is intentionally best-effort. */
export function recordActivity({ userId, action, resourceType = null, resourceId = null, datasetId = null, softwareId = null }) {
  if (!userId || !ACTIONS.has(action)) return Promise.resolve(null);
  return prisma.activityLog
    .create({
      data: {
        userId,
        action,
        resourceType: resourceType ? String(resourceType).slice(0, 80) : null,
        resourceId: resourceId ? String(resourceId).slice(0, 200) : null,
        datasetId,
        softwareId,
      },
    })
    .catch(() => null);
}

export function recordView({ userId, resourceType, resourceId, datasetId = null, softwareId = null }) {
  if (!userId) return Promise.resolve(null);
  return Promise.all([
    recordActivity({ userId, action: resourceType === "DATASET" ? "VIEW_DATASET" : "VIEW_SOFTWARE", resourceType, resourceId, datasetId, softwareId }),
    prisma.recentlyViewed.upsert({
      where: { userId_resourceType_resourceId: { userId, resourceType, resourceId } },
      update: { viewedAt: new Date(), datasetId, softwareId },
      create: { userId, resourceType, resourceId, datasetId, softwareId },
    }).catch(() => null),
  ]).then(([activity]) => activity);
}

export { ACTIONS };
