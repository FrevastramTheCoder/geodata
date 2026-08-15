import { OPPORTUNITY_RESOURCES } from "../data/externalResources.js";
import { externalApiUrl, fetchJson } from "./externalFetch.js";

const configuredUrl = externalApiUrl(import.meta.env?.VITE_OPPORTUNITIES_API_URL);

function filterOpportunities(items, { q = "", category = "" } = {}) {
  const term = String(q).trim().toLowerCase();
  return items.filter((item) => {
    if (category && item.category !== category) return false;
    return !term || `${item.title} ${item.description} ${item.organization} ${item.category}`.toLowerCase().includes(term);
  });
}

export async function listOpportunities(params = {}) {
  if (configuredUrl) {
    try {
      const payload = await fetchJson(configuredUrl);
      const items = Array.isArray(payload) ? payload : payload.items || payload.results || [];
      return filterOpportunities(items, params);
    } catch {
      // The official-link registry keeps the public page usable when an API is unavailable.
    }
  }
  return filterOpportunities(OPPORTUNITY_RESOURCES, params);
}
