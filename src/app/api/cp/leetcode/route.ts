import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { LeetCodeStats } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    // LeetCode GraphQL API (free, public)
    const query = `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          profile {
            ranking
            reputation
            starRating
          }
          contributions {
            points
          }
        }
        userContestRanking(username: $username) {
          rating
          attendedContestsCount
          globalRanking
        }
      }
    `;

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`LeetCode API returned ${response.status}`);
    }

    const data = await response.json();
    const user = data?.data?.matchedUser;

    if (!user) {
      return NextResponse.json({ error: "User not found on LeetCode" }, { status: 404 });
    }

    const acStats = user.submitStats?.acSubmissionNum || [];
    const total = acStats.find((s: { difficulty: string }) => s.difficulty === "All");
    const easy = acStats.find((s: { difficulty: string }) => s.difficulty === "Easy");
    const medium = acStats.find((s: { difficulty: string }) => s.difficulty === "Medium");
    const hard = acStats.find((s: { difficulty: string }) => s.difficulty === "Hard");

    const contestData = data?.data?.userContestRanking;

    const stats: LeetCodeStats = {
      username,
      totalSolved: total?.count ?? 0,
      easySolved: easy?.count ?? 0,
      mediumSolved: medium?.count ?? 0,
      hardSolved: hard?.count ?? 0,
      ranking: user.profile?.ranking ?? 0,
      contributionPoints: user.contributions?.points ?? 0,
      reputation: user.profile?.reputation ?? 0,
      submissionCalendar: {},
      acceptanceRate:
        total?.submissions > 0
          ? Math.round((total.count / total.submissions) * 100 * 10) / 10
          : 0,
      contestRating: contestData?.rating ?? 0,
      contestAttended: contestData?.attendedContestsCount ?? 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("LeetCode API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch LeetCode data" },
      { status: 500 }
    );
  }
}
