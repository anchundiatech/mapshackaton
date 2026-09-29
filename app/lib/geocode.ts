import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), ".cache", "geocode-cache.json");
// Nominatim usage policy: max ~1 req/sec, single thread, identifying User-Agent.
const MIN_DELAY_MS = 1100;
// Cap wall-clock time spent on *new* lookups per invocation so a cold cache
// doesn't stall the request for minutes. Cached hits resolve instantly.
const TIME_BUDGET_MS = 12_000;

type GeoResult = { lat: number; lng: number; city: string; country: string } | null;
type Cache = Record<string, GeoResult>;

let memoryCache: Cache | null = null;

function loadCache(): Cache {
  if (memoryCache) return memoryCache;
  try {
    memoryCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    memoryCache = {};
  }
  return memoryCache!;
}

function saveCache(cache: Cache) {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch {
    // Non-fatal: cache is a perf optimization, not a correctness requirement.
  }
}

async function lookupNominatim(query: string): Promise<GeoResult> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "mapshackaton/1.0 (https://github.com/anchundiatech/mapshackaton)",
      "Accept-Language": "en",
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = Array.isArray(data) ? data[0] : null;
  if (!hit) return null;

  const address = hit.address ?? {};
  const city = address.city || address.town || address.village || address.county || hit.display_name?.split(",")[0] || "";
  const country = address.country || "";

  return {
    lat: parseFloat(hit.lat),
    lng: parseFloat(hit.lon),
    city,
    country,
  };
}

/**
 * Resolves free-text venue/location strings to coordinates, backed by an
 * on-disk cache so Nominatim is only ever hit for locations we haven't seen
 * before. New lookups are rate-limited (1 req/sec) and bounded by a time
 * budget per batch call; anything not resolved within the budget comes back
 * as null and is retried on a later run once it's in the queue again.
 */
export async function geocodeBatch(queries: string[]): Promise<Map<string, GeoResult>> {
  const cache = loadCache();
  const results = new Map<string, GeoResult>();
  const unique = Array.from(new Set(queries.filter(Boolean)));

  const toFetch: string[] = [];
  for (const q of unique) {
    if (q in cache) {
      results.set(q, cache[q]);
    } else {
      toFetch.push(q);
    }
  }

  const deadline = Date.now() + TIME_BUDGET_MS;
  let dirty = false;

  for (const q of toFetch) {
    if (Date.now() >= deadline) break;
    let result: GeoResult = null;
    try {
      result = await lookupNominatim(q);
    } catch {
      result = null;
    }
    cache[q] = result;
    results.set(q, result);
    dirty = true;
    await new Promise((r) => setTimeout(r, MIN_DELAY_MS));
  }

  if (dirty) saveCache(cache);
  return results;
}
