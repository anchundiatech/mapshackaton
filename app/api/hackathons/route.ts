import { NextResponse } from "next/server";
import { getHackathons } from "@/app/lib/devpost";

// Regenerates in the background at most every 6h; requests inside that
// window are served the cached result instantly.
export const revalidate = 21600;

export async function GET() {
  try {
    const hackathons = await getHackathons();
    return NextResponse.json({ hackathons, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Failed to fetch hackathons from Devpost:", err);
    return NextResponse.json(
      { hackathons: [], fetchedAt: new Date().toISOString(), error: "upstream_unavailable" },
      { status: 502 }
    );
  }
}
