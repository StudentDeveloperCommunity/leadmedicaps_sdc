import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calcCPScore, getTotalSolved } from "@/lib/cp-score";
import type {
  LeetCodeStats,
  CodeforcesStats,
  CodeChefStats,
} from "@/types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { leetcode_username, codeforces_username, codechef_username } = body;

  // Parallel fetch all platforms
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const fetches: Promise<Response>[] = [];
  if (leetcode_username) {
    fetches.push(fetch(`${baseUrl}/api/cp/leetcode?username=${leetcode_username}`));
  }
  if (codeforces_username) {
    fetches.push(fetch(`${baseUrl}/api/cp/codeforces?username=${codeforces_username}`));
  }
  if (codechef_username) {
    fetches.push(fetch(`${baseUrl}/api/cp/codechef?username=${codechef_username}`));
  }

  const results = await Promise.allSettled(fetches);
  
  let lcStats: LeetCodeStats | null = null;
  let cfStats: CodeforcesStats | null = null;
  let ccStats: CodeChefStats | null = null;

  let idx = 0;
  if (leetcode_username) {
    const res = results[idx++];
    if (res.status === "fulfilled" && res.value.ok) {
      lcStats = await res.value.json();
    }
  }
  if (codeforces_username) {
    const res = results[idx++];
    if (res.status === "fulfilled" && res.value.ok) {
      cfStats = await res.value.json();
    }
  }
  if (codechef_username) {
    const res = results[idx++];
    if (res.status === "fulfilled" && res.value.ok) {
      ccStats = await res.value.json();
    }
  }

  const scoreBreakdown = calcCPScore(lcStats, cfStats, ccStats);
  const totalSolved = getTotalSolved(lcStats, cfStats, ccStats);

  // Update profile in DB
  const { error } = await supabase
    .from("profiles")
    .update({
      leetcode_stats: lcStats as unknown as Record<string, unknown>,
      codeforces_stats: cfStats as unknown as Record<string, unknown>,
      codechef_stats: ccStats as unknown as Record<string, unknown>,
      cp_score: scoreBreakdown.totalScore,
      total_solved: totalSolved,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    scores: scoreBreakdown,
    totalSolved,
    leetcode: lcStats,
    codeforces: cfStats,
    codechef: ccStats,
  });
}
