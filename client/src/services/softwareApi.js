import { SOFTWARE_RESOURCES } from "../data/externalResources.js";
import { fetchJson, externalApiUrl } from "./externalFetch.js";

const configuredUrl = externalApiUrl(import.meta.env?.VITE_SOFTWARE_API_URL);

function matches(item, params) {
  const q = String(params.q || "").trim().toLowerCase();
  if (q && ![item.name, item.description, item.provider, item.category?.name, ...(item.technology || [])].join(" ").toLowerCase().includes(q)) return false;
  if (params.category && item.category?.slug !== params.category) return false;
  if (params.license && item.licenseType !== String(params.license).toUpperCase()) return false;
  if (params.os && !(item.operatingSystems || []).includes(params.os)) return false;
  if (params.free === "true" && !item.isFree) return false;
  if (params.student === "true" && !item.isStudentFriendly) return false;
  return true;
}

async function externalSoftware(params) {
  if (!configuredUrl) return null;
  try {
    const payload = await fetchJson(configuredUrl);
    const items = Array.isArray(payload) ? payload : payload.items || payload.results || [];
    return items.filter((item) => matches(item, params));
  } catch {
    return null;
  }
}

function sortItems(items, sort) {
  const copy = [...items];
  if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "newest") return copy.reverse();
  if (sort === "free" || sort === "open") return copy.sort((a, b) => Number(b.isFree) - Number(a.isFree));
  return copy.sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
}

export async function listSoftware(params = {}) {
  const items = (await externalSoftware(params)) || SOFTWARE_RESOURCES.filter((item) => matches(item, params));
  const sorted = sortItems(items, params.sort || "popular");
  const perPage = Math.max(1, Number(params.perPage) || 24);
  const page = Math.max(1, Number(params.page) || 1);
  const start = (page - 1) * perPage;
  return { items: sorted.slice(start, start + perPage), total: sorted.length, page, perPage };
}

export function getSoftware(slug) {
  return SOFTWARE_RESOURCES.find((item) => item.slug === slug || item.id === slug) || null;
}

export function getSoftwareCategories() {
  const map = new Map();
  SOFTWARE_RESOURCES.forEach((item) => {
    const current = map.get(item.category.slug) || { ...item.category, _count: { software: 0 } };
    current._count.software += 1;
    map.set(item.category.slug, current);
  });
  return [...map.values()];
}

export function getSoftwareStats() {
  const items = SOFTWARE_RESOURCES;
  return {
    total: items.length,
    free: items.filter((item) => item.isFree).length,
    openSource: items.filter((item) => item.licenseType === "OPEN_SOURCE").length,
    student: items.filter((item) => item.isStudentFriendly).length,
    categories: getSoftwareCategories().length,
    verified: items.filter((item) => item.sourceType === "external-link").length,
  };
}
