import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { CodeforcesStats } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    // Codeforces public API (free)
    const [userResponse, submissionsResponse] = await Promise.all([
      fetch(
        `https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}&from=1&count=10000`,
        { next: { revalidate: 3600 } }
      ),
    ]);

    if (!userResponse.ok) {
      throw new Error(`Codeforces API returned ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    if (userData.status !== "OK" || !userData.result?.length) {
      return NextResponse.json(
        { error: "User not found on Codeforces" },
        { status: 404 }
      );
    }

    const cf = userData.result[0];

    // Count distinct solved problems
    let problemsSolved = 0;
    if (submissionsResponse.ok) {
      const subData = await submissionsResponse.json();
      if (subData.status === "OK") {
        const solvedSet = new Set<string>();
        for (const sub of subData.result) {
          if (sub.verdict === "OK") {
            solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
          }
        }
        problemsSolved = solvedSet.size;
      }
    }

    const stats: CodeforcesStats = {
      handle: cf.handle,
      rating: cf.rating ?? 0,
      maxRating: cf.maxRating ?? 0,
      rank: cf.rank ?? "unrated",
      maxRank: cf.maxRank ?? "unrated",
      contribution: cf.contribution ?? 0,
      friendOfCount: cf.friendOfCount ?? 0,
      titlePhoto: cf.titlePhoto ?? "",
      totalSolved: problemsSolved,
      problemsSolved,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Codeforces API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Codeforces data" },
      { status: 500 }
    );
  }
}
