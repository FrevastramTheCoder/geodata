import {
  getBoundaryDetail,
  getBoundaryTree,
  getDataSources,
  getDataset,
  getDatasetCategories,
  getDatasetStats,
  listDatasets,
  searchAdministrativeAreas,
} from "./services/datasetsApi.js";
import { getSoftware, getSoftwareCategories, getSoftwareStats, listSoftware } from "./services/softwareApi.js";
import { listOpportunities } from "./services/opportunitiesApi.js";
import { getSavedResources, isSaved, toggleSaved } from "./services/localState.js";

function queryFrom(path) {
  return new URL(path, "https://frontend.local");
}

function unsupported(message = "This action is not available in the frontend-only catalogue.") {
  return Promise.reject(new Error(message));
}

async function get(path) {
  const url = queryFrom(path);
  const pathname = url.pathname;
  const params = Object.fromEntries(url.searchParams.entries());

  if (pathname === "/stats") return getDatasetStats();
  if (pathname === "/categories") return getDatasetCategories();
  if (pathname === "/sources") return getDataSources();
  if (pathname === "/datasets") return listDatasets(params);
  if (pathname.startsWith("/datasets/")) return getDataset(decodeURIComponent(pathname.slice("/datasets/".length)));
  if (pathname === "/boundaries/tree") return { country: "Tanzania", maxLevel: "REGION", roots: getBoundaryTree(), total: getBoundaryTree().length };
  if (pathname === "/boundaries") {
    const items = params.q ? searchAdministrativeAreas(params.q) : getBoundaryTree();
    return { items, relatedDatasets: [], total: items.length, page: 1, perPage: items.length || 1, totalPages: 1 };
  }
  if (pathname.startsWith("/boundaries/")) return getBoundaryDetail(decodeURIComponent(pathname.slice("/boundaries/".length)));
  if (pathname === "/software") return listSoftware(params);
  if (pathname === "/software/categories") return getSoftwareCategories();
  if (pathname === "/software/stats") return getSoftwareStats();
  if (pathname.startsWith("/software/")) return getSoftware(decodeURIComponent(pathname.slice("/software/".length)));
  if (pathname === "/opportunities") return listOpportunities(params);
  if (pathname === "/research") return JSON.parse(localStorage.getItem("geodata-hub-research") || "[]");
  return unsupported();
}

function saveLocal(path, body) {
  const key = path === "/contact" ? "geodata-hub-contact" : "geodata-hub-research";
  const current = JSON.parse(localStorage.getItem(key) || "[]");
  const record = { ...body, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString(), status: "PENDING_REVIEW" };
  current.push(record);
  localStorage.setItem(key, JSON.stringify(current));
  return Promise.resolve(record);
}

export const api = {
  get,
  post: (path, body) => (path === "/contact" || path === "/research" || path === "/submissions" ? saveLocal(path, body) : unsupported()),
  patch: () => unsupported(),
  delete: () => unsupported(),
  auth: {
    config: () => Promise.resolve({ enabled: false, googleClientId: null }),
    login: () => unsupported("Accounts are not required for this public catalogue."),
    logout: () => Promise.resolve({ ok: true }),
    deleteAccount: () => unsupported(),
  },
  me: {
    profile: () => Promise.resolve(null),
    dashboard: () => Promise.resolve({ stats: {}, courses: [], recentlyViewed: [] }),
    favorites: () => Promise.resolve(getSavedResources()),
    addFavorite: (resourceType, resourceId) => Promise.resolve(toggleSaved(resourceType, resourceId)),
    removeFavorite: (resourceType, resourceId) => Promise.resolve(toggleSaved(resourceType, resourceId)),
    certificates: () => Promise.resolve([]),
  },
  software: {
    list: listSoftware,
    categories: getSoftwareCategories,
    stats: getSoftwareStats,
    detail: getSoftware,
    submit: (body) => saveLocal("/software-submissions", body),
  },
  opportunities: { list: listOpportunities },
  research: { list: () => get("/research"), submit: (body) => saveLocal("/research", body) },
  contact: { submit: (body) => saveLocal("/contact", body) },
  training: {
    list: () => Promise.resolve([]),
    detail: () => Promise.resolve(null),
    enroll: () => unsupported(),
    lesson: () => unsupported(),
    completeLesson: () => unsupported(),
  },
  certificates: {
    list: () => Promise.resolve([]),
    verify: () => unsupported("Certificate verification is provided by the issuing organization."),
  },
  adminSoftware: {
    list: () => unsupported(),
    create: () => unsupported(),
    update: () => unsupported(),
    remove: () => unsupported(),
    verify: () => unsupported(),
    submissions: () => unsupported(),
    approveSubmission: () => unsupported(),
    rejectSubmission: () => unsupported(),
    removeSubmission: () => unsupported(),
    categories: () => unsupported(),
    createCategory: () => unsupported(),
    updateCategory: () => unsupported(),
    removeCategory: () => unsupported(),
    developers: () => unsupported(),
    createDeveloper: () => unsupported(),
    updateDeveloper: () => unsupported(),
    removeDeveloper: () => unsupported(),
  },
};

export function datasetUrl(dataset) {
  return dataset?.slug || dataset?.id ? `/datasets/${encodeURIComponent(dataset.slug || dataset.id)}` : "/data";
}

export function isResourceSaved(resourceType, resourceId) {
  return isSaved(resourceType, resourceId);
}
