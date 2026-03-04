import { NextResponse } from "next/server";
import { fetchAllContests } from "@/lib/contests";

// Cache this route for 30 minutes in production (ISR)
export const revalidate = 1800;

export async function GET() {
  const { contests, byPlatform } = await fetchAllContests();
  return NextResponse.json({ contests, byPlatform });
}
