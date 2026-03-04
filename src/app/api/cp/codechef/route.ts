import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { CodeChefStats } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    // Primary: competeapi.vercel.app (working as of 2026)
    const response = await fetch(
      `https://competeapi.vercel.app/user/codechef/${encodeURIComponent(username)}`,
      {
        next: { revalidate: 3600 },
        headers: { "Accept": "application/json" },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "User not found on CodeChef" },
        { status: 404 }
      );
    }

    const data = await response.json();

    // API returns error object or empty on unknown user
    if (!data || data.error || !data.username) {
      return NextResponse.json(
        { error: "User not found on CodeChef" },
        { status: 404 }
      );
    }

    // rating_number is numeric, rating is star string e.g. "3★"
    const ratingNumber = data.rating_number ?? 0;

    // Star mapping from rating (fallback if API doesn't provide it)
    const getStars = (rating: number): string => {
      if (rating >= 2500) return "7★";
      if (rating >= 2200) return "6★";
      if (rating >= 2000) return "5★";
      if (rating >= 1800) return "4★";
      if (rating >= 1600) return "3★";
      if (rating >= 1400) return "2★";
      return "1★";
    };

    // global_rank / country_rank can be "Inactive" — normalise to 0
    const parseRank = (val: unknown): number => {
      if (typeof val === "number") return val;
      if (typeof val === "string" && /^\d+$/.test(val)) return parseInt(val, 10);
      return 0;
    };

    const stats: CodeChefStats = {
      username: data.username ?? username,
      rating: ratingNumber,
      stars: data.rating ?? getStars(ratingNumber),
      highestRating: data.max_rank ?? ratingNumber,
      globalRank: parseRank(data.global_rank),
      countryRank: parseRank(data.country_rank),
      // competeapi doesn't expose problem counts — default to 0
      totalSolved: 0,
      fullySolved: 0,
      partiallySolved: 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("CodeChef API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch CodeChef data" },
      { status: 500 }
    );
  }
}

