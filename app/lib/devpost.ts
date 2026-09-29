import { Hackathon } from "./types";
import { geocodeBatch } from "./geocode";

const DEVPOST_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

interface DevpostHackathon {
  id: number;
  title: string;
  displayed_location: { icon: string; location: string };
  open_state: string; // "open" | "upcoming" | "ended"
  url: string;
  submission_period_dates: string;
  themes: { id: number; name: string }[];
  prize_amount: string; // HTML fragment, e.g. "$<span ...>1,500</span>"
  prizes_counts: { cash: number; other: number };
  organization_name: string;
}

interface DevpostResponse {
  hackathons: DevpostHackathon[];
  meta: { total_count: number; per_page: number; fuzzy: boolean };
}

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

function parseDatePart(part: string, fallbackMonth?: string, fallbackYear?: string): string | null {
  const m = part.trim().match(/^(?:([A-Za-z]{3})[a-z]*\s+)?(\d{1,2})(?:,\s*(\d{4}))?$/);
  if (!m) return null;
  const month = m[1] ? MONTHS[m[1] as keyof typeof MONTHS] : fallbackMonth;
  const day = m[2].padStart(2, "0");
  const year = m[3] || fallbackYear;
  if (!month || !year) return null;
  return `${year}-${month}-${day}`;
}

/**
 * Devpost renders submission windows as one of:
 *   "Aug 23 - 27, 2026"              (same month)
 *   "Aug 22 - Sep 27, 2026"          (same year)
 *   "Aug 23, 2026 - Jan 02, 2027"    (crosses year)
 */
export function parseSubmissionPeriod(str: string): { startDate: string; endDate: string } | null {
  const [rawStart, rawEnd] = str.split(" - ").map((s) => s.trim());
  if (!rawStart || !rawEnd) return null;

  const endDate = parseDatePart(rawEnd);
  if (!endDate) return null;
  const [endYear, endMonth] = endDate.split("-");

  const startDate = parseDatePart(rawStart, endMonth, endYear);
  if (!startDate) return null;

  return { startDate, endDate };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function formatPrizes(h: DevpostHackathon): string {
  const amount = stripHtml(h.prize_amount);
  const hasCash = amount && amount !== "$0" && !/^\D*0$/.test(amount);
  const otherCount = h.prizes_counts?.other ?? 0;

  if (hasCash && otherCount > 0) return `${amount} + ${otherCount} premio(s) adicionales`;
  if (hasCash) return amount;
  if (otherCount > 0) return `${otherCount} premio(s) no monetarios`;
  return "Por anunciar";
}

async function fetchPage(status: "open" | "upcoming", page: number): Promise<DevpostResponse> {
  const url = `https://devpost.com/api/hackathons?status[]=${status}&order_by=recently-added&per_page=40&page=${page}`;
  const res = await fetch(url, {
    headers: { "User-Agent": DEVPOST_UA, Accept: "application/json" },
    // Matches the route-level `revalidate` so Next can treat / and
    // /api/hackathons as statically cacheable (ISR) instead of fully dynamic.
    next: { revalidate: 21600 },
  });
  if (!res.ok) throw new Error(`Devpost API returned ${res.status}`);
  return res.json();
}

async function fetchStatus(status: "open" | "upcoming", maxPages: number): Promise<DevpostHackathon[]> {
  const all: DevpostHackathon[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const data = await fetchPage(status, page);
    all.push(...data.hackathons);
    if (all.length >= data.meta.total_count || data.hackathons.length === 0) break;
  }
  return all;
}

const VIRTUAL_LOCATION = { lat: 20, lng: -30, city: "Virtual", country: "Global" };

export async function getHackathons(): Promise<Hackathon[]> {
  const [openRaw, upcomingRaw] = await Promise.all([
    fetchStatus("open", 2),
    fetchStatus("upcoming", 1),
  ]);
  const raw = [...openRaw, ...upcomingRaw];

  const venueQueries = raw
    .filter((h) => h.displayed_location.icon !== "globe")
    .map((h) => h.displayed_location.location);
  const geocoded = await geocodeBatch(venueQueries);

  const hackathons: Hackathon[] = [];

  for (const h of raw) {
    const dates = parseSubmissionPeriod(h.submission_period_dates);
    if (!dates) continue; // skip entries we can't reliably date

    const isVirtual = h.displayed_location.icon === "globe";
    const geo = isVirtual ? null : geocoded.get(h.displayed_location.location) ?? null;

    hackathons.push({
      id: String(h.id),
      name: h.title.trim(),
      description: `Organizado por ${h.organization_name}. Categorías: ${
        h.themes.map((t) => t.name).join(", ") || "General"
      }.`,
      organizer: h.organization_name,
      websiteUrl: h.url,
      startDate: dates.startDate,
      endDate: dates.endDate,
      status: h.open_state === "open" ? "active" : "upcoming",
      type: isVirtual ? "virtual" : "in-person",
      location: isVirtual
        ? VIRTUAL_LOCATION
        : {
            lat: geo?.lat ?? null,
            lng: geo?.lng ?? null,
            city: geo?.city || h.displayed_location.location,
            country: geo?.country || "",
          },
      prizes: formatPrizes(h),
      categories: h.themes.length ? h.themes.map((t) => t.name) : ["General"],
    });
  }

  return hackathons;
}
