/**
 * Link verification — sends HEAD (fallback GET) to a URL and reports
 * HTTP status, response time, reachability and verification timestamp.
 */

export async function verifyUrl(url) {
  const started = Date.now();
  const result = {
    url,
    httpStatus: null,
    responseTimeMs: null,
    reachable: false,
    finalUrl: null,
    verifiedAt: new Date().toISOString(),
    method: "HEAD",
    error: null,
  };

  try {
    let res;
    try {
      res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
        headers: { "User-Agent": "TanzaniaGeoDataHub/1.0 (+admin link check)" },
      });
    } catch (headErr) {
      // Some servers reject HEAD -> fall back to GET (no body retained).
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
        headers: { "User-Agent": "TanzaniaGeoDataHub/1.0 (+admin link check)" },
      });
      result.method = "GET";
    }
    result.httpStatus = res.status;
    result.reachable = res.ok;
    result.finalUrl = res.url || url;
  } catch (err) {
    result.error = err.cause?.code || err.message;
    result.reachable = false;
  }
  result.responseTimeMs = Date.now() - started;
  return result;
}
