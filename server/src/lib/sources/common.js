/**
 * Shared, polite HTTP helpers for all source connectors.
 *
 * Enforces:
 *  - robots.txt (checked per URL, cached per host)
 *  - rate limits (minimum delay between requests per source)
 *  - a polite user agent
 *  - request timeouts
 */

import robotsParser from "robots-parser";

const DEFAULT_USER_AGENT =
  process.env.NBS_USER_AGENT || "TanzaniaGeoDataHub/1.0 (geospatial data catalogue)";

const robotsCache = new Map(); // host -> robots parser
const lastRequestAt = new Map(); // host -> timestamp

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function userAgentFor(sourceSlug) {
  return process.env[`${sourceSlug.toUpperCase()}_USER_AGENT`] || DEFAULT_USER_AGENT;
}

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

async function robotsFor(host) {
  if (robotsCache.has(host)) return robotsCache.get(host);
  let parser = null;
  try {
    const res = await fetch(`https://${host}/robots.txt`, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": DEFAULT_USER_AGENT },
    });
    if (res.ok) parser = robotsParser(`https://${host}/robots.txt`, await res.text());
  } catch {
    parser = null; // no robots.txt -> assume allowed
  }
  robotsCache.set(host, parser);
  return parser;
}

/** Check robots.txt for the URL using the given user agent. */
export async function isAllowedByRobots(url, userAgent) {
  const host = hostOf(url);
  const parser = await robotsFor(host);
  if (!parser) return true;
  return parser.isAllowed(url, userAgent) !== false;
}

/**
 * Polite fetch: robots check + per-host rate limiting + timeout.
 * @param {string} url
 * @param {object} options - fetch options
 * @param {object} opts - { source: "nbs", minDelayMs: 1500 }
 */
export async function politeFetch(url, options = {}, { source = "generic", minDelayMs = 1500 } = {}) {
  const ua = userAgentFor(source);
  const host = hostOf(url);

  if (!(await isAllowedByRobots(url, ua))) {
    throw new Error(`BLOCKED_BY_ROBOTS: ${url}`);
  }

  const now = Date.now();
  const last = lastRequestAt.get(host) || 0;
  const wait = Math.max(0, minDelayMs - (now - last));
  if (wait > 0) await sleep(wait);
  lastRequestAt.set(host, Date.now());

  return fetch(url, {
    ...options,
    headers: {
      "User-Agent": ua,
      Accept: "application/json,text/html,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en",
      ...(options.headers || {}),
    },
    signal: options.signal || AbortSignal.timeout(20000),
  });
}

/** GET and return parsed JSON. */
export async function getJson(url, opts) {
  const res = await politeFetch(url, { headers: { Accept: "application/json" } }, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/** GET and return raw text (HTML/XML/RSS). */
export async function getText(url, opts) {
  const res = await politeFetch(url, {}, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/** HEAD (fallback GET) link verification. */
export async function verifyUrl(url, opts) {
  const started = Date.now();
  const result = {
    url,
    httpStatus: null,
    responseTimeMs: null,
    reachable: false,
    verifiedAt: new Date().toISOString(),
    method: "HEAD",
    error: null,
  };
  try {
    let res;
    try {
      res = await politeFetch(url, { method: "HEAD" }, { ...opts, minDelayMs: 0 });
    } catch {
      res = await politeFetch(url, { method: "GET" }, { ...opts, minDelayMs: 0 });
      result.method = "GET";
    }
    result.httpStatus = res.status;
    result.reachable = res.ok;
  } catch (err) {
    result.error = err.message;
    result.reachable = false;
  }
  result.responseTimeMs = Date.now() - started;
  return result;
}