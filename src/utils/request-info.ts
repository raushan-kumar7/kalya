import { UAParser } from "ua-parser-js";

export interface DeviceInfo {
  browser: string;
  os: string;
  deviceType: string; // "desktop" | "mobile" | "tablet" | "unknown"
}

export interface LocationInfo {
  city: string;
  region: string;
  country: string;
  label: string; // "Chennai, Tamil Nadu, IN" style, ready to drop in an email
}

export function parseDevice(userAgent: string | null | undefined): DeviceInfo {
  if (!userAgent) {
    return { browser: "Unknown", os: "Unknown", deviceType: "unknown" };
  }
  const { browser, os, device } = UAParser(userAgent);
  return {
    browser:
      [browser.name, browser.version].filter(Boolean).join(" ") || "Unknown",
    os: [os.name, os.version].filter(Boolean).join(" ") || "Unknown",
    deviceType: device.type ?? "desktop",
  };
}

const UNKNOWN_LOCATION: LocationInfo = {
  city: "Unknown",
  region: "Unknown",
  country: "Unknown",
  label: "Unknown location",
};

function buildLabel(city: string, region: string, country: string): string {
  return (
    [city, region, country].filter((p) => p && p !== "Unknown").join(", ") ||
    "Unknown location"
  );
}

// If deployed on Vercel, geolocation is already resolved at the edge and
// handed to you as headers — free, no network round trip, no external
// dependency. Only present when actually running on Vercel's platform, so
// this is a no-op (returns null) everywhere else, including local dev and
// self-hosted/Docker deployments.
function getLocationFromVercelHeaders(
  headers: Headers | null | undefined,
): LocationInfo | null {
  if (!headers) return null;

  const city = headers.get("x-vercel-ip-city");
  const region = headers.get("x-vercel-ip-country-region");
  const country = headers.get("x-vercel-ip-country");

  if (!city && !region && !country) return null;

  // Vercel URL-encodes city names (e.g. spaces), unlike the fetch fallback
  const decodedCity = city ? decodeURIComponent(city) : "Unknown";
  const decodedRegion = region || "Unknown";
  const decodedCountry = country || "Unknown";

  return {
    city: decodedCity,
    region: decodedRegion,
    country: decodedCountry,
    label: buildLabel(decodedCity, decodedRegion, decodedCountry),
  };
}

// Fallback for anywhere that isn't Vercel: self-hosted, Docker, local dev.
// No library, no local database — just a plain fetch() to a free
// IP-geolocation API. ipwho.is has no key, no rate-limit auth, and
// supports HTTPS (unlike ip-api.com's free tier, which is HTTP-only).
async function getLocationFromApi(ip: string): Promise<LocationInfo> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://ipwho.is/${ip}`, {
      signal: controller.signal,
      cache: "no-store", // don't let Next.js cache someone's IP lookup as static data
    });
    clearTimeout(timeout);

    if (!res.ok) return UNKNOWN_LOCATION;

    const data = await res.json();
    if (!data?.success) return UNKNOWN_LOCATION;

    const city = data.city || "Unknown";
    const region = data.region || "Unknown";
    const country = data.country_code || data.country || "Unknown";

    return { city, region, country, label: buildLabel(city, region, country) };
  } catch {
    // Network hiccup, timeout, or API being down should degrade to
    // "Unknown location" in the email rather than block or crash the
    // sign-in flow — this is a nice-to-have detail, not worth failing over.
    return UNKNOWN_LOCATION;
  }
}

// Tries Vercel's free geo headers first; only reaches for the network
// fallback if they're absent (i.e. not running on Vercel).
export async function getLocationFromIp(
  ip: string | null | undefined,
  headers?: Headers | null,
): Promise<LocationInfo> {
  const fromVercel = getLocationFromVercelHeaders(headers);
  if (fromVercel) return fromVercel;

  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "Unknown IP") {
    return UNKNOWN_LOCATION;
  }

  return getLocationFromApi(ip);
}

// Extracts the first hop from x-forwarded-for, handling proxies/CDNs
export function extractIp(headers: Headers | null | undefined): string {
  if (!headers) return "Unknown IP";
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "Unknown IP";
}
