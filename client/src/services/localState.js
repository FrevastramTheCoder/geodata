const SAVED_KEY = "geodata-hub-saved-resources";

function read() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isSaved(resourceType, resourceId) {
  return read().some((item) => item.resourceType === resourceType && item.resourceId === resourceId);
}

export function toggleSaved(resourceType, resourceId) {
  const items = read();
  const index = items.findIndex((item) => item.resourceType === resourceType && item.resourceId === resourceId);
  if (index >= 0) items.splice(index, 1);
  else items.push({ resourceType, resourceId, savedAt: new Date().toISOString() });
  localStorage.setItem(SAVED_KEY, JSON.stringify(items));
  return index < 0;
}

export function getSavedResources() {
  return read();
}
