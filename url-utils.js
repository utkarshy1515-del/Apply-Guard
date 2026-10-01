const TRACKING_PARAMS = new Set([
  "fbclid", "gclid", "gh_src", "ref", "referrer", "source", "src",
  "trk", "trkinfo", "trackingid", "campaign", "campaignid"
]);

export function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.hash = "";
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";

    for (const key of [...url.searchParams.keys()]) {
      const lower = key.toLowerCase();
      if (lower.startsWith("utm_") || TRACKING_PARAMS.has(lower)) {
        url.searchParams.delete(key);
      }
    }

    url.searchParams.sort();
    return url.toString().replace(/\?$/, "");
  } catch {
    return rawUrl.split("#")[0].replace(/\/$/, "");
  }
}

export function applicationId(rawUrl) {
  const normalized = normalizeUrl(rawUrl);
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `job_${(hash >>> 0).toString(36)}`;
}

export function formatAppliedDate(isoDate, long = false) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, long
    ? { year: "numeric", month: "short", day: "numeric" }
    : { month: "short", day: "numeric" }
  ).format(date);
}
